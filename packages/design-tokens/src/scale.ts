/**
 * Spatial scale — base unit 4px.
 *
 * Names use functional roles, not numeric units, so designers can talk about
 * "card padding" without locking in a value. Derived numeric tokens (px-X) are
 * available as escape hatches.
 */
export const space = {
  px: "1px",
  0: "0",
  hairline: "2px",
  micro: "4px",
  xs: "8px",
  sm: "12px",
  md: "16px",
  lg: "20px",
  xl: "24px",
  "2xl": "32px",
  "3xl": "40px",
  "4xl": "48px",
  "5xl": "64px",
  "6xl": "80px",
  "7xl": "96px",
  "8xl": "120px",
  "9xl": "160px",
  "10xl": "200px",
  cathedral: "256px",
} as const;

/**
 * Radius — soft-modern. Avoids both razor-sharp corners and "balloon" pill
 * radii. `orb` is for fully circular elements.
 */
export const radius = {
  none: "0",
  sharp: "2px",
  sm: "6px",
  md: "10px",
  lg: "14px",
  xl: "20px",
  "2xl": "28px",
  "3xl": "40px",
  pill: "9999px",
  orb: "50%",
} as const;

/**
 * Elevation. Layered shadow + ambient glow — the glow is what makes the dark
 * theme feel sacred rather than flat.
 */
export const shadow = {
  none: "none",
  whisper: "0 1px 2px rgba(8, 8, 26, 0.18)",
  rest: "0 4px 12px -2px rgba(8, 8, 26, 0.32)",
  raised: "0 8px 24px -6px rgba(8, 8, 26, 0.40), 0 2px 6px rgba(8, 8, 26, 0.18)",
  altar:
    "0 24px 48px -12px rgba(8, 8, 26, 0.50), 0 8px 16px -4px rgba(8, 8, 26, 0.25), 0 0 0 1px rgba(255,255,255,0.04)",
  glow: {
    air: "0 0 32px rgba(251, 192, 44, 0.35)",
    fire: "0 0 32px rgba(255, 95, 63, 0.35)",
    water: "0 0 32px rgba(43, 163, 192, 0.35)",
    earth: "0 0 32px rgba(65, 174, 107, 0.35)",
    lunar: "0 0 48px rgba(168, 162, 221, 0.35)",
  },
} as const;

export const blur = {
  none: "0",
  whisper: "4px",
  veil: "12px",
  fog: "24px",
  haze: "48px",
} as const;

export type Space = keyof typeof space;
export type Radius = keyof typeof radius;
