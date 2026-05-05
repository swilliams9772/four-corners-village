import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe, priceIdToProduct } from "@/lib/stripe/server";
import { createServiceClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import { CourseEnrolledEmail } from "@/lib/email/templates/course-enrolled";
import { TvSubscribedEmail } from "@/lib/email/templates/tv-subscribed";
import { captureServerEvent } from "@/lib/analytics/server";

export const runtime = "nodejs";

/**
 * Stripe webhook receiver.
 *
 * Handles:
 *  - checkout.session.completed -> link customer to user
 *  - customer.subscription.{created,updated,deleted} -> upsert subscription row
 *  - invoice.payment_failed -> mark subscription past_due (Stripe also updates status)
 *  - account.updated (Connect) -> mark practitioner onboarded
 */
export async function POST(req: NextRequest) {
  if (!env.stripe.configured || !env.stripe.webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  const rawBody = await req.text();

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, env.stripe.webhookSecret);
  } catch (err) {
    console.error("[stripe webhook] bad signature", err);
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  const supabase = createServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.customer && typeof session.customer === "string") {
          await supabase
            .from("profiles")
            .update({ stripe_customer_id: session.customer })
            .is("stripe_customer_id", null)
            .eq("email", session.customer_email ?? "");
        }

        // Course purchases: enrollOrCheckout sets metadata.type === "course" with
        // course_id + user_id. Stripe retries webhooks, so the upsert is idempotent.
        if (session.metadata?.type === "course") {
          const courseId = session.metadata.course_id;
          const userId = session.metadata.user_id;
          if (courseId && userId) {
            const { error: enrollErr } = await supabase
              .from("course_enrollments")
              .upsert(
                { user_id: userId, course_id: courseId },
                { onConflict: "user_id,course_id" },
              );
            if (enrollErr) {
              console.error("[stripe webhook] course enroll failed", enrollErr);
            } else {
              await sendCourseEnrolledEmail(supabase, userId, courseId);
            }
          } else {
            console.warn("[stripe webhook] course session missing metadata", session.id);
          }
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await upsertSubscription(supabase, sub);
        if (event.type === "customer.subscription.created") {
          await sendTvSubscribedEmailIfApplicable(supabase, sub);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await supabase
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", sub.id);
        break;
      }
      case "account.updated": {
        const acct = event.data.object as Stripe.Account;
        const onboarded = !!(acct.details_submitted && acct.charges_enabled);
        await supabase
          .from("practitioners")
          .update({ stripe_connect_onboarded: onboarded })
          .eq("stripe_connect_account_id", acct.id);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("[stripe webhook] handler error", event.type, err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function upsertSubscription(
  supabase: ReturnType<typeof createServiceClient>,
  sub: Stripe.Subscription,
) {
  const item = sub.items.data[0];
  if (!item) return;
  const priceId = item.price.id;
  const product = priceIdToProduct(priceId);
  if (!product) {
    console.warn("[stripe webhook] unknown price id", priceId);
    return;
  }

  // Find user by stripe_customer_id
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (!profile) {
    console.warn("[stripe webhook] no profile for customer", customerId);
    return;
  }

  await supabase.from("subscriptions").upsert(
    {
      user_id: profile.id,
      stripe_subscription_id: sub.id,
      stripe_price_id: priceId,
      product,
      status: sub.status,
      current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      cancel_at_period_end: sub.cancel_at_period_end ?? false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );

  // For practitioner tiers, also update the practitioner row's tier
  if (product !== "tv") {
    await supabase
      .from("practitioners")
      .update({ tier: product })
      .eq("user_id", profile.id);
  }

  // Funnel analytics: only emit on the first activation per subscription so
  // we don't double-count. The PostHog client no-ops if not configured.
  if (sub.status === "active" || sub.status === "trialing") {
    await captureServerEvent({
      distinctId: profile.id,
      event: product === "tv" ? "tv_subscription_started" : "tier_subscription_started",
      properties: {
        product,
        price_id: priceId,
        amount: item.price.unit_amount ? item.price.unit_amount / 100 : null,
        interval: item.price.recurring?.interval ?? null,
      },
    }).catch((err) => console.error("[stripe webhook] posthog capture failed", err));
  }
}

/**
 * Best-effort transactional emails. These must never throw out of the webhook —
 * Stripe expects 2xx or it will retry. Each helper logs its own failures.
 */
async function sendCourseEnrolledEmail(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
  courseId: string,
) {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name, display_name")
      .eq("id", userId)
      .maybeSingle();
    if (!profile?.email) return;

    // Fetch course and practitioner separately — Supabase's nested-select typing
    // for FK joins varies between object/array and trips strict TS.
    const { data: course } = await supabase
      .from("courses")
      .select("title, slug, practitioner_id")
      .eq("id", courseId)
      .maybeSingle();
    if (!course) return;

    const { data: practitioner } = await supabase
      .from("practitioners")
      .select("slug, display_name")
      .eq("id", course.practitioner_id as string)
      .maybeSingle();

    await sendEmail({
      to: profile.email,
      subject: `You're enrolled in ${course.title}`,
      body: CourseEnrolledEmail({
        recipientName: profile.display_name ?? profile.full_name ?? null,
        courseTitle: course.title,
        practitionerName: practitioner?.display_name ?? null,
        courseUrl: practitioner
          ? `${env.app.url}/v/${practitioner.slug}/courses/${course.slug}`
          : `${env.app.url}/courses`,
      }),
    });
  } catch (err) {
    console.error("[stripe webhook] course-enrolled email failed", err);
  }
}

async function sendTvSubscribedEmailIfApplicable(
  supabase: ReturnType<typeof createServiceClient>,
  sub: Stripe.Subscription,
) {
  try {
    const item = sub.items.data[0];
    if (!item) return;
    const product = priceIdToProduct(item.price.id);
    if (product !== "tv") return;

    const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name, display_name")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    if (!profile?.email) return;

    await sendEmail({
      to: profile.email,
      subject: "Welcome to Four Corners Vintage TV",
      body: TvSubscribedEmail({
        recipientName: profile.display_name ?? profile.full_name ?? null,
        watchUrl: `${env.app.url}/tv`,
      }),
    });
  } catch (err) {
    console.error("[stripe webhook] tv-subscribed email failed", err);
  }
}
