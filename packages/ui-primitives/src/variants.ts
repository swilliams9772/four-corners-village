/**
 * Cross-platform variant maps. The actual rendered Button/Card live in
 * apps/web/src/components/ui (HTML) and apps/mobile/src/components/ui (RN);
 * both reference these maps so that adding a new variant only happens once.
 */

export const buttonSizes = {
  xs: { paddingX: "12px", paddingY: "6px", fontSize: "13px", radius: "10px" },
  sm: { paddingX: "16px", paddingY: "8px", fontSize: "14px", radius: "10px" },
  md: { paddingX: "20px", paddingY: "10px", fontSize: "15px", radius: "14px" },
  lg: { paddingX: "28px", paddingY: "14px", fontSize: "16px", radius: "14px" },
  xl: { paddingX: "36px", paddingY: "18px", fontSize: "17px", radius: "20px" },
} as const;

export type ButtonSize = keyof typeof buttonSizes;

export const buttonIntents = ["brand", "ghost", "outline", "lunar", "fire", "earth", "water", "air"] as const;
export type ButtonIntent = (typeof buttonIntents)[number];

/**
 * Tailwind/NativeWind class strings per intent. Used by both surfaces.
 * Always semantic (no hardcoded hex) so themes can swap.
 */
export const buttonIntentClasses: Record<ButtonIntent, string> = {
  brand:
    "bg-brand text-brand-foreground hover:bg-brand-hover active:bg-brand-active shadow-rest hover:shadow-raised",
  ghost: "bg-transparent text-ink hover:bg-glass",
  outline:
    "bg-transparent text-ink border border-strong hover:bg-glass hover:border-focus",
  lunar:
    "bg-lunar text-ink-inverse hover:bg-lunar-soft hover:text-lunar-foreground shadow-glow-lunar",
  fire: "bg-fire text-fire-foreground hover:opacity-90 shadow-glow-fire",
  earth: "bg-earth text-earth-foreground hover:opacity-90 shadow-glow-earth",
  water: "bg-water text-water-foreground hover:opacity-90 shadow-glow-water",
  air: "bg-air text-ink-inverse hover:opacity-90 shadow-glow-air",
};

/** Tier badge styling — Initiate/Guide/Sanctuary */
export const tierStyles = {
  initiate: { label: "Initiate", className: "bg-water-soft text-water-foreground border-water/30" },
  guide: { label: "Guide", className: "bg-air-soft text-air-foreground border-air/30" },
  sanctuary: {
    label: "Sanctuary",
    className: "bg-lunar-soft text-lunar-foreground border-lunar/30",
  },
} as const;
