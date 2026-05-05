import type { Config } from "tailwindcss";
import { space, radius, shadow } from "./scale";
import { typography } from "./typography";
import { duration, easing } from "./motion";

/**
 * Shared Tailwind preset. Apps' tailwind.config.ts extends this so the design
 * system stays the single source of truth.
 *
 * Colors here resolve to CSS variables that are defined in `tokens.css`. This
 * is the trick that lets a single Tailwind class like `bg-elevated` swap with
 * the theme without re-rendering React.
 */
export const designTokensPreset: Partial<Config> = {
  theme: {
    extend: {
      fontFamily: {
        display: typography.family.display.split(",").map((s) => s.trim().replace(/['"]/g, "")),
        body: typography.family.body.split(",").map((s) => s.trim().replace(/['"]/g, "")),
        sans: typography.family.body.split(",").map((s) => s.trim().replace(/['"]/g, "")),
        mono: typography.family.mono.split(",").map((s) => s.trim().replace(/['"]/g, "")),
        serif: typography.family.display.split(",").map((s) => s.trim().replace(/['"]/g, "")),
      },
      fontSize: {
        micro: typography.size.micro,
        caption: typography.size.caption,
        label: typography.size.label,
        body: typography.size.body,
        "body-lg": typography.size.bodyLg,
        h6: typography.size.h6,
        h5: typography.size.h5,
        h4: typography.size.h4,
        h3: typography.size.h3,
        h2: typography.size.h2,
        h1: typography.size.h1,
        display: typography.size.display,
        cinema: typography.size.cinema,
      },
      fontWeight: {
        regular: String(typography.weight.regular),
        medium: String(typography.weight.medium),
        semibold: String(typography.weight.semibold),
        bold: String(typography.weight.bold),
        black: String(typography.weight.black),
      },
      letterSpacing: {
        tightest: typography.tracking.tightest,
        tight: typography.tracking.tight,
        wide: typography.tracking.wide,
        wider: typography.tracking.wider,
        widest: typography.tracking.widest,
      },
      lineHeight: {
        tight: String(typography.leading.tight),
        snug: String(typography.leading.snug),
        normal: String(typography.leading.normal),
        relaxed: String(typography.leading.relaxed),
        spacious: String(typography.leading.spacious),
      },
      colors: {
        // semantic
        canvas: "var(--bg-canvas)",
        elevated: "var(--bg-elevated)",
        sunken: "var(--bg-sunken)",
        overlay: "var(--bg-overlay)",
        glass: "var(--bg-glass)",

        ink: {
          DEFAULT: "var(--text-primary)",
          muted: "var(--text-muted)",
          subtle: "var(--text-secondary)",
          inverse: "var(--text-inverse)",
          accent: "var(--text-accent)",
        },

        border: {
          DEFAULT: "var(--border-default)",
          subtle: "var(--border-subtle)",
          strong: "var(--border-strong)",
          focus: "var(--border-focus)",
        },

        brand: {
          DEFAULT: "var(--brand)",
          hover: "var(--brand-hover)",
          active: "var(--brand-active)",
          foreground: "var(--brand-foreground)",
        },

        air: {
          DEFAULT: "var(--air)",
          soft: "var(--air-soft)",
          foreground: "var(--air-foreground)",
        },
        fire: {
          DEFAULT: "var(--fire)",
          soft: "var(--fire-soft)",
          foreground: "var(--fire-foreground)",
        },
        water: {
          DEFAULT: "var(--water)",
          soft: "var(--water-soft)",
          foreground: "var(--water-foreground)",
        },
        earth: {
          DEFAULT: "var(--earth)",
          soft: "var(--earth-soft)",
          foreground: "var(--earth-foreground)",
        },
        lunar: {
          DEFAULT: "var(--lunar)",
          soft: "var(--lunar-soft)",
          foreground: "var(--lunar-foreground)",
        },
        success: {
          DEFAULT: "var(--success)",
          soft: "var(--success-soft)",
          foreground: "var(--success-foreground)",
        },
        danger: {
          DEFAULT: "var(--danger)",
          soft: "var(--danger-soft)",
          foreground: "var(--danger-foreground)",
        },

        // shadcn compatibility (used by existing components that import via CSS vars)
        background: "var(--bg-canvas)",
        foreground: "var(--text-primary)",
        primary: {
          DEFAULT: "var(--brand)",
          foreground: "var(--brand-foreground)",
        },
        secondary: {
          DEFAULT: "var(--bg-elevated)",
          foreground: "var(--text-primary)",
        },
        muted: {
          DEFAULT: "var(--bg-elevated)",
          foreground: "var(--text-muted)",
        },
        accent: {
          DEFAULT: "var(--bg-elevated)",
          foreground: "var(--text-primary)",
        },
        destructive: {
          DEFAULT: "var(--danger)",
          foreground: "var(--danger-foreground)",
        },
        card: {
          DEFAULT: "var(--bg-elevated)",
          foreground: "var(--text-primary)",
        },
        popover: {
          DEFAULT: "var(--bg-elevated)",
          foreground: "var(--text-primary)",
        },
        input: "var(--border-default)",
        ring: "var(--border-focus)",
      },
      spacing: {
        micro: space.micro,
        cathedral: space.cathedral,
      },
      borderRadius: {
        sharp: radius.sharp,
        sm: radius.sm,
        DEFAULT: radius.md,
        md: radius.md,
        lg: radius.lg,
        xl: radius.xl,
        "2xl": radius["2xl"],
        "3xl": radius["3xl"],
        pill: radius.pill,
        orb: radius.orb,
      },
      boxShadow: {
        whisper: shadow.whisper,
        rest: shadow.rest,
        raised: shadow.raised,
        altar: shadow.altar,
        "glow-air": shadow.glow.air,
        "glow-fire": shadow.glow.fire,
        "glow-water": shadow.glow.water,
        "glow-earth": shadow.glow.earth,
        "glow-lunar": shadow.glow.lunar,
      },
      transitionTimingFunction: {
        silk: easing.silk,
        velvet: easing.velvet,
        ceremonial: easing.ceremonial,
        spring: easing.spring,
        sharp: easing.sharp,
      },
      transitionDuration: {
        instant: `${duration.instant}ms`,
        quick: `${duration.quick}ms`,
        gentle: `${duration.gentle}ms`,
        normal: `${duration.normal}ms`,
        slow: `${duration.slow}ms`,
        ceremony: `${duration.ceremony}ms`,
        ritual: `${duration.ritual}ms`,
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "orb-pulse": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.04)" },
        },
        "breathe": {
          "0%, 100%": { opacity: "0.7" },
          "50%": { opacity: "1" },
        },
        "drift": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) rotate(0deg)" },
          "50%": { transform: "translate3d(20px, -10px, 0) rotate(2deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.6s var(--ease-silk) both",
        "shimmer": "shimmer 2.5s linear infinite",
        "orb-pulse": "orb-pulse 4s var(--ease-silk) infinite",
        "breathe": "breathe 6s var(--ease-silk) infinite",
        "drift": "drift 14s var(--ease-silk) infinite",
      },
    },
  },
};

export default designTokensPreset;
