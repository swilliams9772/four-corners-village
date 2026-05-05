import * as React from "react";

/**
 * The Four Corners mark — a four-pointed star inscribed in a circle.
 *
 * Each point hints at one of the four directions / elements:
 *   top    → North/Earth   (mountain)
 *   right  → East/Air      (rising sun)
 *   bottom → South/Fire    (flame)
 *   left   → West/Water    (wave)
 *
 * Negative space inside the central diamond reads as a doorway / portal.
 * Designed to scale from 16 (favicon) to 1024 (App Store) without losing form.
 */
export function BrandMark({
  size = 32,
  className,
  variant = "wordmark",
  title = "Four Corners",
}: {
  size?: number;
  className?: string;
  variant?: "mark" | "wordmark";
  title?: string;
}) {
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
        Four Corners
      </span>
    </span>
  );
}
