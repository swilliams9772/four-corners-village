"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PosterCard } from "@/components/tv/poster-card";
import { cn } from "@/lib/utils";
import type { Video } from "@/lib/supabase/types";

export function CategoryRow({
  title,
  href,
  videos,
  progressByVideoId,
}: {
  title: string;
  href?: string;
  videos: Video[];
  progressByVideoId?: Record<string, number>;
}) {
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const [canL, setCanL] = React.useState(false);
  const [canR, setCanR] = React.useState(false);

  const updateScrollState = React.useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanL(el.scrollLeft > 4);
    setCanR(el.scrollLeft + el.clientWidth + 4 < el.scrollWidth);
  }, []);

  React.useEffect(() => {
    updateScrollState();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.85), behavior: "smooth" });
  };

  if (videos.length === 0) return null;
  return (
    <section className="space-y-3" aria-label={title}>
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-10">
        <h2 className="font-display text-h4 leading-tight tracking-tight text-ink">{title}</h2>
        <div className="flex items-center gap-2">
          {href && (
            <Link
              href={href}
              className="inline-flex items-center gap-1 text-caption text-ink-muted transition-colors duration-quick hover:text-ink"
            >
              See all
              <ChevronRight className="size-3.5" />
            </Link>
          )}
          <div className="hidden gap-1 md:flex">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              disabled={!canL}
              aria-label="Scroll left"
              className="size-9 rounded-full border border-subtle bg-glass text-ink-subtle transition-colors duration-quick ease-velvet hover:border-strong hover:text-ink disabled:opacity-30"
            >
              <ChevronLeft className="mx-auto size-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              disabled={!canR}
              aria-label="Scroll right"
              className="size-9 rounded-full border border-subtle bg-glass text-ink-subtle transition-colors duration-quick ease-velvet hover:border-strong hover:text-ink disabled:opacity-30"
            >
              <ChevronRight className="mx-auto size-4" />
            </button>
          </div>
        </div>
      </div>
      <div
        ref={scrollerRef}
        className={cn(
          "overflow-x-auto px-4 pb-2 sm:px-6 lg:px-10",
          "snap-cinema no-scrollbar",
        )}
      >
        <div className="flex gap-4 md:gap-5">
          {videos.map((v) => (
            <div key={v.id} className="w-[68vw] shrink-0 sm:w-[44vw] md:w-72 lg:w-80">
              <PosterCard video={v} progress={progressByVideoId?.[v.id]} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
