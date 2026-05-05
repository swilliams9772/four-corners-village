import * as React from "react";
import Image from "next/image";

/**
 * 4 Corners Village brand mark.
 *
 * Three variants:
 *
 *   • `mark`      — minimal four-pointed-star SVG. Use at favicon / navbar
 *                   sizes (16-40px) where the medallion would lose detail.
 *   • `wordmark`  — `mark` paired with the "4 Corners" display lockup.
 *                   This is the default header / footer treatment.
 *   • `medallion` — the full gold compass-rose medallion artwork.
 *                   Use in heroes, login screens, OG cards, app store
 *                   listings — anywhere ≥ 96px square.
 *
 * The SVG mark is intentionally simple: a four-pointed star inscribed in a
 * circle, with a doorway-shaped negative space at the center. It scales from
 * 16 to 1024 without losing form and inherits `currentColor`, so it reads on
 * any theme background.
 */
export function BrandMark({
  size = 32,
  className,
  variant = "wordmark",
  title = "4 Corners Village",
}: {
  size?: number;
  className?: string;
  variant?: "mark" | "wordmark" | "medallion";
  title?: string;
}) {
  if (variant === "medallion") {
    return (
      <Image
        src="/brand/logo-medallion.png"
        alt={title}
        width={size}
        height={size}
        priority
        className={className}
        style={{ width: size, height: size, objectFit: "contain" }}
      />
    );
  }

  if (variant === "mark") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label={title}
        role="img"
      >
        <title>{title}</title>
        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
        <path
          d="M32 6 L36 28 L58 32 L36 36 L32 58 L28 36 L6 32 L28 28 Z"
          fill="currentColor"
          opacity="0.95"
        />
        <path d="M32 18 L40 32 L32 46 L24 32 Z" fill="var(--bg-canvas)" />
        <circle cx="32" cy="32" r="2" fill="currentColor" />
      </svg>
    );
  }

  return (
    <span className={className} style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <BrandMark variant="mark" size={size} title={title} />
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontVariationSettings: '"opsz" 24',
          fontWeight: 500,
          fontSize: size * 0.72,
          letterSpacing: "-0.02em",
          color: "var(--text-primary)",
          lineHeight: 1,
        }}
      >
        4 Corners
      </span>
    </span>
  );
}
