"use client";

import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { env } from "@/lib/env";

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripeClient() {
  if (!stripePromise) {
    stripePromise = loadStripe(env.stripe.publishableKey);
  }
  return stripePromise;
}
