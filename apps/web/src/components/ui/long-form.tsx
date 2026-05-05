import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * LongForm — opinionated wrapper for legal docs, articles, course lessons.
 * Uses the display font for headings, body for paragraphs, and a sacred
 * divider before each h2.
 *
 * Does NOT depend on @tailwindcss/typography because we want full control
 * over rhythm, optical-size axis, and link treatment to match the brand.
 */
export function LongForm({
  children,
  className,
  size = "default",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "compact";
}) {
  const proseSize =
    size === "compact"
      ? "[&>p]:text-label [&>li]:text-label [&>h2]:text-h4 [&>h3]:text-h5"
      : "[&>p]:text-body [&>li]:text-body [&>h2]:text-h3 [&>h3]:text-h4";
  return (
    <div
      className={cn(
        "max-w-prose space-y-6 text-ink-subtle leading-relaxed",
        // headings
        "[&_h1]:font-display [&_h1]:text-h1 [&_h1]:text-ink [&_h1]:leading-tight [&_h1]:tracking-tight [&_h1]:mb-4",
        "[&_h2]:font-display [&_h2]:text-ink [&_h2]:font-medium [&_h2]:leading-tight [&_h2]:tracking-tight [&_h2]:pt-8 [&_h2]:mb-3 [&_h2]:[font-variation-settings:'opsz'_36]",
        "[&_h3]:font-display [&_h3]:text-ink [&_h3]:font-medium [&_h3]:leading-snug [&_h3]:tracking-tight [&_h3]:mt-6 [&_h3]:mb-2",
        // body
        "[&_p]:text-pretty [&_li]:text-pretty",
        "[&_strong]:font-medium [&_strong]:text-ink",
        "[&_em]:italic",
        // links
        "[&_a]:text-ink-accent [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-from-font [&_a]:transition-colors [&_a]:duration-quick",
        "hover:[&_a]:text-air",
        // lists
        "[&_ul]:space-y-2 [&_ul]:pl-6 [&_ul]:list-disc [&_ul]:marker:text-ink-muted",
        "[&_ol]:space-y-2 [&_ol]:pl-6 [&_ol]:list-decimal [&_ol]:marker:text-ink-muted",
        // code
        "[&_code]:rounded-md [&_code]:border [&_code]:border-subtle [&_code]:bg-elevated [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em]",
        // dividers
        "[&_hr]:my-10 [&_hr]:border-0 [&_hr]:h-px [&_hr]:bg-gradient-to-r [&_hr]:from-transparent [&_hr]:via-border-default [&_hr]:to-transparent",
        proseSize,
        className,
      )}
    >
      {children}
    </div>
  );
}
