import { getStripe } from "@/lib/stripe/server";

const PLATFORM_FEE_BPS = 1500; // 15.00% — practitioner keeps 85%

/**
 * Creates a Stripe Checkout Session for a one-off product (e.g. a session
 * booking or course purchase) with a destination charge that pays the
 * practitioner directly minus our platform fee.
 *
 * Use Stripe's `application_fee_amount` for connected accounts.
 */
export async function createConnectedCheckout(opts: {
  customerId: string;
  practitionerStripeAccountId: string;
  amountCents: number;
  productName: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  const stripe = getStripe();
  const fee = Math.floor((opts.amountCents * PLATFORM_FEE_BPS) / 10000);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: opts.customerId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: opts.productName },
          unit_amount: opts.amountCents,
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: fee,
      transfer_data: {
        destination: opts.practitionerStripeAccountId,
      },
      metadata: opts.metadata ?? {},
    },
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    metadata: opts.metadata ?? {},
  });

  return session;
}

export const PLATFORM_FEE = {
  bps: PLATFORM_FEE_BPS,
  practitionerSharePercent: 85,
};
