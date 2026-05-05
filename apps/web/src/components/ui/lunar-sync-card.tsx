"use client";

import * as React from "react";
import { Moon } from "lucide-react";
import { calculateLunarPhase } from "@four-corners/ui-primitives";
import { LunarOrb as LunarOrbSvg } from "@/components/brand/sacred-geometry";
import { cn } from "@/lib/utils";

/**
 * LunarSyncCard — magazine-style card surfacing the current lunar phase, its
 * traditional guidance, and the illumination percent. Used in the member
 * dashboard sidebar.
 *
 * The phase is computed from `Date.now()`, so server-rendered illumination is
 * fractionally different from the client value and triggers hydration
 * mismatches on the orb SVG. We render a stable 50% half-moon during SSR
 * and swap to the live phase after mount.
 */
export function LunarSyncCard({ className }: { className?: string }) {
  const [mounted, setMounted] = React.useState(false);
  const [phase, setPhase] = React.useState(() => calculateLunarPhase());

  React.useEffect(() => {
    setMounted(true);
    setPhase(calculateLunarPhase());
    const id = window.setInterval(() => setPhase(calculateLunarPhase()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const illumination = mounted ? phase.illumination : 0.5;
  const illuminationPct = Math.round(illumination * 100);
  const formatted = mounted ? phaseLabel(phase.name) : "First Quarter";
  const glyph = mounted ? phase.glyph : "◐";
  const guidance = mounted
    ? phase.guidance
    : "Reading the sky…";
  const daysUntilNext = mounted ? phase.daysUntilNext : 0;
  const nextPhase = mounted ? phaseLabel(phase.nextPhase) : "Full Moon";

  return (
    <article
      className={cn(
        "group/lunar relative overflow-hidden rounded-3xl border border-subtle",
        "bg-gradient-to-br from-lunar-soft via-canvas-subtle to-air-soft",
        "p-6 shadow-rest",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-12 size-48 rounded-full bg-lunar/30 opacity-50 blur-3xl transition-opacity duration-slow group-hover/lunar:opacity-90"
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1" suppressHydrationWarning>
          <p className="inline-flex items-center gap-2 text-caption uppercase tracking-widest text-ink-muted">
            <Moon className="size-3" />
            Lunar sync
          </p>
          <p className="mt-3 font-display text-h4 leading-tight text-ink">
            <span aria-hidden className="mr-2">
              {glyph}
            </span>
            {formatted}
          </p>
          <p className="mt-2 font-mono text-caption tabular-nums text-ink-muted">
            {illuminationPct}% illuminated · {daysUntilNext} day
            {daysUntilNext === 1 ? "" : "s"} until {nextPhase}
          </p>
        </div>
        <div className="shrink-0">
          <div
            className="animate-orb-pulse"
            style={{ transform: `scale(var(--moon-orb-scale, 1))` }}
          >
            <LunarOrbSvg size={84} illumination={illumination} />
          </div>
        </div>
      </div>

      <p className="relative mt-5 text-label text-ink-subtle text-pretty" suppressHydrationWarning>
        {guidance}
      </p>

      <div className="relative mt-5 h-1 w-full overflow-hidden rounded-full bg-glass-strong">
        <div
          className="h-full rounded-full bg-gradient-to-r from-air via-lunar to-fire transition-all duration-slow"
          style={{ width: `${illuminationPct}%` }}
        />
      </div>
    </article>
  );
}

function phaseLabel(name: string) {
  return name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
