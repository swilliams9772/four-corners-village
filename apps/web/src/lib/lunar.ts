/**
 * Approximate lunar phase calculation based on a known new moon and
 * the synodic month (29.530588853 days). Good enough for theming and
 * daily affirmations; for exact ephemeris use the swisseph library.
 */

const SYNODIC_MONTH = 29.530588853;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14); // 2000-01-06 18:14 UTC

export type LunarPhase =
  | "new"
  | "waxing-crescent"
  | "first-quarter"
  | "waxing-gibbous"
  | "full"
  | "waning-gibbous"
  | "last-quarter"
  | "waning-crescent";

export type LunarInfo = {
  phase: LunarPhase;
  illumination: number; // 0..1
  age: number; // days into cycle
  emoji: string;
  guidance: string;
};

export function getLunarPhase(date: Date = new Date()): LunarInfo {
  const diffDays = (date.getTime() - KNOWN_NEW_MOON) / (1000 * 60 * 60 * 24);
  const age = ((diffDays % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
  const illumination = (1 - Math.cos((2 * Math.PI * age) / SYNODIC_MONTH)) / 2;

  let phase: LunarPhase;
  let emoji: string;
  let guidance: string;

  if (age < 1.84566) {
    phase = "new";
    emoji = "🌑";
    guidance = "Set intentions. Plant seeds.";
  } else if (age < 5.53699) {
    phase = "waxing-crescent";
    emoji = "🌒";
    guidance = "Take small actions toward your intentions.";
  } else if (age < 9.22831) {
    phase = "first-quarter";
    emoji = "🌓";
    guidance = "Push through resistance. Decisions clarify.";
  } else if (age < 12.91963) {
    phase = "waxing-gibbous";
    emoji = "🌔";
    guidance = "Refine. Adjust. Trust the process.";
  } else if (age < 16.61096) {
    phase = "full";
    emoji = "🌕";
    guidance = "Illumination. Celebrate. See clearly.";
  } else if (age < 20.30228) {
    phase = "waning-gibbous";
    emoji = "🌖";
    guidance = "Share what you've learned. Express gratitude.";
  } else if (age < 23.99361) {
    phase = "last-quarter";
    emoji = "🌗";
    guidance = "Release. Forgive. Let go of what no longer serves.";
  } else {
    phase = "waning-crescent";
    emoji = "🌘";
    guidance = "Rest. Reflect. Prepare for the new cycle.";
  }

  return { phase, illumination, age, emoji, guidance };
}
