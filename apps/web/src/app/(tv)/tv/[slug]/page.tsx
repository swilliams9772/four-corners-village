import { notFound } from "next/navigation";
import Link from "next/link";
import { Play, Lock, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryRow } from "@/components/tv/category-row";
import { Reveal } from "@/components/ui/reveal";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, hasActiveTvSubscription } from "@/lib/auth";
import { DEV_VIDEOS } from "@/lib/dev-data";
import { formatDuration } from "@/lib/utils";
import { ToggleMyListButton } from "./toggle-my-list-button";
import type { Video } from "@/lib/supabase/types";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: slug.replace(/-/g, " ") };
}

export default async function TitlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getCurrentUser();
  const hasTv = session ? await hasActiveTvSubscription(session.user.id) : false;

  const supabase = await createClient();

  let video: Video | null = null;
  let related: Video[] = [];
  let inMyList = false;

  if (supabase) {
    const { data } = await supabase
      .from("videos")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    video = data as Video | null;

    if (video) {
      const { data: rel } = await supabase
        .from("videos")
        .select("*")
        .eq("category_id", video.category_id)
        .eq("is_published", true)
        .neq("id", video.id)
        .limit(8);
      related = (rel as Video[] | null) ?? [];

      if (session) {
        const { data: list } = await supabase
          .from("video_my_list")
          .select("video_id")
          .eq("user_id", session.user.id)
          .eq("video_id", video.id)
          .maybeSingle();
        inMyList = !!list;
      }
    }
  } else {
    video = DEV_VIDEOS.find((v) => v.slug === slug) ?? null;
    if (video) {
      related = DEV_VIDEOS.filter(
        (v) => v.category_id === video!.category_id && v.id !== video!.id,
      ).slice(0, 8);
    }
  }

  if (!video) notFound();

  return (
    <div>
      <section className="relative isolate min-h-[78svh] overflow-hidden">
        <div className="absolute inset-0">
          {video.backdrop_url || video.poster_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={video.backdrop_url ?? video.poster_url ?? ""}
              alt={video.title}
              className="size-full object-cover"
            />
          ) : (
            <div className="size-full bg-gradient-to-br from-air/30 via-lunar/20 to-canvas" />
          )}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/55 to-canvas/10"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-canvas/95 via-canvas/30 to-transparent"
          />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[78svh] max-w-6xl items-end px-4 pb-16 pt-32 sm:px-6 lg:px-10">
          <Reveal>
            <div className="max-w-3xl">
              <Badge variant="air" size="lg" className="mb-5">
                Vintage TV
              </Badge>
              <h1 className="font-display text-cinema leading-[0.95] tracking-tight text-ink">
                {video.title}
              </h1>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-label text-ink-muted">
                {video.duration_seconds && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-4" />
                    {formatDuration(video.duration_seconds)}
                  </span>
                )}
                {video.release_date && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="size-4" />
                    {new Date(video.release_date).getFullYear()}
                  </span>
                )}
              </div>
              {video.synopsis && (
                <p className="mt-6 max-w-2xl text-body-lg text-ink-subtle text-pretty">
                  {video.synopsis}
                </p>
              )}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {hasTv ? (
                  <Button asChild variant="brand" size="xl">
                    <Link href={`/tv/watch/${video.id}`}>
                      <Play className="size-5 fill-current" /> Play
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="brand" size="xl">
                    <Link href={session ? "/tv/subscribe" : "/login?redirect=/tv"}>
                      <Lock className="size-4" />
                      {session ? "Subscribe to watch" : "Sign in"}
                    </Link>
                  </Button>
                )}
                {session && (
                  <ToggleMyListButton videoId={video.id} initialInList={inMyList} />
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {related.length > 0 && (
        <section className="space-y-5 py-16">
          <CategoryRow title="More like this" videos={related} />
        </section>
      )}
    </div>
  );
}
