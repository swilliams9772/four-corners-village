import { redirect } from "next/navigation";
import { Flame, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Eyebrow, DisplayHeading, Lede } from "@/components/ui/typography";
import { AmbientAurora } from "@/components/ui/ambient-aurora";
import { LunarOrbLive } from "@/components/ui/lunar-orb-live";
import { Mandala } from "@/components/brand/sacred-geometry";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AltarBoard } from "./altar-board";
import type { Altar, AltarOffering } from "@/lib/supabase/types";

export const metadata = { title: "Digital Altars" };

export default async function AltarsPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/login");

  const supabase = await createClient();
  let altars: Altar[] = [];
  let initialOfferings: AltarOffering[] = [];

  if (supabase) {
    const { data: a } = await supabase
      .from("altars")
      .select("*")
      .order("is_global", { ascending: false });
    altars = (a as Altar[] | null) ?? [];

    if (altars.length > 0) {
      const { data: off } = await supabase
        .from("altar_offerings")
        .select("*")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(200);
      initialOfferings = (off as AltarOffering[] | null) ?? [];
    }
  }

  const villageAltar = altars.find((a) => a.is_global) ?? altars[0];

  return (
    <div className="relative isolate mx-auto max-w-5xl px-6 py-12">
      <AmbientAurora variant="cosmic" intensity={0.4} blur="xl" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-0 size-[420px] opacity-[0.06]"
      >
        <Mandala />
      </div>

      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <Eyebrow>
            <Flame className="size-3" /> Sacred space
          </Eyebrow>
          <DisplayHeading level={1} size="h1" className="mt-3">
            Digital altars
          </DisplayHeading>
          <Lede className="mt-4">
            Light a candle, leave a prayer, place an intention. Offerings are visible to the
            village for seven days, then return to silence.
          </Lede>
        </div>
        <div className="hidden h-28 w-28 shrink-0 md:block">
          <LunarOrbLive />
        </div>
      </div>

      {villageAltar ? (
        <Card variant="altar" className="overflow-hidden">
          <div className="border-b border-subtle px-7 py-6">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-lunar" />
              <p className="text-caption uppercase tracking-widest text-ink-muted">
                {villageAltar.is_global ? "The village altar" : "Altar"}
              </p>
            </div>
            <DisplayHeading level={2} size="h4" className="mt-2 leading-tight">
              {villageAltar.name}
            </DisplayHeading>
            {villageAltar.description && (
              <p className="mt-2 text-label text-ink-subtle">{villageAltar.description}</p>
            )}
          </div>
          <CardContent className="p-7">
            <AltarBoard altarId={villageAltar.id} initialOfferings={initialOfferings} />
          </CardContent>
        </Card>
      ) : (
        <Card variant="sunken">
          <CardContent className="p-12 text-center text-caption text-ink-muted">
            Altars haven't been set up yet. Check back soon.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
