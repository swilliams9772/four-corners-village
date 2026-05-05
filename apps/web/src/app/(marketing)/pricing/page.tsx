import Link from "next/link";
import { Check, Tv, Sparkle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Section, Eyebrow, DisplayHeading, Lede } from "@/components/ui/typography";
import { Reveal } from "@/components/ui/reveal";
import { AmbientAurora } from "@/components/ui/ambient-aurora";
import { SacredDivider } from "@/components/brand/sacred-geometry";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Pricing & Tiers",
  description:
    "Three-tier leasing for practitioners — Initiate, Guide, Sanctuary — plus the Vintage TV streaming subscription.",
};

const practitionerTiers = [
  {
    name: "Initiate",
    subtitle: "Basic lease",
    price: "$49",
    period: "/mo",
    description: "For emerging practitioners seeking initial visibility.",
    features: [
      "Branded profile in public directory",
      "Basic posts in your sub-space",
      "Global community calendar access",
      "Stripe payment links for services",
      "Community forum participation",
    ],
    cta: "Start your journey",
    href: "/practitioners/apply?tier=initiate",
    highlight: false,
    accent: "water",
  },
  {
    name: "Guide",
    subtitle: "Standard lease",
    price: "$149",
    period: "/mo",
    description: "For established coaches with active client bases.",
    features: [
      "Everything in Initiate",
      "Native course hosting (LMS)",
      "Secure video uploading",
      "Advanced membership controls",
      "Private group chat for followers",
      "Financial analytics dashboard",
    ],
    cta: "Become a guide",
    href: "/practitioners/apply?tier=guide",
    highlight: true,
    accent: "air",
  },
  {
    name: "Sanctuary",
    subtitle: "Premium lease",
    price: "$399",
    period: "/mo",
    description: "For high-volume wellness organizations.",
    features: [
      "Everything in Guide",
      "Full white-labeling of sub-space",
      "API & webhook access",
      "Independent Zoom sub-account",
      "Automated workflow triggers",
      "Custom domain mapping",
    ],
    cta: "Claim your sanctuary",
    href: "/practitioners/apply?tier=sanctuary",
    highlight: false,
    accent: "lunar",
  },
] as const;

export default function PricingPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden pt-32 pb-20">
        <AmbientAurora variant="cosmic" intensity={0.7} blur="xl" />
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
          <Reveal>
            <Eyebrow>Digital real estate</Eyebrow>
          </Reveal>
          <Reveal delay={120}>
            <DisplayHeading level={1} size="display" className="mb-6">
              Three tiers, one village.
            </DisplayHeading>
          </Reveal>
          <Reveal delay={240}>
            <Lede className="mx-auto text-center">
              A leasing model that scales with practitioner maturity — from emerging teachers to
              wellness organizations operating at scale.
            </Lede>
          </Reveal>
        </div>
      </section>

      <Section className="pt-0">
        <div className="grid gap-6 md:grid-cols-3">
          {practitionerTiers.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 120}>
              <Card
                variant={tier.highlight ? "altar" : "default"}
                className={cn(
                  "relative h-full overflow-hidden",
                  tier.highlight && "lg:scale-[1.03]",
                )}
              >
                {tier.highlight && (
                  <div className="absolute inset-x-0 top-0 flex items-center justify-center gap-1.5 bg-brand py-1.5 text-caption font-medium uppercase tracking-widest text-brand-foreground">
                    <Sparkle className="size-3" />
                    Most chosen
                  </div>
                )}
                <CardHeader className={cn("pt-7", tier.highlight && "pt-12")}>
                  <p className="text-caption uppercase tracking-widest text-ink-muted">
                    {tier.subtitle}
                  </p>
                  <CardTitle className="font-display text-h3 text-ink leading-tight">
                    The {tier.name}
                  </CardTitle>
                  <CardDescription className="text-pretty">{tier.description}</CardDescription>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="font-display text-h1 tabular-nums text-ink">{tier.price}</span>
                    <span className="text-body text-ink-muted">{tier.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="mb-7 space-y-3">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-label text-ink-subtle">
                        <Check
                          className={cn(
                            "mt-0.5 size-4 shrink-0",
                            tier.highlight ? "text-air" : "text-success",
                          )}
                        />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    variant={tier.highlight ? "brand" : "outline"}
                    size="lg"
                    className="w-full"
                  >
                    <Link href={tier.href}>{tier.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      <SacredDivider />

      <section className="relative overflow-hidden bg-elevated py-24 md:py-32">
        <AmbientAurora variant="dusk" intensity={0.6} blur="xl" />

        <div className="relative mx-auto max-w-5xl px-6 lg:px-10">
          <div className="mb-16 text-center">
            <Reveal>
              <Badge variant="air" className="mb-5">
                <Tv className="size-3" />
                Streaming subscription
              </Badge>
            </Reveal>
            <Reveal delay={120}>
              <DisplayHeading level={2} className="mb-5">
                Vintage TV — separate, optional, sacred.
              </DisplayHeading>
            </Reveal>
            <Reveal delay={240}>
              <Lede className="mx-auto text-center">
                Independent of practitioner tiers — any seeker can subscribe to the documentary
                library.
              </Lede>
            </Reveal>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Reveal>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-h4">Monthly</CardTitle>
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
                      "Stream-only — no downloads",
                      "Cancel anytime",
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-3">
                        <Check className="size-4 text-air" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant="brand" size="lg" className="w-full">
                    <Link href="/tv/subscribe?plan=monthly">Subscribe monthly</Link>
                  </Button>
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
                  <Button asChild variant="brand" size="lg" className="w-full">
                    <Link href="/tv/subscribe?plan=annual">Subscribe annually</Link>
                  </Button>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
