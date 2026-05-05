"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { calculateLunarPhase } from "@four-corners/ui-primitives";
import { LunarOrb as LunarOrbSvg } from "@/components/brand/sacred-geometry";

/**
 * LunarOrb (live) — wraps the SVG orb with the current lunar phase. Used in
 * the hero, the dashboard sidebar, and the altars.
 *
 * The phase calculation depends on `Date.now()`, which produces a fractionally
 * different `illumination` on the server vs. the client and causes hydration
 * mismatches on the SVG `cx` attribute. To avoid that we render a fixed
 * half-illuminated placeholder during SSR, and swap to the live phase after
 * mount. Resolution is hour-level so we update once a minute.
 */
const PLACEHOLDER_ILLUMINATION = 0.5;

export function LunarOrbLive({
  size = 160,
  className,
  showCaption = false,
}: {
  size?: number;
  className?: string;
  showCaption?: boolean;
}) {
  const [mounted, setMounted] = React.useState(false);
  const [phase, setPhase] = React.useState(() => calculateLunarPhase());

  React.useEffect(() => {
    setMounted(true);
    setPhase(calculateLunarPhase());
    const id = window.setInterval(() => setPhase(calculateLunarPhase()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const illumination = mounted ? phase.illumination : PLACEHOLDER_ILLUMINATION;

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div
        className="animate-orb-pulse"
        style={{ transform: `scale(var(--moon-orb-scale, 1))` }}
      >
        <LunarOrbSvg size={size} illumination={illumination} />
      </div>
      {showCaption && (
        <div className="text-center" suppressHydrationWarning>
          {mounted ? (
            <>
              <p className="font-display text-h6 text-ink">
                {phase.glyph} {phaseLabel(phase.name)}
              </p>
              <p className="mt-1 text-caption text-ink-muted max-w-[28ch] text-balance">
                {phase.guidance}
              </p>
            </>
          ) : (
            <>
              <p className="font-display text-h6 text-ink">◐</p>
              <p className="mt-1 text-caption text-ink-muted max-w-[28ch] text-balance">
                Reading the sky…
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function phaseLabel(name: string) {
  return name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
