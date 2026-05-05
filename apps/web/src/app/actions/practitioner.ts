"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { getStripe } from "@/lib/stripe/server";
import { env } from "@/lib/env";
import { slugify } from "@/lib/utils";
import { sendEmail } from "@/lib/email";
import { PractitionerApprovedEmail } from "@/lib/email/templates/practitioner-approved";

const applySchema = z.object({
  display_name: z.string().min(1).max(120),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(3).max(60),
  tagline: z.string().max(140).optional(),
  bio: z.string().max(2000).optional(),
  primary_direction: z.enum(["east", "south", "west", "north"]),
  tier: z.enum(["initiate", "guide", "sanctuary"]),
  modalities: z.string().optional(),
});

export async function applyAsPractitioner(formData: FormData) {
  const session = await getCurrentUser();
  if (!session) throw new Error("Not authenticated");

  const parsed = applySchema.safeParse({
    display_name: formData.get("display_name"),
    slug: formData.get("slug"),
    tagline: formData.get("tagline") ?? undefined,
    bio: formData.get("bio") ?? undefined,
    primary_direction: formData.get("primary_direction"),
    tier: formData.get("tier"),
    modalities: formData.get("modalities") ?? undefined,
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const supabase = createServiceClient();
  const modalities = parsed.data.modalities
    ?.split(",")
    .map((m) => m.trim())
    .filter(Boolean) ?? [];

  const { error } = await supabase.from("practitioners").upsert(
    {
      user_id: session.user.id,
      display_name: parsed.data.display_name,
      slug: parsed.data.slug,
      tagline: parsed.data.tagline ?? null,
      bio: parsed.data.bio ?? null,
      primary_direction: parsed.data.primary_direction,
      tier: parsed.data.tier,
      modalities,
      status: "pending",
    },
    { onConflict: "user_id" },
  );
  if (error) throw new Error(error.message);

  await supabase.from("profiles").update({ role: "practitioner" }).eq("id", session.user.id);

  revalidatePath("/dashboard");
  redirect("/practitioner/onboarding");
}

/**
 * Create or resume a Stripe Connect Express onboarding flow.
 * Practitioner is redirected to Stripe and back to /practitioner/onboarding.
 */
export async function startStripeConnectOnboarding() {
  const session = await getCurrentUser();
  if (!session) throw new Error("Not authenticated");

  const supabase = createServiceClient();
  const { data: practitioner } = await supabase
    .from("practitioners")
    .select("*")
    .eq("user_id", session.user.id)
    .maybeSingle();
  if (!practitioner) throw new Error("Apply as a practitioner first");

  const stripe = getStripe();

  let accountId = practitioner.stripe_connect_account_id as string | null;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: session.user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
      metadata: { user_id: session.user.id, practitioner_id: practitioner.id },
    });
    accountId = account.id;
    await supabase
      .from("practitioners")
      .update({ stripe_connect_account_id: accountId })
      .eq("id", practitioner.id);
  }

  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${env.app.url}/practitioner/onboarding`,
    return_url: `${env.app.url}/practitioner/onboarding?return=1`,
    type: "account_onboarding",
  });

  redirect(link.url);
}

export async function approvePractitioner(practitionerId: string) {
  const session = await getCurrentUser();
  if (!session?.isAdmin) throw new Error("Forbidden");
  const supabase = createServiceClient();

  const { data: practitioner } = await supabase
    .from("practitioners")
    .select("id, slug, display_name, user_id, status")
    .eq("id", practitionerId)
    .maybeSingle();
  if (!practitioner) throw new Error("Practitioner not found");

  const wasAlreadyApproved = practitioner.status === "approved";

  await supabase
    .from("practitioners")
    .update({ status: "approved" })
    .eq("id", practitionerId);

  // Only notify on the transition from non-approved -> approved so
  // re-clicking the button doesn't spam practitioners.
  if (!wasAlreadyApproved) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", practitioner.user_id as string)
        .maybeSingle();
      if (profile?.email) {
        await sendEmail({
          to: profile.email,
          subject: "Your Four Corners Village application is approved",
          body: PractitionerApprovedEmail({
            practitionerName: practitioner.display_name as string,
            spaceUrl: `${env.app.url}/v/${practitioner.slug}`,
            onboardingUrl: `${env.app.url}/practitioner/onboarding`,
          }),
        });
      }
    } catch (err) {
      console.error("[practitioner] approval email failed", err);
    }
  }

  revalidatePath("/admin/practitioners");
}

export async function rejectPractitioner(practitionerId: string) {
  const session = await getCurrentUser();
  if (!session?.isAdmin) throw new Error("Forbidden");
  const supabase = createServiceClient();
  await supabase
    .from("practitioners")
    .update({ status: "archived" })
    .eq("id", practitionerId);
  revalidatePath("/admin/practitioners");
}

const updateSpaceSchema = z.object({
  display_name: z.string().min(1).max(120).optional(),
  tagline: z.string().max(140).optional(),
  bio: z.string().max(2000).optional(),
});

export async function updatePractitionerSpace(formData: FormData): Promise<void> {
  const session = await getCurrentUser();
  if (!session) throw new Error("Not authenticated");
  const parsed = updateSpaceSchema.safeParse({
    display_name: formData.get("display_name") ?? undefined,
    tagline: formData.get("tagline") ?? undefined,
    bio: formData.get("bio") ?? undefined,
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  if (!supabase) return;
  await supabase.from("practitioners").update(parsed.data).eq("user_id", session.user.id);
  revalidatePath("/practitioner/space");
}
