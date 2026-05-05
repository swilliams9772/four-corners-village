import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Eyebrow, DisplayHeading, Lede } from "@/components/ui/typography";
import { AmbientAurora } from "@/components/ui/ambient-aurora";
import { LunarOrbLive } from "@/components/ui/lunar-orb-live";
import { VesicaPiscis } from "@/components/brand/sacred-geometry";
import { OracleReader } from "./oracle-reader";

export const metadata = { title: "Oracle" };

export default function OraclePage() {
  return (
    <div className="relative isolate mx-auto max-w-3xl px-6 py-12">
      <AmbientAurora variant="cosmic" intensity={0.5} blur="xl" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 right-4 size-72 opacity-[0.05]"
      >
        <VesicaPiscis />
      </div>

      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <Eyebrow>
            <Sparkles className="size-3" /> Reading
          </Eyebrow>
          <DisplayHeading level={1} size="h1" className="mt-3">
            The oracle
          </DisplayHeading>
          <Lede className="mt-4">
            A three-card spread, drawn through the present moon. Held in lunar timing, woven with
            living symbology — meant to point, not predict.
          </Lede>
        </div>
        <div className="hidden h-28 w-28 shrink-0 md:block">
          <LunarOrbLive />
        </div>
      </div>

      <Card variant="altar" className="overflow-hidden">
        <CardContent className="p-7 md:p-9">
          <OracleReader />
        </CardContent>
      </Card>
    </div>
  );
}
