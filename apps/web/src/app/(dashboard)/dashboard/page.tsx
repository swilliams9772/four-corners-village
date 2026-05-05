import Link from "next/link";
import { Tv, Compass, Flame, Sparkle, ArrowRight, Crown, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LunarOrbLive } from "@/components/ui/lunar-orb-live";
import { LunarSyncCard } from "@/components/ui/lunar-sync-card";
import { AmbientAurora } from "@/components/ui/ambient-aurora";
import { DisplayHeading } from "@/components/ui/typography";
import { getCurrentUser, hasActiveTvSubscription } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getCurrentUser();
  if (!session) return null;
  const tvActive = await hasActiveTvSubscription(session.user.id);

  const supabase = await createClient();
  let practitionerCount = 0;
  if (supabase) {
    const { count } = await supabase
      .from("practitioners")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved");
    practitionerCount = count ?? 0;
  }

  const greeting = greetingFromHour();

  return (
    <div className="relative min-h-svh">
      <AmbientAurora variant="cosmic" intensity={0.5} blur="xl" />

      <div className="relative mx-auto max-w-6xl px-6 py-10 lg:px-10 lg:py-14">
        {/* hero / greeting */}
        <header className="mb-12 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-caption font-medium uppercase tracking-widest text-ink-muted">
              {greeting}
            </p>
            <DisplayHeading level={1} size="h1" className="leading-[1.05]">
              {session.profile.full_name ?? session.user.email.split("@")[0]}
              <span className="block text-ink-muted">— welcome back to the village.</span>
            </DisplayHeading>
          </div>
          <div className="shrink-0">
            <LunarOrbLive size={108} showCaption />
          </div>
        </header>

        {/* status row */}
        <section className="mb-10 grid gap-4 md:grid-cols-3">
          <Card variant="glass" className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-caption uppercase tracking-widest text-ink-muted">
                Vintage TV
              </span>
              <Tv className="size-4 text-air" />
            </div>
            {tvActive ? (
              <>
                <p className="mb-2 font-display text-h4 text-ink leading-tight">Active</p>
                <Badge variant="success" size="sm">
                  Subscription live
                </Badge>
              </>
            ) : (
              <>
                <p className="mb-2 font-display text-h4 text-ink leading-tight">Not subscribed</p>
                <Button asChild size="sm" variant="brand">
                  <Link href="/tv/subscribe">Subscribe — $5.55/mo</Link>
                </Button>
              </>
            )}
          </Card>

          <Card variant="glass" className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-caption uppercase tracking-widest text-ink-muted">Village</span>
              <Compass className="size-4 text-earth" />
            </div>
            <p className="mb-1 font-display text-display tabular-nums text-ink leading-none">
              {practitionerCount}
            </p>
            <p className="text-label text-ink-subtle">practitioners</p>
          </Card>

          <Card variant="glass" className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-caption uppercase tracking-widest text-ink-muted">Today</span>
              <Sparkle className="size-4 text-lunar" />
            </div>
            <p className="mb-2 font-display text-h5 text-ink leading-tight">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-label text-ink-muted">Set an intention. The day is listening.</p>
          </Card>
        </section>

        {/* lunar sync (full-width) */}
        <section className="mb-10">
          <LunarSyncCard />
        </section>

        {/* main grid */}
        <section className="grid gap-5 lg:grid-cols-2">
          <Card variant="default" className="p-7">
            <CardHeader className="p-0 pb-5">
              <CardTitle>Continue exploring</CardTitle>
              <CardDescription>Quick paths back into the rhythm.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 p-0">
              {[
                {
                  href: "/tv",
                  title: "Browse Vintage TV",
                  body: "Curated documentaries from teachers and lineages.",
                  icon: Tv,
                  tone: "text-air",
                },
                {
                  href: "/altars",
                  title: "Visit the Village Altar",
                  body: "Light a candle, leave an intention, witness collective flame.",
                  icon: Flame,
                  tone: "text-fire",
                },
                {
                  href: "/oracle",
                  title: "Draw an oracle card",
                  body: "AI-enhanced reading with current transits.",
                  icon: Sparkle,
                  tone: "text-lunar",
                },
                {
                  href: "/courses",
                  title: "Resume a course",
                  body: "Pick up where you left off.",
                  icon: BookOpen,
                  tone: "text-water",
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group/row flex items-center justify-between rounded-xl px-3 py-3 transition-colors duration-quick ease-velvet hover:bg-glass"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-glass">
                      <item.icon className={`size-4 ${item.tone}`} />
                    </div>
                    <div>
                      <p className="font-medium text-ink">{item.title}</p>
                      <p className="text-caption text-ink-muted">{item.body}</p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-ink-muted transition-transform duration-quick group-hover/row:translate-x-0.5" />
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card variant="altar" className="overflow-hidden p-0">
            <div className="relative px-7 pt-7 pb-7">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-earth-soft via-transparent to-lunar-soft"
              />
              <div className="relative">
                <div className="mb-4 inline-flex items-center gap-2 rounded-pill border border-earth/30 bg-earth-soft px-3 py-1 text-caption font-medium uppercase tracking-widest text-earth-foreground">
                  <Crown className="size-3" />
                  Become a practitioner
                </div>
                <h2 className="font-display text-h3 text-ink leading-tight">
                  Lease your own digital sanctuary.
                </h2>
                <p className="mt-3 max-w-md text-body text-ink-subtle text-pretty">
                  Build your audience. Keep 85–95% of revenue. Get a sovereign sub-space at
                  fourcorners.village/v/your-name.
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <Button asChild variant="earth" size="lg">
                    <Link href="/practitioners/apply">Apply to join</Link>
                  </Button>
                  <Button asChild variant="ghost" size="lg">
                    <Link href="/pricing">View tiers</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

function greetingFromHour() {
  const h = new Date().getHours();
  if (h < 5) return "Late hour";
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  if (h < 21) return "Evening";
  return "Night blessings";
}
