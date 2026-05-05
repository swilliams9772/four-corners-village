import Link from "next/link";
import { ArrowRight, Tv, Play, Lock, Sparkle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { AmbientAurora } from "@/components/ui/ambient-aurora";
import { Reveal } from "@/components/ui/reveal";
import { LunarOrbLive } from "@/components/ui/lunar-orb-live";
import { ElementalChip } from "@/components/ui/elemental-chip";
import { Section, Eyebrow, DisplayHeading, Lede } from "@/components/ui/typography";
import { SacredDivider, FlowerOfLife, Mandala } from "@/components/brand/sacred-geometry";
import { DirectionGlyph } from "@/components/brand/direction-glyph";
import { DirectionCard, FeatureCheck } from "@/components/site/direction-card";
import { WaitlistForm } from "@/components/site/waitlist-form";
import { directions } from "@four-corners/ui-primitives";

export default function Home() {
  return (
    <>
      {/* ============================================================
          HERO — full-bleed cinematic. Aurora + lunar orb + display type.
         ============================================================ */}
      <section
        id="home"
        className="relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-hidden pt-24"
      >
        <AmbientAurora variant="cosmic" intensity={1.1} blur="xl" />
        <Mandala
          size={720}
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 text-ink-muted"
          opacity={0.08}
        />

        <div className="mx-auto flex max-w-5xl flex-col items-center px-6 text-center lg:px-10">
          <Reveal>
            <Badge variant="soft" className="mb-8">
              <Sparkle className="size-3 text-air" />
              Soft launching · 2026
            </Badge>
          </Reveal>

          <Reveal delay={120}>
            <DisplayHeading level={1} size="cinema" className="mb-6 leading-[0.95]">
              A digital village
              <br />
              for the{" "}
              <span className="bg-gradient-to-br from-air via-fire to-lunar bg-clip-text text-transparent">
                seekers
              </span>{" "}
              who serve.
            </DisplayHeading>
          </Reveal>

          <Reveal delay={240}>
            <Lede className="mx-auto text-body-lg text-ink-subtle">
              Sovereign sub-spaces for spiritual practitioners. Sacred technology for members. A
              curated streaming home for documentary lineages. All under one roof.
            </Lede>
          </Reveal>

          <Reveal delay={360}>
            <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
              <Button asChild variant="brand" size="xl">
                <Link href="#vision">
                  Explore the village
                  <ArrowRight className="size-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl">
                <Link href="/tv">
                  <Tv className="size-5" />
                  Visit Vintage TV
                </Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={480} className="mt-16">
            <LunarOrbLive size={120} showCaption />
          </Reveal>
        </div>

        {/* scroll affordance */}
        <div
          aria-hidden
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-caption text-ink-muted smallcaps"
        >
          Scroll to enter
        </div>
      </section>

      {/* ============================================================
          FOUR DIRECTIONS — the metaphor anchored in a 4-up grid.
         ============================================================ */}
      <Section id="directions" className="-mt-24 pt-0">
        <Reveal>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <Eyebrow>The four directions</Eyebrow>
            <DisplayHeading level={2} size="h1" className="mb-5">
              Four ways in. One sacred ground.
            </DisplayHeading>
            <Lede className="mx-auto text-center">
              Air, fire, water, earth — the village is organized around the four directions. Each
              one carries its own practitioners, rituals, and ways of being.
            </Lede>
          </div>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {directions.map((direction, i) => (
            <Reveal key={direction} delay={i * 120}>
              <DirectionCard
                direction={direction}
                description={
                  {
                    east: "Discovery, daily affirmations, the morning forum.",
                    south: "Live sessions, workshops, transformation challenges.",
                    west: "Meditations, journaling, the deep work of healing.",
                    north: "Courses, archives, lineage texts and elder wisdom.",
                  }[direction]
                }
              />
            </Reveal>
          ))}
        </div>
      </Section>

      <SacredDivider />

      {/* ============================================================
          VISION — the manifesto piece, two-column.
         ============================================================ */}
      <Section id="vision">
        <div className="grid items-center gap-16 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <div>
              <Eyebrow>Our vision</Eyebrow>
              <DisplayHeading level={2} className="mb-6">
                Beyond single-tenant <em className="not-italic text-lunar">community platforms.</em>
              </DisplayHeading>
              <Lede className="mb-6">
                Circle, Skool, Heartbeat — built for one creator hosting an audience. They lock
                practitioners into rigid environments that don't support business autonomy.
              </Lede>
              <Lede className="mb-10 text-ink-muted">
                Four Corners introduces a paradigm shift: a multi-tenant digital real estate model
                where practitioners lease sovereign spaces inside a unified ecosystem — a spiritual
                WeWork for the digital age.
              </Lede>
              <div className="space-y-4">
                <FeatureCheck text="Independent financial dashboards for each practitioner" />
                <FeatureCheck text="Sovereign administrative control over their space" />
                <FeatureCheck text="Automated payment routing via Stripe Connect" />
                <FeatureCheck text="Network effects across the entire village" />
              </div>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="relative">
              <div className="absolute -inset-8 -z-10">
                <FlowerOfLife className="text-lunar" size={520} opacity={0.18} />
              </div>
              <div className="relative aspect-square overflow-hidden rounded-3xl border border-subtle bg-glass p-6 backdrop-blur-xl shadow-altar">
                <div className="grid h-full grid-cols-2 grid-rows-2 gap-3">
                  {directions.map((d) => {
                    const Glyph = DirectionGlyph[d];
                    const counts = { east: 12, south: 28, west: 19, north: 23 } as const;
                    return (
                      <div
                        key={d}
                        className="flex flex-col justify-between rounded-2xl border border-subtle bg-elevated/60 p-5 backdrop-blur"
                      >
                        <div className="flex items-center justify-between">
                          <ElementalChip direction={d} size="sm" showLabel={false} />
                          <span className="text-caption text-ink-muted smallcaps">
                            {{ east: "EAST", south: "SOUTH", west: "WEST", north: "NORTH" }[d]}
                          </span>
                        </div>
                        <div>
                          <Glyph size={28} className="text-ink-muted" />
                          <p className="mt-2 font-display text-h6 leading-tight">
                            {counts[d]}
                            <span className="ml-1 text-caption text-ink-muted">practitioners</span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 rounded-2xl border border-subtle bg-elevated p-5 shadow-altar">
                <p className="text-caption uppercase tracking-widest text-ink-muted">Goal</p>
                <p className="font-display text-h4 leading-tight">10,000 practitioners</p>
                <p className="text-label text-ink-subtle">by 2027</p>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ============================================================
          VINTAGE TV — cinematic teaser.
         ============================================================ */}
      <section className="relative overflow-hidden border-y border-subtle bg-elevated py-24 md:py-32">
        <div className="absolute inset-0 tv-scanlines opacity-40" aria-hidden />
        <div className="absolute inset-0 -z-10">
          <AmbientAurora variant="dusk" blur="xl" intensity={0.7} />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <Reveal>
              <Badge variant="air" className="mb-5">
                <Tv className="size-3" /> New
              </Badge>
              <DisplayHeading level={2} className="mb-6">
                Four Corners
                <span className="block bg-gradient-to-br from-air via-fire to-lunar bg-clip-text text-transparent">
                  Vintage TV
                </span>
              </DisplayHeading>
              <Lede className="mb-8">
                A curated streaming home for spiritual documentaries, witnessed ceremonies, and
                long-form films from teachers and lineages around the world.
              </Lede>
              <ul className="mb-10 space-y-3 text-body text-ink-subtle">
                <li className="flex items-center gap-3">
                  <Play className="size-4 text-air" />
                  Stream-only — no downloads, no piracy
                </li>
                <li className="flex items-center gap-3">
                  <Lock className="size-4 text-air" />
                  Encrypted playback, signed URLs
                </li>
                <li className="flex items-center gap-3">
                  <Sparkle className="size-4 text-air" />
                  New titles every month, hand-curated
                </li>
              </ul>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="font-display text-display tabular-nums text-ink">$5.55</span>
                <span className="text-body-lg text-ink-subtle">/month</span>
                <span className="ml-3 text-label text-ink-muted">or $55.55/year</span>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="brand" size="lg">
                  <Link href="/tv">Browse the library</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/tv/subscribe">Subscribe</Link>
                </Button>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="relative">
                <div className="aspect-video overflow-hidden rounded-3xl border-4 border-ink-700 bg-canvas shadow-altar">
                  <div className="grid h-full grid-cols-3 gap-1 p-1">
                    {[
                      "from-air/60 to-fire/60",
                      "from-lunar/60 to-water/60",
                      "from-earth/60 to-water/60",
                      "from-fire/60 to-air/60",
                      "from-water/60 to-lunar/60",
                      "from-air/60 to-earth/60",
                    ].map((c, i) => (
                      <div
                        key={i}
                        className={`relative flex items-center justify-center rounded-md bg-gradient-to-br ${c}`}
                      >
                        <Play className="size-7 text-canvas/70" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute -right-4 -top-4 rounded-pill bg-fire px-3 py-1.5 text-caption font-medium text-fire-foreground shadow-glow-fire">
                  Founding member · $55.55/yr
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================================================
          SACRED TECHNOLOGY — features grid.
         ============================================================ */}
      <Section id="features">
        <Reveal>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <Eyebrow>Sacred technology</Eyebrow>
            <DisplayHeading level={2} className="mb-5">
              Tools the platforms forgot.
            </DisplayHeading>
            <Lede className="mx-auto text-center">
              Standard video hosting and chat are commoditized. The value lives in specialized,
              digitally-native spiritual tools that embody sacred intent.
            </Lede>
          </div>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              eyebrow: "Witnessed ritual",
              title: "Digital shared altars",
              body: "Light candles, leave prayers, place symbolic offerings. Watch hundreds of intentions burn together as collective digital flame.",
              direction: "south" as const,
            },
            {
              eyebrow: "Cosmic rhythm",
              title: "Lunar & astrological sync",
              body: "The UI subtly shifts with the lunar phase. Phase-aligned notifications. Birth-chart matchmaking with practitioners.",
              direction: "west" as const,
            },
            {
              eyebrow: "Augmented divination",
              title: "AI-enhanced oracle",
              body: "Tarot draws synthesized with current transits and your birth chart, narrated with the poetic restraint a real reader would use.",
              direction: "north" as const,
            },
            {
              eyebrow: "Daily practice",
              title: "Intention communities",
              body: "Weekly collective intention-setting that resets and renews — a powerful retention loop and a deep community bond.",
              direction: "east" as const,
            },
            {
              eyebrow: "Sovereignty",
              title: "Sub-space autonomy",
              body: "Each practitioner gets their own URL, brand accent, member list, billing dashboard, and Stripe Connect account.",
              direction: "north" as const,
            },
            {
              eyebrow: "Discovery",
              title: "Astrological matching",
              body: "Birth-chart compatibility connects users to practitioners and peer partners who are cosmically aligned — better trust, better retention.",
              direction: "west" as const,
            },
          ].map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 120}>
              <Card variant="glass" className="h-full p-7">
                <ElementalChip direction={f.direction} size="sm" className="mb-5" />
                <CardTitle className="mb-3">{f.title}</CardTitle>
                <CardDescription>{f.body}</CardDescription>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ============================================================
          FOR PRACTITIONERS — sovereignty pitch.
         ============================================================ */}
      <Section id="practitioners" className="bg-elevated">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <Reveal>
            <Badge variant="earth" className="mb-5">
              For practitioners
            </Badge>
            <DisplayHeading level={2} className="mb-6">
              Your practice. <em className="not-italic text-earth">Your sovereignty.</em>
            </DisplayHeading>
            <Lede className="mb-10">
              Stop renting audience from algorithmic platforms. Own your digital presence in a
              community that honors your work and amplifies your reach.
            </Lede>
            <div className="mb-10 space-y-7">
              {[
                {
                  title: "Direct revenue",
                  body: "Keep 85–95% of earnings with automated Stripe Connect routing.",
                },
                {
                  title: "Data ownership",
                  body: "Export your member list, content, and analytics any time.",
                },
                {
                  title: "Discovery network",
                  body: "Users discovering other practitioners increases your visibility.",
                },
              ].map((b) => (
                <div key={b.title} className="flex gap-4">
                  <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-md bg-earth-soft text-earth">
                    <span aria-hidden>·</span>
                  </div>
                  <div>
                    <h3 className="font-display text-h6 leading-tight">{b.title}</h3>
                    <p className="mt-1 text-label text-ink-subtle">{b.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button asChild variant="earth" size="lg">
              <Link href="/practitioners/apply">
                Apply as a practitioner
                <ArrowRight className="size-5" />
              </Link>
            </Button>
          </Reveal>

          <Reveal delay={200}>
            <div className="grid grid-cols-2 gap-3">
              {["Yoga", "Breathwork", "Tarot", "Reiki", "Astrology", "Sound", "Plant Medicine", "Doula"].map(
                (m, i) => (
                  <div
                    key={m}
                    className="rounded-2xl border border-subtle bg-glass p-5 backdrop-blur transition-transform duration-gentle ease-velvet hover:-translate-y-0.5"
                  >
                    <p className="text-caption uppercase tracking-widest text-ink-muted">
                      Modality {String(i + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-2 font-display text-h6 leading-tight">{m}</p>
                  </div>
                ),
              )}
            </div>
          </Reveal>
        </div>
      </Section>

      <SacredDivider />

      {/* ============================================================
          FINAL CTA — waitlist.
         ============================================================ */}
      <Section className="relative overflow-hidden">
        <AmbientAurora variant="sunrise" intensity={0.6} blur="xl" />

        <Reveal>
          <div className="relative mx-auto max-w-3xl text-center">
            <Eyebrow>Join the movement</Eyebrow>
            <DisplayHeading level={2} size="h1" className="mb-6">
              Build your digital sanctuary.
            </DisplayHeading>
            <Lede className="mx-auto mb-10 text-center">
              Four Corners is launching publicly soon. Join the waitlist for early-practitioner access
              and Vintage TV founding-member pricing.
            </Lede>
            <div className="mx-auto max-w-md">
              <WaitlistForm />
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
