"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Ambient Aurora — soft slow-drifting radial gradients used as the backdrop
 * for hero sections, the dashboard, and altars.
 *
 * Reads `--moon-glow-strength` from the lunar bridge so it pulses subtly with
 * the moon. Pure CSS — no canvas/WebGL — so it stays cheap on mobile.
 *
 * Variants:
 *   - cosmic   default. Lunar + air + fire blend; works on any dark surface.
 *   - sunrise  warmer East-leaning blend for marketing hero.
 *   - dusk     cooler North/West blend for the dashboard / settings.
 *   - altar    slow lunar-only pulse for the Altars surface.
 */
type AuroraVariant = "cosmic" | "sunrise" | "dusk" | "altar";

const variantStyles: Record<AuroraVariant, React.CSSProperties> = {
  cosmic: {
    background: `
      radial-gradient(ellipse 60% 45% at 30% 35%, var(--air-soft) 0%, transparent 60%),
      radial-gradient(ellipse 55% 50% at 70% 60%, var(--lunar-soft) 0%, transparent 60%),
      radial-gradient(ellipse 45% 55% at 50% 80%, var(--fire-soft) 0%, transparent 65%)
    `,
  },
  sunrise: {
    background: `
      radial-gradient(ellipse 70% 50% at 25% 40%, var(--air-soft) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 80% 30%, var(--fire-soft) 0%, transparent 65%),
      radial-gradient(ellipse 40% 50% at 50% 90%, var(--lunar-soft) 0%, transparent 65%)
    `,
  },
  dusk: {
    background: `
      radial-gradient(ellipse 60% 50% at 20% 30%, var(--water-soft) 0%, transparent 65%),
      radial-gradient(ellipse 50% 60% at 80% 70%, var(--lunar-soft) 0%, transparent 65%),
      radial-gradient(ellipse 40% 40% at 50% 50%, var(--earth-soft) 0%, transparent 70%)
    `,
  },
  altar: {
    background: `
      radial-gradient(ellipse 70% 60% at 50% 50%, var(--lunar-soft) 0%, transparent 65%)
    `,
  },
};

export function AmbientAurora({
  variant = "cosmic",
  className,
  intensity = 1,
  blur = "lg",
}: {
  variant?: AuroraVariant;
  className?: string;
  intensity?: number;
  blur?: "md" | "lg" | "xl";
}) {
  const blurMap = { md: "blur(36px)", lg: "blur(48px)", xl: "blur(72px)" };
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-[-25%] aurora", className)}
      style={{
        ...variantStyles[variant],
        filter: blurMap[blur],
        opacity: `calc((0.55 + var(--moon-glow-strength) * 0.45) * ${intensity})`,
      }}
    />
  );
}
