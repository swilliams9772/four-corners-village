import * as React from "react";
import { Check } from "lucide-react";
import type { Direction } from "@four-corners/api-types";
import { cn } from "@/lib/utils";
import { elementalForDirection } from "@four-corners/ui-primitives";
import { DirectionGlyph } from "@/components/brand/direction-glyph";

/**
 * The four directions hero card. Replaces the previous shadcn-flat look with
 * an arcane glass card that pulses subtly on hover and uses the elemental
 * tokens.
 */
export function DirectionCard({
  direction,
  count,
  description,
  className,
}: {
  direction: Direction;
  count?: number;
  description?: string;
  className?: string;
}) {
  const config = elementalForDirection(direction);
  const Glyph = DirectionGlyph[direction];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-subtle bg-glass p-6 backdrop-blur-xl",
        "transition-[transform,border-color,box-shadow] duration-normal ease-velvet",
        "hover:-translate-y-1 hover:border-strong hover:shadow-altar",
        className,
      )}
      data-direction={direction}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -top-12 -right-12 size-40 rounded-full opacity-30 blur-3xl transition-opacity duration-slow group-hover:opacity-60",
          config.bgClass,
        )}
      />

      <div className="relative">
        <div
          className={cn(
            "mb-5 flex size-11 items-center justify-center rounded-xl",
            config.bgSoftClass,
            config.textClass,
          )}
        >
          <Glyph size={22} />
        </div>
        <p className="mb-1 text-caption uppercase tracking-widest text-ink-muted">
          {config.label}
        </p>
        <h3 className="font-display text-h6 leading-tight tracking-tight text-ink">
          {config.archetype}
        </h3>
        {description && <p className="mt-3 text-label text-ink-subtle">{description}</p>}
        {typeof count === "number" && (
          <p className="mt-4 text-caption text-ink-muted">
            <span className="font-semibold text-ink">{count}</span> practitioners
          </p>
        )}
      </div>
    </div>
  );
}

export function FeatureCheck({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-success-soft">
        <Check className="size-3 text-success" />
      </div>
      <span className="text-body text-ink-subtle">{text}</span>
    </div>
  );
}
