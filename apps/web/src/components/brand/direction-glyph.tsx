import * as React from "react";

/**
 * Direction glyphs — used for the four-corners hero and for direction-tagged
 * content (practitioner primary direction, daily prompts, etc.).
 *
 * Each glyph is hand-drawn rather than pulled from lucide so the visual
 * language reads as crafted. They share a 24x24 viewBox + 1.5 stroke weight.
 */

type GlyphProps = {
  size?: number;
  className?: string;
  strokeWidth?: number;
};

export function WindGlyph({ size = 24, className, strokeWidth = 1.5 }: GlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 8 H14 a3 3 0 1 0 -3 -3" />
      <path d="M3 12 H17 a3 3 0 1 1 -3 3" />
      <path d="M3 16 H10 a2.5 2.5 0 1 0 -2.5 -2.5" />
    </svg>
  );
}

export function FlameGlyph({ size = 24, className, strokeWidth = 1.5 }: GlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 2 C10 7 6 8 6 13 a6 6 0 0 0 12 0 c0 -3 -2 -5 -3 -7 c-1 1 -2 1.5 -3 1 c0 -2 0 -3 0 -5z" />
      <path d="M12 11 c-1 1.5 -2 2 -2 4 a2 2 0 0 0 4 0 c0 -1 -1 -2 -2 -4z" opacity="0.6" />
    </svg>
  );
}

export function WaveGlyph({ size = 24, className, strokeWidth = 1.5 }: GlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 8 q3 -3 6 0 t6 0 t6 0" />
      <path d="M3 13 q3 -3 6 0 t6 0 t6 0" opacity="0.7" />
      <path d="M3 18 q3 -3 6 0 t6 0 t6 0" opacity="0.4" />
    </svg>
  );
}

export function MountainGlyph({ size = 24, className, strokeWidth = 1.5 }: GlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 19 L9 9 L13 14 L17 7 L21 19 Z" />
      <path d="M9 9 L13 14" opacity="0.5" />
      <circle cx="17" cy="5" r="1.2" fill="currentColor" />
    </svg>
  );
}

export const DirectionGlyph = {
  east: WindGlyph,
  south: FlameGlyph,
  west: WaveGlyph,
  north: MountainGlyph,
} as const;
