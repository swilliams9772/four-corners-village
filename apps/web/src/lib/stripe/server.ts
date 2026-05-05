import Stripe from "stripe";
import { env } from "@/lib/env";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!env.stripe.configured) {
    throw new Error(
      "Stripe is not configured. Set STRIPE_SECRET_KEY in .env.local.",
    );
  }
  _stripe ??= new Stripe(env.stripe.secretKey, {
    apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion,
    typescript: true,
    appInfo: {
      name: "Four Corners Village",
      version: "0.1.0",
    },
  });
  return _stripe;
}

export const STRIPE_PRODUCTS = {
  tv_monthly: {
    priceId: () => env.stripe.prices.tvMonthly,
    label: "Vintage TV — Monthly",
    amount: 555,
    interval: "month" as const,
  },
  tv_annual: {
    priceId: () => env.stripe.prices.tvAnnual,
    label: "Vintage TV — Annual",
    amount: 5555,
    interval: "year" as const,
  },
  initiate: {
    priceId: () => env.stripe.prices.initiate,
    label: "The Initiate — Basic Lease",
    amount: 4900,
    interval: "month" as const,
  },
  guide: {
    priceId: () => env.stripe.prices.guide,
    label: "The Guide — Standard Lease",
    amount: 14900,
    interval: "month" as const,
  },
  sanctuary: {
    priceId: () => env.stripe.prices.sanctuary,
    label: "The Sanctuary — Premium Lease",
    amount: 39900,
    interval: "month" as const,
  },
} as const;

export type StripeProductKey = keyof typeof STRIPE_PRODUCTS;

export function priceIdToProduct(priceId: string):
  | "tv"
  | "initiate"
  | "guide"
  | "sanctuary"
  | null {
  if (
    priceId === env.stripe.prices.tvMonthly ||
    priceId === env.stripe.prices.tvAnnual
  )
    return "tv";
  if (priceId === env.stripe.prices.initiate) return "initiate";
  if (priceId === env.stripe.prices.guide) return "guide";
  if (priceId === env.stripe.prices.sanctuary) return "sanctuary";
  return null;
}
