import * as React from "react";

/**
 * Sacred-geometry SVG library — used for section dividers, empty states,
 * loading screens, and the Oracle/Altars surfaces.
 *
 * All shapes use `currentColor` and accept an optional `opacity` prop so a
 * caller can tune intensity per surface.
 */

type GeometryProps = {
  size?: number;
  className?: string;
  strokeWidth?: number;
  opacity?: number;
};

/** Twelve-fold mandala, used as ambient ornament behind hero copy. */
export function Mandala({ size = 320, className, strokeWidth = 0.5, opacity = 0.18 }: GeometryProps) {
  const ring = (r: number, count: number, key: string) =>
    Array.from({ length: count }).map((_, i) => {
      const angle = (i * 2 * Math.PI) / count;
      const x = 50 + r * Math.cos(angle);
      const y = 50 + r * Math.sin(angle);
      return <circle key={`${key}-${i}`} cx={x} cy={y} r={r * 0.5} />;
    });

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={className}
      style={{ opacity }}
      aria-hidden
    >
      <circle cx="50" cy="50" r="44" />
      <circle cx="50" cy="50" r="34" />
      <circle cx="50" cy="50" r="24" />
      <circle cx="50" cy="50" r="14" />
      <g>{ring(20, 12, "outer")}</g>
      <g>{ring(11, 6, "inner")}</g>
    </svg>
  );
}

/** Vesica piscis — the overlap of two circles, the door between worlds. */
export function VesicaPiscis({
  size = 200,
  className,
  strokeWidth = 1,
  opacity = 0.4,
}: GeometryProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={className}
      style={{ opacity }}
      aria-hidden
    >
      <circle cx="38" cy="50" r="30" />
      <circle cx="62" cy="50" r="30" />
    </svg>
  );
}

/** Flower of life — overlapping circles in hex pattern. */
export function FlowerOfLife({
  size = 240,
  className,
  strokeWidth = 0.6,
  opacity = 0.22,
}: GeometryProps) {
  const r = 14;
  const centers: Array<[number, number]> = [
    [50, 50],
    [50, 50 - r * Math.sqrt(3)],
    [50, 50 + r * Math.sqrt(3)],
    [50 - r * 1.5, 50 - r * Math.sqrt(3) / 2],
    [50 + r * 1.5, 50 - r * Math.sqrt(3) / 2],
    [50 - r * 1.5, 50 + r * Math.sqrt(3) / 2],
    [50 + r * 1.5, 50 + r * Math.sqrt(3) / 2],
  ];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={className}
      style={{ opacity }}
      aria-hidden
    >
      {centers.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} />
      ))}
    </svg>
  );
}

/**
 * Section divider — three concentric arcs. Used between marketing sections in
 * place of a flat hr.
 */
export function SacredDivider({ className, opacity = 0.5 }: { className?: string; opacity?: number }) {
  return (
    <div className={className} style={{ display: "flex", justifyContent: "center", padding: "40px 0", opacity }}>
      <svg width="180" height="20" viewBox="0 0 180 20" fill="none" stroke="currentColor" aria-hidden>
        <line x1="0" y1="10" x2="70" y2="10" strokeWidth="0.5" opacity="0.3" />
        <circle cx="90" cy="10" r="3" strokeWidth="0.5" />
        <circle cx="90" cy="10" r="6" strokeWidth="0.5" opacity="0.6" />
        <circle cx="90" cy="10" r="9" strokeWidth="0.5" opacity="0.3" />
        <line x1="110" y1="10" x2="180" y2="10" strokeWidth="0.5" opacity="0.3" />
      </svg>
    </div>
  );
}

/**
 * Lunar orb — the round moon glyph used as a visual anchor in the hero and
 * the dashboard header.
 */
export function LunarOrb({
  size = 160,
  className,
  illumination = 0.5,
}: {
  size?: number;
  className?: string;
  illumination?: number;
}) {
  const shadowOffset = (1 - illumination * 2) * 40;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden
    >
      <defs>
        <radialGradient id="lunarSurface" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="var(--lunar-foreground)" stopOpacity="0.95" />
          <stop offset="50%" stopColor="var(--lunar)" stopOpacity="0.85" />
          <stop offset="100%" stopColor="var(--lunar)" stopOpacity="0.6" />
        </radialGradient>
        <radialGradient id="lunarHalo" cx="50%" cy="50%" r="70%">
          <stop offset="40%" stopColor="var(--lunar)" stopOpacity="0" />
          <stop offset="100%" stopColor="var(--lunar)" stopOpacity="0.4" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#lunarHalo)" />
      <circle cx="50" cy="50" r="38" fill="url(#lunarSurface)" />
      {/* shadow disk that slides across based on illumination */}
      <circle
        cx={50 + shadowOffset}
        cy="50"
        r="38"
        fill="var(--bg-canvas)"
        style={{ mixBlendMode: "multiply" }}
      />
      {/* surface texture — three faint craters */}
      <circle cx="42" cy="44" r="2" fill="var(--lunar-foreground)" opacity="0.3" />
      <circle cx="58" cy="52" r="3" fill="var(--lunar-foreground)" opacity="0.2" />
      <circle cx="48" cy="60" r="1.5" fill="var(--lunar-foreground)" opacity="0.3" />
    </svg>
  );
}
