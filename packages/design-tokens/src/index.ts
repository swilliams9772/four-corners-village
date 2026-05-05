/**
 * 4 Corners Village — Design Tokens
 *
 * Single source of truth for color, type, space, motion.
 * Consumed by the web (Tailwind preset + CSS vars) and the mobile app
 * (NativeWind + StyleSheet).
 *
 * Token philosophy:
 * - Primitive scales (color stops, sizes, weights) live in raw collections.
 * - Semantic tokens (`bg.canvas`, `text.primary`) reference primitives by name and
 *   resolve based on theme. UI code MUST use semantic tokens, never primitives.
 * - Elemental tokens map the four-directions metaphor (Air/Fire/Water/Earth) used
 *   throughout the brand to color ramps.
 */

import { palette } from "./palette";
import { space, radius, shadow, blur } from "./scale";
import { typography } from "./typography";
import { motion, easing, duration } from "./motion";
import { darkTheme, lightTheme } from "./themes";

export { palette, space, radius, shadow, blur, typography, motion, easing, duration };
export { darkTheme, lightTheme };
export type { Theme, ThemeName } from "./themes";

export const tokens = {
  palette,
  space,
  radius,
  shadow,
  blur,
  typography,
  motion,
  easing,
  duration,
};

export type Tokens = typeof tokens;
