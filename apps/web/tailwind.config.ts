import type { Config } from "tailwindcss";
import { designTokensPreset } from "@four-corners/design-tokens/tailwind";

const config: Config = {
  darkMode: ["class", "[data-theme='dark']"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui-primitives/src/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [designTokensPreset as Config],
  plugins: [require("tailwindcss-animate")],
};

export default config;
