import Link from "next/link";
import { Play } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Video } from "@/lib/supabase/types";

/**
 * Cinematic poster card. Used by browse rails, my-list, search results.
 * Visual flow: rest → hover (scale 1.05 + lift + reveal play button) →
 * focus (same as hover via :focus-visible).
 *
 * The progress bar at the bottom only appears when partially watched.
 */
export function PosterCard({ video, progress }: { video: Video; progress?: number }) {
  return (
    <Link
      href={`/tv/${video.slug}`}
      className={cn(
        "group relative block overflow-hidden rounded-2xl bg-sunken outline-none",
        "transition-[transform,box-shadow] duration-normal ease-velvet",
        "hover:scale-[1.04] hover:shadow-altar focus-visible:scale-[1.04] focus-visible:shadow-altar",
        "focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
      )}
    >
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-elevated via-fire/10 to-lunar/15">
        {video.poster_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.poster_url}
            alt={video.title}
            className="size-full object-cover transition-transform duration-slow ease-silk group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Play className="size-12 text-ink-muted/30" />
          </div>
        )}
        <div
          className="absolute inset-0 bg-gradient-to-t from-canvas/85 via-canvas/15 to-transparent"
          aria-hidden
        />
      </div>

      {progress !== undefined && progress > 0 && (
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-ink-700/60"
          aria-hidden
        >
          <div
            className="h-full bg-air"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
        <p className="font-display text-h6 leading-tight text-ink line-clamp-2 tracking-tight">
          {video.title}
        </p>
        {video.duration_seconds && (
          <p className="mt-1 text-caption text-ink-muted tabular-nums">
            {formatDuration(video.duration_seconds)}
          </p>
        )}
      </div>

      {/* Center play orb on hover */}
      <div
        aria-hidden
        className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-gentle ease-velvet group-hover:opacity-100"
      >
        <div className="flex size-14 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-altar backdrop-blur">
          <Play className="ml-0.5 size-6 fill-current" />
        </div>
      </div>
    </Link>
  );
}
