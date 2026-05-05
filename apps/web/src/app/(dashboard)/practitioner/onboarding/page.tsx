import { redirect } from "next/navigation";
import Link from "next/link";
import { Check, Clock, AlertCircle, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eyebrow, DisplayHeading } from "@/components/ui/typography";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { startStripeConnectOnboarding } from "@/app/actions/practitioner";
import { subscribeToTier } from "@/app/actions/billing";
import { cn } from "@/lib/utils";
import type { Practitioner } from "@/lib/supabase/types";

export const metadata = { title: "Practitioner Onboarding" };

const ACTIVE_SUB_STATUSES = ["trialing", "active", "past_due"] as const;

export default async function OnboardingPage() {
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

  const { data: tierSub } = await supabase
    .from("subscriptions")
    .select("status, product")
    .eq("user_id", session.user.id)
    .in("product", ["initiate", "guide", "sanctuary"])
    .in("status", ACTIVE_SUB_STATUSES as unknown as string[])
    .maybeSingle();

  const hasActiveTierSub = !!tierSub;

  const steps = [
    {
      key: "applied",
      title: "Application submitted",
      hint: "Your story has been received.",
      done: true,
    },
    {
      key: "approved",
      title: "Application approved by team",
      hint: "Our council reviews every offering personally.",
      done: p.status === "approved",
      pending: p.status === "pending",
    },
    {
      key: "stripe",
      title: "Stripe Connect onboarding complete",
      hint: "Set up payouts via Stripe Express.",
      done: p.stripe_connect_onboarded,
      blocked: p.status !== "approved",
    },
    {
      key: "tier",
      title: `Tier subscription active — ${capitalize(p.tier)}`,
      hint: "Activate your space and unlock courses.",
      done: hasActiveTierSub,
      blocked: !p.stripe_connect_onboarded,
    },
  ];

  const completed = steps.filter((s) => s.done).length;
  const progress = Math.round((completed / steps.length) * 100);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Eyebrow>Practitioner onboarding</Eyebrow>
      <DisplayHeading level={1} size="h2" className="mt-3">
        Welcome, {p.display_name.split(" ")[0]}.
      </DisplayHeading>
      <p className="mt-3 text-body text-ink-subtle text-pretty">
        Each step is a small ceremony — once they're complete, your space joins the village.
      </p>

      <div className="mt-7 mb-9">
        <div className="mb-3 flex items-center justify-between text-caption uppercase tracking-widest text-ink-muted">
          <span>Progress</span>
          <span className="tabular-nums text-ink">
            {completed}/{steps.length}
          </span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-glass-strong">
          <div
            className="h-full rounded-full bg-gradient-to-r from-air via-lunar to-fire transition-all duration-slow"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Card variant="default" className="mb-6">
        <CardContent className="divide-y divide-subtle p-0">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-start gap-4 px-6 py-5">
              <div
                className={cn(
                  "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full ring-1",
                  s.done
                    ? "bg-earth/15 text-earth ring-earth/30"
                    : s.blocked
                      ? "bg-glass-strong text-ink-muted ring-subtle"
                      : "bg-fire/15 text-fire ring-fire/30",
                )}
              >
                {s.done ? (
                  <Check className="size-4" />
                ) : s.blocked ? (
                  <span className="font-display text-caption tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                ) : (
                  <Clock className="size-4" />
                )}
              </div>
              <div className="flex-1">
                <p
                  className={cn(
                    "font-medium",
                    s.blocked ? "text-ink-muted" : "text-ink",
                  )}
                >
                  {s.title}
                </p>
                <p className="mt-0.5 text-caption text-ink-muted">{s.hint}</p>
              </div>
              {s.key === "stripe" && p.status === "approved" && !p.stripe_connect_onboarded && (
                <form action={startStripeConnectOnboarding}>
                  <Button type="submit" variant="brand" size="sm">
                    Continue with Stripe
                    <ExternalLink className="size-3.5" />
                  </Button>
                </form>
              )}
              {s.key === "tier" && p.stripe_connect_onboarded && !hasActiveTierSub && (
                <form action={subscribeToTier}>
                  <input type="hidden" name="tier" value={p.tier} />
                  <Button type="submit" variant="brand" size="sm">
                    Subscribe — {capitalize(p.tier)}
                    <ExternalLink className="size-3.5" />
                  </Button>
                </form>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {p.status === "pending" && (
        <Card variant="outline" className="border-fire/30 bg-fire-soft">
          <CardContent className="flex items-start gap-3 p-6">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-fire" />
            <div>
              <p className="font-medium text-ink">Awaiting approval</p>
              <p className="mt-1 text-caption text-ink-subtle">
                Our team reviews every application personally. You'll receive an email when your
                space is approved — usually within 1–3 business days.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {p.status === "approved" && p.stripe_connect_onboarded && hasActiveTierSub && (
        <Card variant="altar" className="overflow-hidden">
          <CardContent className="relative flex items-start gap-3 p-6">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-earth-soft via-transparent to-air-soft"
            />
            <Sparkles className="relative mt-0.5 size-5 shrink-0 text-earth" />
            <div className="relative flex-1">
              <p className="font-medium text-ink">You're live.</p>
              <p className="mt-1 text-caption text-ink-subtle">
                Your space is published — share it with your circle.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild variant="brand" size="sm">
                  <Link href={`/v/${p.slug}`}>View public space</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/practitioner/space">Edit space</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
