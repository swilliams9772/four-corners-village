"use server";

import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { createCheckoutSession } from "@/app/actions/billing";

export async function startTvCheckout(formData: FormData) {
  const plan = formData.get("plan") === "annual" ? "annual" : "monthly";
  const priceId = plan === "annual" ? env.stripe.prices.tvAnnual : env.stripe.prices.tvMonthly;
  if (!priceId) {
    throw new Error(
      `Stripe price not configured for ${plan} TV plan. Set STRIPE_PRICE_TV_${plan.toUpperCase()}.`,
    );
  }

  await createCheckoutSession({
    priceId,
    product: "tv",
    successUrl: `${env.app.url}/tv?subscribed=1`,
    cancelUrl: `${env.app.url}/tv/subscribe`,
  });
}
