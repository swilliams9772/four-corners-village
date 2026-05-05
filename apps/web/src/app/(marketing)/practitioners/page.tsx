import Link from "next/link";
import { Sparkle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section, Eyebrow, DisplayHeading, Lede } from "@/components/ui/typography";
import { Reveal } from "@/components/ui/reveal";
import { ElementalChip } from "@/components/ui/elemental-chip";
import { AmbientAurora } from "@/components/ui/ambient-aurora";
import { createClient } from "@/lib/supabase/server";
import { DEV_PRACTITIONERS } from "@/lib/dev-data";
import type { Practitioner } from "@/lib/supabase/types";
import { tierStyles } from "@four-corners/ui-primitives";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Practitioner Directory",
  description: "Independent teachers, healers, and guides who have planted their flag in the village.",
};
export const revalidate = 60;

async function loadPractitioners(): Promise<Practitioner[]> {
  const supabase = await createClient();
  if (!supabase) return DEV_PRACTITIONERS;
  const { data } = await supabase
    .from("practitioners")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  return (data as Practitioner[] | null) ?? DEV_PRACTITIONERS;
}

export default async function PractitionersPage() {
  const practitioners = await loadPractitioners();

  return (
    <>
      <section className="relative isolate overflow-hidden pt-32 pb-16">
        <AmbientAurora variant="dusk" intensity={0.6} blur="xl" />
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
          <Reveal>
            <Eyebrow>Directory</Eyebrow>
          </Reveal>
          <Reveal delay={120}>
            <DisplayHeading level={1} size="display" className="mb-6">
              Meet the practitioners.
            </DisplayHeading>
          </Reveal>
          <Reveal delay={240}>
            <Lede className="mx-auto text-center">
              Independent teachers, healers, and guides who have planted their flag in the village.
            </Lede>
          </Reveal>
          <Reveal delay={360}>
            <Button asChild variant="brand" size="lg" className="mt-10">
              <Link href="/practitioners/apply">
                <Sparkle className="size-4" />
                Apply to join
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>

      <Section className="pt-0">
        {practitioners.length === 0 ? (
          <Card variant="glass" className="mx-auto max-w-md p-10 text-center">
            <p className="text-body text-ink-subtle">
              The directory is being curated. Check back soon, or apply to be among the first.
            </p>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {practitioners.map((p, i) => {
              const tier = tierStyles[p.tier];
              return (
                <Reveal key={p.id} delay={(i % 3) * 80}>
                  <Link href={`/v/${p.slug}`} className="block h-full">
                    <Card variant="glass" interactive className="group h-full overflow-hidden p-0">
                      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-lunar/30 via-elevated to-fire/30">
                        {p.cover_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.cover_url}
                            alt=""
                            className="size-full object-cover transition-transform duration-slow ease-silk group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center font-display text-h1 text-ink/20">
                            {p.display_name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-canvas/95 to-transparent" />
                      </div>
                      <CardContent className="p-6">
                        <div className="mb-3 flex items-center gap-2">
                          {p.primary_direction && (
                            <ElementalChip direction={p.primary_direction} size="sm" />
                          )}
                          <Badge
                            variant="outline"
                            className={cn("border", tier.className)}
                          >
                            {tier.label}
                          </Badge>
                        </div>
                        <h3 className="mb-1 font-display text-h5 leading-tight text-ink transition-colors duration-quick group-hover:text-air">
                          {p.display_name}
                        </h3>
                        {p.tagline && (
                          <p className="mb-4 text-label text-ink-subtle line-clamp-2">{p.tagline}</p>
                        )}
                        <div className="flex flex-wrap gap-1.5">
                          {p.modalities?.slice(0, 3).map((m) => (
                            <Badge key={m} size="sm" variant="default">
                              {m}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </Section>
    </>
  );
}
