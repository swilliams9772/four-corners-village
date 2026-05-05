import Link from "next/link";
import { redirect } from "next/navigation";
import { Tv, CreditCard, ArrowRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DisplayHeading, Eyebrow } from "@/components/ui/typography";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { openCustomerPortal } from "@/app/actions/billing";
import type { Subscription } from "@/lib/supabase/types";

export const metadata = { title: "Billing" };

export default async function BillingPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/login");

  const supabase = await createClient();
  let subs: Subscription[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });
    subs = (data as Subscription[] | null) ?? [];
  }

  const tvSub = subs.find(
    (s) => s.product === "tv" && ["active", "trialing"].includes(s.status),
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 lg:px-10">
      <header className="mb-10">
        <Eyebrow>Account</Eyebrow>
        <DisplayHeading level={1} size="h2">
          Billing & subscriptions
        </DisplayHeading>
        <p className="mt-3 text-body text-ink-subtle">
          Your active subscriptions and payment methods. Manage everything from the secure Stripe
          portal.
        </p>
      </header>

      <div className="space-y-5">
        <Card variant={tvSub ? "altar" : "default"}>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Tv className="size-5 text-air" />
                  Vintage TV
                </CardTitle>
                <CardDescription>$5.55/month or $55.55/year</CardDescription>
              </div>
              {tvSub ? (
                <Badge variant="success">{tvSub.status}</Badge>
              ) : (
                <Badge variant="outline">Inactive</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {tvSub ? (
              <div className="space-y-2 text-label text-ink-subtle">
                <p>
                  Renews on{" "}
                  <span className="font-medium text-ink">
                    {tvSub.current_period_end
                      ? new Date(tvSub.current_period_end).toLocaleDateString()
                      : "—"}
                  </span>
                </p>
                {tvSub.cancel_at_period_end && (
                  <p className="text-air">Set to cancel at period end.</p>
                )}
              </div>
            ) : (
              <Button asChild variant="brand" size="lg">
                <Link href="/tv/subscribe">
                  Subscribe to Vintage TV
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {subs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>All subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {subs.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-lg border border-subtle bg-glass px-4 py-3"
                  >
                    <div>
                      <p className="font-medium capitalize text-ink">{s.product}</p>
                      <p className="text-caption text-ink-muted capitalize">{s.status}</p>
                    </div>
                    <p className="text-caption text-ink-muted">
                      Period ends{" "}
                      {s.current_period_end
                        ? new Date(s.current_period_end).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-5" />
              Payment methods & invoices
            </CardTitle>
            <CardDescription>
              Update card, view invoices, and cancel subscriptions in the secure Stripe portal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={openCustomerPortal}>
              <Button type="submit" variant="outline" size="lg">
                Open Stripe portal
                <ExternalLink className="size-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
