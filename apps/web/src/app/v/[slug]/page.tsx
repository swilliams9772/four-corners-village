import { notFound } from "next/navigation";
import Link from "next/link";
import { Mail, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ElementalChip } from "@/components/ui/elemental-chip";
import { Reveal } from "@/components/ui/reveal";
import { LongForm } from "@/components/ui/long-form";
import { DisplayHeading } from "@/components/ui/typography";
import { AmbientAurora } from "@/components/ui/ambient-aurora";
import { createClient } from "@/lib/supabase/server";
import { DEV_PRACTITIONERS } from "@/lib/dev-data";
import { tierStyles } from "@four-corners/ui-primitives";
import type { Practitioner, Course } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: slug };
}

export default async function PractitionerSpacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  let practitioner: Practitioner | null = null;
  let courses: Course[] = [];

  if (supabase) {
    const { data: p } = await supabase
      .from("practitioners")
      .select("*")
      .eq("slug", slug)
      .eq("status", "approved")
      .maybeSingle();
    practitioner = p as Practitioner | null;
    if (practitioner) {
      const { data: c } = await supabase
        .from("courses")
        .select("*")
        .eq("practitioner_id", practitioner.id)
        .eq("is_published", true);
      courses = (c as Course[] | null) ?? [];
    }
  } else {
    practitioner = DEV_PRACTITIONERS.find((p) => p.slug === slug) ?? null;
  }

  if (!practitioner) notFound();

  const tier = tierStyles[practitioner.tier];

  return (
    <div className="pt-16">
      {/* magazine cover */}
      <section className="relative isolate h-[44svh] min-h-[320px] overflow-hidden">
        {practitioner.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={practitioner.cover_url}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <div className="size-full bg-gradient-to-br from-air/30 via-lunar/20 to-fire/30" />
        )}
        <AmbientAurora variant="cosmic" intensity={0.7} blur="xl" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-canvas to-transparent" />
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-10">
        <header className="-mt-24 mb-10 flex flex-col gap-7 md:flex-row md:items-end">
          <Reveal>
            <div
              className={cn(
                "flex size-32 shrink-0 items-center justify-center rounded-3xl border-4 border-canvas",
                "bg-gradient-to-br from-air via-fire to-lunar font-display text-h1 leading-none text-ink-inverse shadow-altar",
              )}
            >
              {practitioner.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={practitioner.avatar_url}
                  alt=""
                  className="size-full rounded-[1.4rem] object-cover"
                />
              ) : (
                practitioner.display_name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
              )}
            </div>
          </Reveal>
          <Reveal delay={120} className="flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {practitioner.primary_direction && (
                <ElementalChip direction={practitioner.primary_direction} size="md" />
              )}
              <Badge variant="outline" className={cn("border", tier.className)}>
                {tier.label}
              </Badge>
            </div>
            <DisplayHeading level={1} size="h1" className="leading-[1.05]">
              {practitioner.display_name}
            </DisplayHeading>
            {practitioner.tagline && (
              <p className="mt-3 text-body-lg text-ink-subtle text-pretty">
                {practitioner.tagline}
              </p>
            )}
          </Reveal>
        </header>

        {practitioner.modalities && practitioner.modalities.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {practitioner.modalities.map((m) => (
              <Badge key={m} variant="default" size="md">
                {m}
              </Badge>
            ))}
          </div>
        )}

        {practitioner.bio && (
          <Card variant="default" className="mb-10">
            <CardContent className="p-7">
              <LongForm size="compact">
                <div className="whitespace-pre-line">{practitioner.bio}</div>
              </LongForm>
            </CardContent>
          </Card>
        )}

        {courses.length > 0 && (
          <Card variant="default" className="mb-10">
            <CardHeader>
              <CardTitle>Courses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {courses.map((c) => (
                <Link
                  key={c.id}
                  href={`/v/${practitioner!.slug}/courses/${c.slug}`}
                  className="group/row flex items-center justify-between rounded-xl border border-subtle p-4 transition-colors duration-quick hover:border-strong hover:bg-glass"
                >
                  <div>
                    <p className="font-medium text-ink">{c.title}</p>
                    {c.description && (
                      <p className="text-caption text-ink-muted line-clamp-1">{c.description}</p>
                    )}
                  </div>
                  <span className="font-display text-h6 text-air tabular-nums">
                    ${(c.price_cents / 100).toFixed(2)}
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

        <Card variant="altar" className="mb-16 overflow-hidden p-0">
          <div className="relative grid items-center gap-6 px-7 py-7 md:grid-cols-[1fr_auto] md:px-10 md:py-9">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-earth-soft via-transparent to-lunar-soft opacity-70"
            />
            <div className="relative">
              <p className="text-caption uppercase tracking-widest text-ink-muted">Book directly</p>
              <p className="font-display text-h4 text-ink leading-tight">
                Schedule a private session
              </p>
              <p className="mt-1 text-label text-ink-subtle">
                Reach out to {practitioner.display_name.split(" ")[0]} to plan your time.
              </p>
            </div>
            <div className="relative flex flex-wrap gap-3">
              <Button asChild variant="brand" size="lg">
                <Link
                  href={`mailto:hello@fourcorners.village?subject=Booking ${practitioner.display_name}`}
                >
                  <Mail className="size-4" />
                  Inquire
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/practitioners">
                  <Calendar className="size-4" />
                  See others
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
