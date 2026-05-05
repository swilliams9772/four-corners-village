"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { createConnectedCheckout } from "@/lib/stripe/connect";
import { getStripe } from "@/lib/stripe/server";
import { env } from "@/lib/env";

export async function enrollOrCheckout(formData: FormData) {
  const session = await getCurrentUser();
  if (!session) redirect("/login");

  const courseId = String(formData.get("course_id") ?? "");
  if (!courseId) throw new Error("Missing course id");

  const supabase = createServiceClient();
  const { data: course } = await supabase
    .from("courses")
    .select("*, practitioners(*)")
    .eq("id", courseId)
    .single();
  if (!course) throw new Error("Course not found");

  // Free course - direct enroll
  if (course.price_cents === 0) {
    await supabase
      .from("course_enrollments")
      .upsert({ user_id: session.user.id, course_id: courseId });
    revalidatePath("/courses");
    redirect(`/courses`);
  }

  // Paid course - create connected checkout
  const practitioner = course.practitioners as {
    stripe_connect_account_id: string | null;
    stripe_connect_onboarded: boolean;
  };
  if (!practitioner?.stripe_connect_account_id || !practitioner.stripe_connect_onboarded) {
    throw new Error("Practitioner has not completed Stripe onboarding");
  }

  const stripe = getStripe();
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, email")
    .eq("id", session.user.id)
    .single();

  let customerId = profile?.stripe_customer_id;
  if (!customerId) {
    const cust = await stripe.customers.create({
      email: profile?.email ?? session.user.email,
      metadata: { supabase_user_id: session.user.id },
    });
    customerId = cust.id;
    await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", session.user.id);
  }

  const checkout = await createConnectedCheckout({
    customerId,
    practitionerStripeAccountId: practitioner.stripe_connect_account_id,
    amountCents: course.price_cents,
    productName: course.title,
    successUrl: `${env.app.url}/courses?enrolled=${courseId}`,
    cancelUrl: `${env.app.url}/dashboard`,
    metadata: {
      type: "course",
      course_id: courseId,
      user_id: session.user.id,
    },
  });

  if (!checkout.url) throw new Error("Could not create checkout");
  redirect(checkout.url);
}
