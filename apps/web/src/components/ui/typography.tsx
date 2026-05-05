import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Section — typographic wrapper that centers a section label, an h2, and an
 * optional eyebrow paragraph. Used by every marketing page so headings have a
 * consistent rhythm.
 */
export function Section({
  children,
  className,
  containerClassName,
  contained = true,
  id,
  ...rest
}: React.HTMLAttributes<HTMLElement> & {
  containerClassName?: string;
  contained?: boolean;
}) {
  return (
    <section id={id} className={cn("relative py-24 md:py-32", className)} {...rest}>
      {contained ? (
        <div className={cn("mx-auto max-w-7xl px-6 lg:px-10", containerClassName)}>{children}</div>
      ) : (
        children
      )}
    </section>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "mb-4 inline-flex items-center gap-2 text-caption font-medium uppercase tracking-widest text-ink-muted",
        className,
      )}
    >
      <span className="block h-px w-8 bg-border-strong" aria-hidden />
      {children}
    </p>
  );
}

export function DisplayHeading({
  children,
  level = 2,
  size = "h1",
  className,
  balance = true,
}: {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4;
  size?: "h6" | "h5" | "h4" | "h3" | "h2" | "h1" | "display" | "cinema";
  className?: string;
  balance?: boolean;
}) {
  const Tag = `h${level}` as const;
  const sizeClass = {
    h6: "text-h6",
    h5: "text-h5",
    h4: "text-h4",
    h3: "text-h3",
    h2: "text-h2",
    h1: "text-h1",
    display: "text-display",
    cinema: "text-cinema",
  }[size];

  return (
    <Tag
      className={cn(
        "font-display font-medium leading-tight tracking-tight text-ink",
        sizeClass,
        balance && "text-balance",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function Lede({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "max-w-2xl text-body-lg text-ink-subtle leading-relaxed text-pretty",
        className,
      )}
    >
      {children}
    </p>
  );
}
