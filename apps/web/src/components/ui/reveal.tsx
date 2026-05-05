"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Reveal — scroll-triggered fade + Y-translate. Drop around any element to
 * have it animate in once it enters the viewport. Uses IntersectionObserver
 * so it stays performant with hundreds on a page.
 *
 * Respects prefers-reduced-motion via the global CSS rule in globals.css.
 */
type AsProp = "div" | "section" | "article" | "li" | "header" | "footer";

export function Reveal({
  children,
  className,
  delay = 0,
  as: Component = "div",
  threshold = 0.15,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: AsProp;
  threshold?: number;
}) {
  const ref = React.useRef<HTMLElement | null>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            obs.unobserve(entry.target);
          }
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return React.createElement(
    Component,
    {
      ref: ref as React.Ref<HTMLElement>,
      className: cn("reveal", inView && "in-view", className),
      style: { transitionDelay: `${delay}ms` },
    },
    children,
  );
}
