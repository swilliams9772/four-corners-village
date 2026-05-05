"use server";

import { redirect } from "next/navigation";
import { getStripe } from "@/lib/stripe/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

/**
 * Resolves (and creates if needed) a Stripe customer for the
 * authenticated user, persisting the id on the profile.
 */
async function getOrCreateStripeCustomer(): Promise<string> {
  const supabase = await createClient();
  if (!supabase) throw new Error("Auth not configured");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.stripe_customer_id) return profile.stripe_customer_id;

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: profile?.email ?? user.email ?? undefined,
    name: profile?.full_name ?? undefined,
    metadata: { supabase_user_id: user.id },
  });

  const admin = createServiceClient();
  await admin
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", user.id);

  return customer.id;
}

/**
 * Open the Stripe Customer Portal so members can manage their
 * subscription, payment method, and invoices.
 */
export async function openCustomerPortal() {
  const customerId = await getOrCreateStripeCustomer();
  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${env.app.url}/account/billing`,
  });
  redirect(session.url);
}

/**
 * Generic Checkout for any of our subscription products.
 * Used by Vintage TV paywall and practitioner tier upgrades.
 */
export async function createCheckoutSession(opts: {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  product: "tv" | "initiate" | "guide" | "sanctuary";
}) {
  const customerId = await getOrCreateStripeCustomer();
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: opts.priceId, quantity: 1 }],
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { product: opts.product },
    },
    metadata: { product: opts.product },
  });

  if (!session.url) throw new Error("Failed to create checkout session");
  redirect(session.url);
}

/**
 * Practitioner-onboarding helper: starts a Stripe Checkout for the tier the
 * practitioner chose during their application. Reads `tier` from form data so
 * it can be wired directly as a <form action>.
 */
export async function subscribeToTier(formData: FormData) {
  const raw = String(formData.get("tier") ?? "");
  if (raw !== "initiate" && raw !== "guide" && raw !== "sanctuary") {
    throw new Error("Invalid tier");
  }
  const tier = raw as "initiate" | "guide" | "sanctuary";

  const priceId = env.stripe.prices[tier];
  if (!priceId) {
    throw new Error(
      `Stripe price for the ${tier} tier is not configured (set STRIPE_PRICE_${tier.toUpperCase()})`,
    );
  }
  return createCheckoutSession({
    priceId,
    successUrl: `${env.app.url}/practitioner/onboarding?tier=subscribed`,
    cancelUrl: `${env.app.url}/practitioner/onboarding`,
    product: tier,
  });
}
