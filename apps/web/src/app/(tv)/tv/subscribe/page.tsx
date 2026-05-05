import { redirect } from "next/navigation";
import { Tv, Check, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { AmbientAurora } from "@/components/ui/ambient-aurora";
import { DisplayHeading, Eyebrow, Lede } from "@/components/ui/typography";
import { getCurrentUser, hasActiveTvSubscription } from "@/lib/auth";
import { startTvCheckout } from "@/app/actions/tv-billing";

export const metadata = { title: "Subscribe to Vintage TV" };

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const session = await getCurrentUser();
  if (!session) redirect("/login?redirect=/tv/subscribe");

  const active = await hasActiveTvSubscription(session.user.id);
  if (active) redirect("/tv");

  await searchParams;

  return (
    <div className="relative isolate">
      <AmbientAurora variant="dusk" intensity={0.6} blur="xl" />

      <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-10">
        <header className="mb-14 text-center">
          <Reveal>
            <Badge variant="air" className="mb-5">
              <Tv className="size-3" />
              Four Corners Vintage TV
            </Badge>
          </Reveal>
          <Reveal delay={120}>
            <DisplayHeading level={1} size="display" className="mb-5">
              Stream the entire library.
            </DisplayHeading>
          </Reveal>
          <Reveal delay={240}>
            <Lede className="mx-auto text-center">
              A separate, optional subscription that unlocks every documentary in the catalog.
              Cancel anytime.
            </Lede>
          </Reveal>
        </header>

        <div className="mb-10 grid gap-5 md:grid-cols-2">
          <Reveal>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-h4">Monthly</CardTitle>
                <CardDescription>Flexible, month-to-month.</CardDescription>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-display text-display tabular-nums text-ink">$5.55</span>
                  <span className="text-body text-ink-muted">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="mb-6 space-y-3 text-label text-ink-subtle">
                  {[
                    "Full library access",
                    "New titles each month",
                    "Stream-only, no downloads",
                    "Cancel anytime",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-3">
                      <Check className="size-4 text-air" />
                      {f}
                    </li>
                  ))}
                </ul>
                <form action={startTvCheckout}>
                  <input type="hidden" name="plan" value="monthly" />
                  <Button type="submit" variant="brand" size="lg" className="w-full">
                    Subscribe monthly
                  </Button>
                </form>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delay={120}>
            <Card variant="altar" className="relative h-full overflow-hidden">
              <div className="absolute inset-x-0 top-0 bg-brand py-1.5 text-center text-caption font-medium uppercase tracking-widest text-brand-foreground">
                Save 17%
              </div>
              <CardHeader className="pt-12">
                <CardTitle className="text-h4">Annual</CardTitle>
                <CardDescription>Best value.</CardDescription>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-display text-display tabular-nums text-ink">$55.55</span>
                  <span className="text-body text-ink-muted">/year</span>
                </div>
                <p className="mt-2 text-caption text-air">Equivalent to $4.63/month</p>
              </CardHeader>
              <CardContent>
                <ul className="mb-6 space-y-3 text-label text-ink-subtle">
                  {[
                    "Everything in Monthly",
                    "2 months free",
                    "Priority on new releases",
                    "Founding member badge",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-3">
                      <Check className="size-4 text-air" />
                      {f}
                    </li>
                  ))}
                </ul>
                <form action={startTvCheckout}>
                  <input type="hidden" name="plan" value="annual" />
                  <Button type="submit" variant="brand" size="lg" className="w-full">
                    Subscribe annually
                  </Button>
                </form>
              </CardContent>
            </Card>
          </Reveal>
        </div>

        <Card variant="glass" className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-air-soft text-air">
              <Lock className="size-4" />
            </div>
            <div>
              <p className="text-label font-medium text-ink">Stream-only — no downloads</p>
              <p className="mt-1 text-caption text-ink-muted">
                All playback uses encrypted HLS with short-lived signed tokens. You watch inside
                the app — videos can&apos;t be downloaded for offline playback.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
