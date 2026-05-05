import type { LunarPhase } from "@four-corners/api-types";

const SYNODIC_MONTH = 29.530588853;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);

const PHASE_BOUNDARIES: { upTo: number; name: LunarPhase["name"]; glyph: string }[] = [
  { upTo: 1.84566, name: "new", glyph: "🌑" },
  { upTo: 5.53699, name: "waxing-crescent", glyph: "🌒" },
  { upTo: 9.22831, name: "first-quarter", glyph: "🌓" },
  { upTo: 12.91963, name: "waxing-gibbous", glyph: "🌔" },
  { upTo: 16.61096, name: "full", glyph: "🌕" },
  { upTo: 20.30228, name: "waning-gibbous", glyph: "🌖" },
  { upTo: 23.99361, name: "last-quarter", glyph: "🌗" },
  { upTo: SYNODIC_MONTH, name: "waning-crescent", glyph: "🌘" },
];

const GUIDANCE: Record<LunarPhase["name"], string> = {
  new: "Set intentions. Plant seeds.",
  "waxing-crescent": "Take small actions toward your intentions.",
  "first-quarter": "Push through resistance. Decisions clarify.",
  "waxing-gibbous": "Refine. Adjust. Trust the process.",
  full: "Illumination. Celebrate. See clearly.",
  "waning-gibbous": "Share what you've learned. Express gratitude.",
  "last-quarter": "Release. Forgive. Let go of what no longer serves.",
  "waning-crescent": "Rest. Reflect. Prepare for the new cycle.",
};

/**
 * Calculate current lunar phase. Returns the same shape used by both web and
 * mobile so the lunar theming engine works consistently.
 */
export function calculateLunarPhase(date: Date = new Date()): LunarPhase & {
  guidance: string;
  daysUntilNext: number;
  nextPhase: LunarPhase["name"];
} {
  const diffDays = (date.getTime() - KNOWN_NEW_MOON) / (1000 * 60 * 60 * 24);
  const age = ((diffDays % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
  const illumination = (1 - Math.cos((2 * Math.PI * age) / SYNODIC_MONTH)) / 2;
  const progress = age / SYNODIC_MONTH;

  const matchIndex = PHASE_BOUNDARIES.findIndex((p) => age < p.upTo);
  const safeIndex = matchIndex === -1 ? PHASE_BOUNDARIES.length - 1 : matchIndex;
  const match = PHASE_BOUNDARIES[safeIndex];
  const next = PHASE_BOUNDARIES[(safeIndex + 1) % PHASE_BOUNDARIES.length];

  // Days until the next boundary; wrap across cycle if necessary.
  const ageAtNext = next.upTo > age ? next.upTo : next.upTo + SYNODIC_MONTH;
  const daysUntilNext = Math.max(1, Math.round(ageAtNext - age));

  return {
    progress,
    illumination,
    name: match.name,
    glyph: match.glyph,
    guidance: GUIDANCE[match.name],
    daysUntilNext,
    nextPhase: next.name,
  };
}

/**
 * Lunar theming engine — returns the visual values the UI should apply for
 * the current moon phase. Drives:
 *   - hero gradient saturation
 *   - lunar orb opacity / glow strength
 *   - altar background brightness
 *   - cursor / focus ring tint shift
 *
 * Web reads these and writes them into CSS custom properties on the html
 * element. Mobile reads them as JS values and pipes into Reanimated shared
 * values.
 */
export function lunarThemeValues(phase: { illumination: number; progress: number }) {
  const { illumination, progress } = phase;

  // Glow strength peaks at full moon (illumination=1) and is faintest at new moon.
  const glowStrength = 0.18 + illumination * 0.42;

  // Hero gradient hue shifts subtly across the cycle: cooler near new, warmer near full.
  const accentHueShift = Math.sin(progress * Math.PI * 2) * 6; // -6deg..+6deg

  // Altar background brightens at full moon for the "lit" feeling.
  const altarLuminance = 0.04 + illumination * 0.06;

  // Lunar orb visual size pulse — bigger near full
  const orbScale = 1 + illumination * 0.08;

  return {
    glowStrength,
    accentHueShift,
    altarLuminance,
    orbScale,
  };
}

export type LunarThemeValues = ReturnType<typeof lunarThemeValues>;
