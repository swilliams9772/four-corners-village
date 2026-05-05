import Link from "next/link";
import { Play, Info, Lock, Sparkle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryRow } from "@/components/tv/category-row";
import { Reveal } from "@/components/ui/reveal";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, hasActiveTvSubscription } from "@/lib/auth";
import { DEV_VIDEOS, DEV_CATEGORIES } from "@/lib/dev-data";
import type { Video, VideoCategory, VideoProgress } from "@/lib/supabase/types";

export const metadata = { title: "Vintage TV" };
export const revalidate = 60;

export default async function TvBrowsePage() {
  const session = await getCurrentUser();
  const hasTv = session ? await hasActiveTvSubscription(session.user.id) : false;

  const supabase = await createClient();
  let videos: Video[] = DEV_VIDEOS;
  let categories: VideoCategory[] = DEV_CATEGORIES;
  let progress: VideoProgress[] = [];

  if (supabase) {
    const [v, c] = await Promise.all([
      supabase
        .from("videos")
        .select("*")
        .eq("is_published", true)
        .order("release_date", { ascending: false }),
      supabase.from("video_categories").select("*").order("display_order"),
    ]);
    videos = (v.data as Video[] | null) ?? [];
    categories = (c.data as VideoCategory[] | null) ?? [];

    if (session) {
      const { data: prog } = await supabase
        .from("video_progress")
        .select("*")
        .eq("user_id", session.user.id)
        .order("last_watched_at", { ascending: false });
      progress = (prog as VideoProgress[] | null) ?? [];
    }
  }

  const featured = videos[0];
  const continueWatching = progress
    .filter((p) => !p.completed && p.position_seconds > 30)
    .map((p) => videos.find((v) => v.id === p.video_id))
    .filter((v): v is Video => Boolean(v));

  const progressByVideoId: Record<string, number> = {};
  for (const p of progress) {
    const v = videos.find((vv) => vv.id === p.video_id);
    if (v?.duration_seconds) {
      progressByVideoId[p.video_id] = (p.position_seconds / v.duration_seconds) * 100;
    }
  }

  const byCategory = categories
    .map((c) => ({
      category: c,
      videos: videos.filter((v) => v.category_id === c.id),
    }))
    .filter((g) => g.videos.length > 0);

  return (
    <div className="pb-20">
      {featured && <FeaturedHero video={featured} locked={!hasTv} isAuthed={!!session} />}

      <div className="space-y-12 pt-12">
        {!hasTv && (
          <Reveal>
            <div className="mx-4 sm:mx-6 lg:mx-10">
              <Card variant="altar" className="overflow-hidden p-0">
                <div className="relative grid items-center gap-8 px-7 py-9 md:grid-cols-[1.5fr_1fr] md:px-10 md:py-12">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-br from-air-soft via-transparent to-lunar-soft"
                  />
                  <div className="relative">
                    <div className="mb-3 inline-flex items-center gap-1.5 rounded-pill border border-air/30 bg-air-soft px-3 py-1 text-caption font-medium uppercase tracking-widest text-air-foreground">
                      <Lock className="size-3" />
                      Members only
                    </div>
                    <h2 className="font-display text-h2 text-ink leading-tight tracking-tight">
                      Subscribe to start watching.
                    </h2>
                    <p className="mt-3 max-w-xl text-body text-ink-subtle text-pretty">
                      Full access to the documentary library — $5.55/month or $55.55/year. Stream-only,
                      no downloads, cancel anytime.
                    </p>
                    <div className="mt-7 flex flex-wrap items-center gap-3">
                      <Button asChild variant="brand" size="lg">
                        <Link href="/tv/subscribe">
                          <Sparkle className="size-4" />
                          Subscribe now
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="lg">
                        <Link href="/pricing">View plans</Link>
                      </Button>
                    </div>
                  </div>
                  <div
                    aria-hidden
                    className="relative hidden h-32 md:block"
                  >
                    <div className="absolute inset-0 grid grid-cols-3 gap-1.5">
                      {[
                        "from-air/60 to-fire/60",
                        "from-lunar/60 to-water/60",
                        "from-earth/60 to-water/60",
                        "from-fire/60 to-air/60",
                        "from-water/60 to-lunar/60",
                        "from-air/60 to-earth/60",
                      ].map((c, i) => (
                        <div
                          key={i}
                          className={`rounded-md bg-gradient-to-br ${c}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </Reveal>
        )}

        {continueWatching.length > 0 && (
          <CategoryRow
            title="Continue watching"
            videos={continueWatching}
            progressByVideoId={progressByVideoId}
          />
        )}
        {byCategory.map(({ category, videos }) => (
          <CategoryRow
            key={category.id}
            title={category.name}
            href={`/tv/category/${category.slug}`}
            videos={videos}
          />
        ))}
      </div>
    </div>
  );
}

function FeaturedHero({
  video,
  locked,
  isAuthed,
}: {
  video: Video;
  locked: boolean;
  isAuthed: boolean;
}) {
  return (
    <section className="relative h-[78svh] min-h-[560px] overflow-hidden">
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
        {/* Multiple overlay gradients to keep the title legible across image variations */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/60 to-canvas/0"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/65 to-canvas/0"
        />
      </div>

      <div className="relative z-10 flex h-full items-end pb-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
          <Reveal>
            <div className="max-w-2xl">
              <Badge variant="air" className="mb-5">
                Featured
              </Badge>
              <h1 className="font-display text-cinema leading-[0.95] tracking-tight text-ink">
                {video.title}
              </h1>
              {video.synopsis && (
                <p className="mt-6 line-clamp-3 max-w-xl text-body-lg text-ink-subtle text-pretty">
                  {video.synopsis}
                </p>
              )}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {locked ? (
                  <Button asChild variant="brand" size="xl">
                    <Link href={isAuthed ? "/tv/subscribe" : "/login?redirect=/tv"}>
                      <Lock className="size-4" />
                      Subscribe to watch
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="brand" size="xl">
                    <Link href={`/tv/watch/${video.id}`}>
                      <Play className="size-5 fill-current" />
                      Play
                    </Link>
                  </Button>
                )}
                <Button asChild variant="outline" size="xl">
                  <Link href={`/tv/${video.slug}`}>
                    <Info className="size-4" />
                    More info
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
