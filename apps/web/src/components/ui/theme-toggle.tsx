"use client";

import * as React from "react";
import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";

/**
 * Theme toggle — three-state segmented control (system / light / dark).
 * Motion: the active pill animates with `velvet` easing.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const options = [
    { value: "system", label: "Auto", glyph: "◐" },
    { value: "light", label: "Light", glyph: "☀" },
    { value: "dark", label: "Dark", glyph: "☾" },
  ] as const;

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn(
        "relative inline-flex items-center gap-1 rounded-pill border border-border bg-elevated p-1",
        className,
      )}
    >
      {options.map((opt) => {
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(opt.value)}
            className={cn(
              "relative z-10 flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-caption font-medium",
              "transition-colors duration-quick ease-velvet",
              active ? "text-ink" : "text-ink-muted hover:text-ink",
            )}
          >
            <span aria-hidden>{opt.glyph}</span>
            {opt.label}
            {active && (
              <span
                aria-hidden
                className="absolute inset-0 -z-10 rounded-pill bg-glass border border-subtle"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
