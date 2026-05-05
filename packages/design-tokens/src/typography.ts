/**
 * Typography — pairs a humanist serif (Fraunces) for display with a modern
 * grotesque (Geist Sans) for body. Weights and sizes use a major-second scale
 * with `clamp()`-based fluidity for headings.
 *
 * Fraunces' optical-sizing axis (`opsz`) is leveraged: tighter at large sizes,
 * looser at small sizes, the way a stone-cut serif behaves on inscription vs.
 * book.
 */
export const typography = {
  family: {
    display: '"Fraunces", "Cormorant Garamond", ui-serif, Georgia, serif',
    body: '"Geist", "Geist Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
    mono: '"Geist Mono", ui-monospace, "JetBrains Mono", "Fira Code", monospace',
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },
  // Fluid type. `fluid()` returns a clamp() that scales between 360px-1280px viewport.
  size: {
    micro: "0.6875rem", // 11px
    caption: "0.75rem", // 12px
    label: "0.8125rem", // 13px
    body: "1rem", // 16px
    bodyLg: "1.125rem", // 18px
    h6: "clamp(1.0625rem, 1rem + 0.3125vw, 1.25rem)",
    h5: "clamp(1.25rem, 1.125rem + 0.625vw, 1.5rem)",
    h4: "clamp(1.5rem, 1.25rem + 1.25vw, 1.875rem)",
    h3: "clamp(1.875rem, 1.5rem + 1.875vw, 2.5rem)",
    h2: "clamp(2.5rem, 2rem + 2.5vw, 3.75rem)",
    h1: "clamp(3rem, 2.25rem + 3.75vw, 5rem)",
    display: "clamp(3.5rem, 2.5rem + 5vw, 6.5rem)",
    cinema: "clamp(4.5rem, 3rem + 7.5vw, 9rem)",
  },
  // Optical-sizing values for Fraunces. Maps to `font-variation-settings`.
  opticalSize: {
    text: 14,
    title: 36,
    display: 96,
    cinema: 144,
  },
  leading: {
    tight: 1.05,
    snug: 1.18,
    normal: 1.4,
    relaxed: 1.55,
    spacious: 1.75,
  },
  tracking: {
    tightest: "-0.04em",
    tight: "-0.02em",
    normal: "0",
    wide: "0.04em",
    wider: "0.08em",
    widest: "0.16em",
  },
} as const;

export type FontFamily = keyof typeof typography.family;
export type FontSize = keyof typeof typography.size;
export type FontWeight = keyof typeof typography.weight;
