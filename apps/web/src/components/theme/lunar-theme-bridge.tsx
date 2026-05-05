"use client";

import * as React from "react";
import { calculateLunarPhase, lunarThemeValues } from "@four-corners/ui-primitives";

/**
 * Bridge between the lunar phase calculator and CSS custom properties.
 *
 * On mount we calculate the current phase and write its `glowStrength`,
 * `accentHueShift`, `altarLuminance`, and `orbScale` into CSS variables on the
 * <html> element. The aurora gradient, lunar orb, and altar surfaces all read
 * from those variables, so the entire UI subtly shifts with the moon.
 *
 * Re-evaluates every minute (cheap), and writes a `data-moon` attribute that
 * components can use for phase-specific styling without recalculating.
 */
export function LunarThemeBridge() {
  React.useEffect(() => {
    const apply = () => {
      const phase = calculateLunarPhase();
      const values = lunarThemeValues(phase);
      const root = document.documentElement;
      root.dataset.moon = phase.name;
      root.style.setProperty("--moon-progress", phase.progress.toFixed(4));
      root.style.setProperty("--moon-illumination", phase.illumination.toFixed(4));
      root.style.setProperty("--moon-glow-strength", values.glowStrength.toFixed(4));
      root.style.setProperty("--moon-accent-hue-shift", `${values.accentHueShift.toFixed(2)}deg`);
      root.style.setProperty("--moon-altar-luminance", values.altarLuminance.toFixed(4));
      root.style.setProperty("--moon-orb-scale", values.orbScale.toFixed(4));
    };
    apply();
    const id = window.setInterval(apply, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return null;
}
