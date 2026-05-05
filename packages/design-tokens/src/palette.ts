/**
 * Primitive color palette.
 *
 * Stops follow a 50–950 scale. Saturation rises slightly toward 500–600
 * and falls toward 50 / 950 to feel "natural" rather than digitally bright.
 *
 * Elemental ramps are tuned to feel like the element they represent at dusk:
 *   air   — pale solar glow at horizon (warm sand → amber → ember)
 *   fire  — magma flow (peach → coral → crimson)
 *   water — moonlit ocean depth (cyan-tinted teal → indigo → midnight)
 *   earth — verdant moss & lichen (mint → emerald → forest)
 *
 * `ink` is the base canvas — never pure #000. `parchment` is the warm light-mode
 * canvas, and `lunar` is the sacred silver thread used for accents and orbs.
 */
export const palette = {
  ink: {
    50: "#F4F2F8",
    100: "#E1DEEA",
    200: "#BDB7CF",
    300: "#9890B0",
    400: "#736B92",
    500: "#544D75",
    600: "#3C375B",
    700: "#2A2742",
    800: "#1B1A2E",
    900: "#11101F",
    950: "#08081A",
  },
  parchment: {
    50: "#FBF8F2",
    100: "#F4EFE2",
    200: "#E9DFC6",
    300: "#DBCBA1",
    400: "#C8B27A",
    500: "#B6995A",
    600: "#9A7E45",
    700: "#7A6336",
    800: "#5C4A28",
    900: "#3F321B",
    950: "#241D10",
  },
  lunar: {
    50: "#FBFBFE",
    100: "#F2F1FB",
    200: "#E1DFF5",
    300: "#C7C3EC",
    400: "#A8A2DD",
    500: "#8B83CB",
    600: "#7068B0",
    700: "#564F8C",
    800: "#3D386A",
    900: "#262346",
    950: "#15132A",
  },
  air: {
    50: "#FFFAEA",
    100: "#FEF1C7",
    200: "#FDE38B",
    300: "#FCD24E",
    400: "#FBC02C",
    500: "#F2A50C",
    600: "#D17F08",
    700: "#A85C0B",
    800: "#874810",
    900: "#6F3A12",
    950: "#3E1D06",
  },
  fire: {
    50: "#FFF1ED",
    100: "#FFDFD3",
    200: "#FFBBA7",
    300: "#FF8E70",
    400: "#FF5F3F",
    500: "#F23B1D",
    600: "#D02410",
    700: "#A91710",
    800: "#871513",
    900: "#6F1715",
    950: "#3D0707",
  },
  water: {
    50: "#EDF8FB",
    100: "#D2EEF4",
    200: "#9ADAE9",
    300: "#5DC2DA",
    400: "#2BA3C0",
    500: "#1685A2",
    600: "#106B85",
    700: "#11546A",
    800: "#134659",
    900: "#0F3B4D",
    950: "#06222F",
  },
  earth: {
    50: "#EEFAF1",
    100: "#D5F2DD",
    200: "#ACE3BC",
    300: "#76CC93",
    400: "#41AE6B",
    500: "#249050",
    600: "#187442",
    700: "#155C37",
    800: "#13492E",
    900: "#103D27",
    950: "#062017",
  },
  // Pure utilities
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
  // Semantic alerts (always in fire/earth scales)
  danger: {
    50: "#FFF1ED",
    400: "#FF5F3F",
    600: "#D02410",
    900: "#6F1715",
  },
  success: {
    50: "#EEFAF1",
    400: "#41AE6B",
    600: "#187442",
    900: "#103D27",
  },
} as const;

export type Palette = typeof palette;
