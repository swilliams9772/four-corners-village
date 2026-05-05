/**
 * Tailwind config for NativeWind on mobile.
 *
 * The web app reads design tokens at runtime via CSS variables; mobile needs
 * static values at build time. We mirror the dark-theme defaults from
 * `packages/design-tokens/src/themes.ts` here. When tokens change, update both.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "../../packages/ui-primitives/src/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        display: ["Fraunces_500Medium"],
        "display-bold": ["Fraunces_600SemiBold"],
        body: ["Geist_400Regular"],
        "body-medium": ["Geist_500Medium"],
        mono: ["Geist_400Regular"],
      },
      colors: {
        canvas: "#0B0B12",
        elevated: "#11101F",
        sunken: "#000000",
        glass: "rgba(27, 26, 46, 0.55)",
        ink: {
          DEFAULT: "#F1E8D3",
          subtle: "#C8C5BA",
          muted: "#7C7B85",
          inverse: "#0B0B12",
        },
        border: {
          subtle: "rgba(241, 232, 211, 0.06)",
          DEFAULT: "rgba(241, 232, 211, 0.10)",
          strong: "rgba(241, 232, 211, 0.20)",
        },
        brand: {
          DEFAULT: "#FBC02C",
          foreground: "#0B0B12",
        },
        air: {
          DEFAULT: "#FBC02C",
          soft: "rgba(251, 192, 44, 0.16)",
        },
        fire: {
          DEFAULT: "#FF5F3F",
          soft: "rgba(255, 95, 63, 0.16)",
        },
        water: {
          DEFAULT: "#5DC2DA",
          soft: "rgba(93, 194, 218, 0.16)",
        },
        earth: {
          DEFAULT: "#41AE6B",
          soft: "rgba(65, 174, 107, 0.18)",
        },
        lunar: {
          DEFAULT: "#C7C3EC",
          soft: "rgba(199, 195, 236, 0.16)",
        },
      },
    },
  },
  plugins: [],
};
