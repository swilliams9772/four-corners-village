import * as React from "react";
import { cn } from "@/lib/utils";
import type { Direction } from "@four-corners/api-types";
import { elementalForDirection } from "@four-corners/ui-primitives";
import { DirectionGlyph } from "@/components/brand/direction-glyph";

/**
 * ElementalChip — used to tag practitioners, posts, sessions, etc. with a
 * primary direction. Visual treatment matches the elemental token map.
 *
 * Sizes: sm for inline meta, md for cards, lg for filter chips.
 */
type Size = "sm" | "md" | "lg";

const sizeMap: Record<Size, { container: string; iconSize: number }> = {
  sm: { container: "px-2 py-0.5 text-[10px] gap-1", iconSize: 12 },
  md: { container: "px-2.5 py-1 text-caption gap-1.5", iconSize: 14 },
  lg: { container: "px-3 py-1.5 text-label gap-2", iconSize: 16 },
};

export function ElementalChip({
  direction,
  size = "md",
  showLabel = true,
  className,
  variant = "soft",
}: {
  direction: Direction;
  size?: Size;
  showLabel?: boolean;
  className?: string;
  variant?: "soft" | "solid" | "outline";
}) {
  const config = elementalForDirection(direction);
  const Glyph = DirectionGlyph[direction];

  const variantClasses = {
    soft: `${config.bgSoftClass} ${config.textClass} border border-${config.element}/30`,
    solid: `${config.bgClass} text-ink-inverse border-transparent ${config.glowClass}`,
    outline: `bg-transparent ${config.textClass} border border-${config.element}/40`,
  }[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill font-medium tracking-wide uppercase",
        "transition-colors duration-quick ease-velvet",
        sizeMap[size].container,
        variantClasses,
        className,
      )}
      data-direction={direction}
    >
      <Glyph size={sizeMap[size].iconSize} />
      {showLabel && config.label}
    </span>
  );
}
