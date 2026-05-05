import { redirect } from "next/navigation";
import { TrendingUp, DollarSign, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eyebrow, DisplayHeading } from "@/components/ui/typography";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";
import { env } from "@/lib/env";
import { formatPrice } from "@/lib/utils";
import { startStripeConnectOnboarding } from "@/app/actions/practitioner";
import type { Practitioner } from "@/lib/supabase/types";

export const metadata = { title: "Finances" };

export default async function PractitionerFinances() {
  const session = await getCurrentUser();
  if (!session) redirect("/login");

  const supabase = await createClient();
  if (!supabase) redirect("/dashboard");

  const { data } = await supabase
    .from("practitioners")
    .select("*")
    .eq("user_id", session.user.id)
    .maybeSingle();
  const p = data as Practitioner | null;
  if (!p) redirect("/practitioners/apply");

  let balance = { available: 0, pending: 0 };
  let recent: Array<{ id: string; amount: number; created: number; description: string | null }> = [];

  if (env.stripe.configured && p.stripe_connect_account_id && p.stripe_connect_onboarded) {
    try {
      const stripe = getStripe();
      const [b, charges] = await Promise.all([
        stripe.balance.retrieve({ stripeAccount: p.stripe_connect_account_id }),
        stripe.charges.list(
          { limit: 10 },
          { stripeAccount: p.stripe_connect_account_id },
        ),
      ]);
      balance.available = b.available.reduce((sum, x) => sum + x.amount, 0);
      balance.pending = b.pending.reduce((sum, x) => sum + x.amount, 0);
      recent = charges.data.map((c) => ({
        id: c.id,
        amount: c.amount,
        created: c.created,
        description: c.description,
      }));
    } catch (err) {
      console.warn("[finances] Stripe fetch failed", err);
    }
  }

  if (!p.stripe_connect_onboarded) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Eyebrow>Practitioner</Eyebrow>
        <DisplayHeading level={1} size="h2" className="mt-3 mb-7">
          Finances
        </DisplayHeading>
        <Card variant="outline" className="border-fire/30 bg-fire-soft">
          <CardContent className="p-6">
            <p className="mb-5 text-body text-ink-subtle text-pretty">
              Complete Stripe Connect onboarding to start accepting payments. We use Stripe
              Express, which handles tax forms, payouts, and compliance automatically.
            </p>
            <form action={startStripeConnectOnboarding}>
              <Button type="submit" variant="brand">Continue with Stripe</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Eyebrow>Practitioner</Eyebrow>
          <DisplayHeading level={1} size="h2" className="mt-3">
            Finances
          </DisplayHeading>
        </div>
        <Badge variant="earth">Stripe connected · 85% revenue share</Badge>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card variant="default">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-caption uppercase tracking-widest text-ink-muted">
              <Wallet className="size-3.5" /> Available balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-h2 leading-none tabular-nums text-ink">
              {formatPrice(balance.available)}
            </p>
          </CardContent>
        </Card>
        <Card variant="default">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-caption uppercase tracking-widest text-ink-muted">
              <TrendingUp className="size-3.5" /> Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-h2 leading-none tabular-nums text-ink">
              {formatPrice(balance.pending)}
            </p>
          </CardContent>
        </Card>
        <Card variant="default">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-caption uppercase tracking-widest text-ink-muted">
              <DollarSign className="size-3.5" /> Tier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-h2 leading-none capitalize text-ink">{p.tier}</p>
          </CardContent>
        </Card>
      </div>

      <Card variant="default">
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recent.length === 0 ? (
            <p className="px-6 py-7 text-caption text-ink-muted">No charges yet.</p>
          ) : (
            <div className="divide-y divide-subtle">
              {recent.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 px-6 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">
                      {c.description ?? "Service"}
                    </p>
                    <p className="text-caption text-ink-muted">
                      {new Date(c.created * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-display text-h6 tabular-nums text-ink">
                    {formatPrice(c.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
