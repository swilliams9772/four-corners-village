import type { Direction, Element } from "@four-corners/api-types";

/**
 * Visual-language map for the four directions / four elements.
 * Every UI surface that needs to identify "this thing belongs to East/Air"
 * pulls from here so the metaphor stays consistent.
 */
export const elementalMap: Record<
  Direction,
  {
    element: Element;
    label: string;
    archetype: string;
    /** Tailwind/NativeWind class names — see design-tokens for what these resolve to */
    bgClass: string;
    bgSoftClass: string;
    textClass: string;
    glowClass: string;
    /** Single SVG glyph reference (handled by web/<DirectionGlyph> + native equivalent) */
    glyph: "wind" | "flame" | "wave" | "mountain";
    /** Used for ordered animation reveals — matches a sunwise circle */
    rotation: number;
    /** Daily ritual prompt the front-end can show */
    dailyPrompt: string;
  }
> = {
  east: {
    element: "air",
    label: "East",
    archetype: "Air & Beginnings",
    bgClass: "bg-air",
    bgSoftClass: "bg-air-soft",
    textClass: "text-air",
    glowClass: "shadow-glow-air",
    glyph: "wind",
    rotation: 0,
    dailyPrompt: "What new breath wants to enter your day?",
  },
  south: {
    element: "fire",
    label: "South",
    archetype: "Fire & Action",
    bgClass: "bg-fire",
    bgSoftClass: "bg-fire-soft",
    textClass: "text-fire",
    glowClass: "shadow-glow-fire",
    glyph: "flame",
    rotation: 90,
    dailyPrompt: "Where can you take one decisive step today?",
  },
  west: {
    element: "water",
    label: "West",
    archetype: "Water & Reflection",
    bgClass: "bg-water",
    bgSoftClass: "bg-water-soft",
    textClass: "text-water",
    glowClass: "shadow-glow-water",
    glyph: "wave",
    rotation: 180,
    dailyPrompt: "What feeling deserves your attention right now?",
  },
  north: {
    element: "earth",
    label: "North",
    archetype: "Earth & Wisdom",
    bgClass: "bg-earth",
    bgSoftClass: "bg-earth-soft",
    textClass: "text-earth",
    glowClass: "shadow-glow-earth",
    glyph: "mountain",
    rotation: 270,
    dailyPrompt: "What wisdom from your past wants to be remembered?",
  },
};

export const directions: Direction[] = ["east", "south", "west", "north"];

export function elementalForDirection(direction: Direction) {
  return elementalMap[direction];
}
