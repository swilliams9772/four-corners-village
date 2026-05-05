"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * CinemaTile — the Vintage TV poster card.
 *
 * Visual states:
 *   resting — poster + subtle gradient bottom + title typography
 *   hovered — scales 1.04, lifts elevation, reveals synopsis + CTA
 *   focused — glowing focus ring (a11y for keyboard)
 *
 * Used in the home rail (4:3), category rails (2:3), title pages (16:9
 * backdrop). The aspect-ratio is configurable.
 */
type Aspect = "portrait" | "square" | "landscape" | "tall";
const aspectMap: Record<Aspect, string> = {
  portrait: "aspect-[2/3]",
  square: "aspect-square",
  landscape: "aspect-video",
  tall: "aspect-[3/4]",
};

export function CinemaTile({
  href,
  posterUrl,
  title,
  meta,
  synopsis,
  badge,
  aspect = "portrait",
  className,
}: {
  href: string;
  posterUrl: string | null;
  title: string;
  meta?: string;
  synopsis?: string;
  badge?: React.ReactNode;
  aspect?: Aspect;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative block overflow-hidden rounded-2xl bg-sunken",
        "transition-[transform,box-shadow] duration-normal ease-velvet",
        "hover:scale-[1.03] hover:shadow-altar focus-visible:scale-[1.03] focus-visible:shadow-altar",
        "outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
        aspectMap[aspect],
        className,
      )}
    >
      {posterUrl ? (
        <Image
          src={posterUrl}
          alt={title}
          fill
          sizes="(max-width: 640px) 60vw, (max-width: 1280px) 32vw, 22vw"
          className="object-cover transition-transform duration-slow ease-silk group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-ink-700 via-ink-800 to-canvas" />
      )}

      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-canvas/95 via-canvas/35 to-transparent"
      />

      {badge && <div className="absolute top-3 left-3 z-10">{badge}</div>}

      <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
        {meta && (
          <p className="mb-1.5 text-[11px] uppercase tracking-widest text-ink-muted opacity-0 -translate-y-1 transition-all duration-gentle ease-velvet group-hover:opacity-100 group-hover:translate-y-0">
            {meta}
          </p>
        )}
        <h3 className="font-display text-h6 leading-tight text-ink line-clamp-2 tracking-tight">
          {title}
        </h3>
        {synopsis && (
          <p className="mt-2 text-caption text-ink-subtle line-clamp-2 opacity-0 max-h-0 transition-all duration-normal ease-velvet group-hover:opacity-100 group-hover:max-h-20">
            {synopsis}
          </p>
        )}
      </div>
    </Link>
  );
}
