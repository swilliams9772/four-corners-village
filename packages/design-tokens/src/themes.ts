import { palette } from "./palette";

/**
 * Semantic theme — UI consumes these names, not raw palette references.
 * Each theme is a flat object so it's trivial to convert to CSS variables
 * or pass into a NativeWind preset.
 */
type SemanticTheme = {
  // Surfaces
  bg: {
    canvas: string;
    elevated: string;
    sunken: string;
    overlay: string;
    glass: string;
  };
  // Text
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
    accent: string;
  };
  // Borders / strokes
  border: {
    subtle: string;
    default: string;
    strong: string;
    focus: string;
  };
  // Brand / interactive
  brand: {
    DEFAULT: string;
    hover: string;
    active: string;
    foreground: string;
  };
  // Elemental — used to color sections / chips that map to East/South/West/North
  air: { DEFAULT: string; soft: string; foreground: string };
  fire: { DEFAULT: string; soft: string; foreground: string };
  water: { DEFAULT: string; soft: string; foreground: string };
  earth: { DEFAULT: string; soft: string; foreground: string };
  lunar: { DEFAULT: string; soft: string; foreground: string };
  // Status
  success: { DEFAULT: string; soft: string; foreground: string };
  danger: { DEFAULT: string; soft: string; foreground: string };
};

export const darkTheme: SemanticTheme = {
  bg: {
    canvas: palette.ink[950],
    elevated: palette.ink[900],
    sunken: palette.black,
    overlay: "rgba(8, 8, 26, 0.72)",
    glass: "rgba(27, 26, 46, 0.55)",
  },
  text: {
    primary: palette.parchment[50],
    secondary: palette.ink[200],
    muted: palette.ink[400],
    inverse: palette.ink[950],
    accent: palette.air[400],
  },
  border: {
    subtle: "rgba(241, 232, 211, 0.06)",
    default: "rgba(241, 232, 211, 0.10)",
    strong: "rgba(241, 232, 211, 0.20)",
    focus: palette.air[400],
  },
  brand: {
    DEFAULT: palette.air[400],
    hover: palette.air[300],
    active: palette.air[500],
    foreground: palette.ink[950],
  },
  air: { DEFAULT: palette.air[400], soft: "rgba(251, 192, 44, 0.16)", foreground: palette.air[100] },
  fire: { DEFAULT: palette.fire[400], soft: "rgba(255, 95, 63, 0.16)", foreground: palette.fire[100] },
  water: { DEFAULT: palette.water[300], soft: "rgba(93, 194, 218, 0.16)", foreground: palette.water[100] },
  earth: { DEFAULT: palette.earth[400], soft: "rgba(65, 174, 107, 0.18)", foreground: palette.earth[100] },
  lunar: { DEFAULT: palette.lunar[300], soft: "rgba(199, 195, 236, 0.16)", foreground: palette.lunar[100] },
  success: { DEFAULT: palette.earth[400], soft: "rgba(65, 174, 107, 0.18)", foreground: palette.earth[50] },
  danger: { DEFAULT: palette.fire[400], soft: "rgba(255, 95, 63, 0.18)", foreground: palette.fire[50] },
};

export const lightTheme: SemanticTheme = {
  bg: {
    canvas: palette.parchment[50],
    elevated: palette.white,
    sunken: palette.parchment[100],
    overlay: "rgba(36, 29, 16, 0.40)",
    glass: "rgba(255, 255, 255, 0.65)",
  },
  text: {
    primary: palette.ink[900],
    secondary: palette.ink[700],
    muted: palette.ink[500],
    inverse: palette.parchment[50],
    accent: palette.fire[600],
  },
  border: {
    subtle: "rgba(17, 16, 31, 0.06)",
    default: "rgba(17, 16, 31, 0.10)",
    strong: "rgba(17, 16, 31, 0.16)",
    focus: palette.fire[600],
  },
  brand: {
    DEFAULT: palette.fire[600],
    hover: palette.fire[500],
    active: palette.fire[700],
    foreground: palette.parchment[50],
  },
  air: { DEFAULT: palette.air[600], soft: palette.air[100], foreground: palette.air[800] },
  fire: { DEFAULT: palette.fire[600], soft: palette.fire[100], foreground: palette.fire[800] },
  water: { DEFAULT: palette.water[600], soft: palette.water[100], foreground: palette.water[800] },
  earth: { DEFAULT: palette.earth[600], soft: palette.earth[100], foreground: palette.earth[800] },
  lunar: { DEFAULT: palette.lunar[600], soft: palette.lunar[100], foreground: palette.lunar[800] },
  success: { DEFAULT: palette.earth[600], soft: palette.earth[100], foreground: palette.earth[800] },
  danger: { DEFAULT: palette.fire[600], soft: palette.fire[100], foreground: palette.fire[800] },
};

export type Theme = SemanticTheme;
export type ThemeName = "dark" | "light";

export const themes: Record<ThemeName, Theme> = {
  dark: darkTheme,
  light: lightTheme,
};
