import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eyebrow, DisplayHeading } from "@/components/ui/typography";
import { createClient } from "@/lib/supabase/server";
import { formatDuration } from "@/lib/utils";
import { UploadDialog } from "./upload-dialog";
import { VideoRowActions } from "./video-row-actions";
import type { Video, VideoCategory } from "@/lib/supabase/types";

export const metadata = { title: "Admin · TV Library" };

export default async function AdminTvPage() {
  const supabase = await createClient();
  let videos: Video[] = [];
  let categories: VideoCategory[] = [];

  if (supabase) {
    const [v, c] = await Promise.all([
      supabase.from("videos").select("*").order("created_at", { ascending: false }),
      supabase.from("video_categories").select("*").order("display_order"),
    ]);
    videos = (v.data as Video[] | null) ?? [];
    categories = (c.data as VideoCategory[] | null) ?? [];
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-9 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Eyebrow>Admin</Eyebrow>
          <DisplayHeading level={1} size="h2" className="mt-3">
            Vintage TV library
          </DisplayHeading>
          <p className="mt-2 text-caption text-ink-muted tabular-nums">
            {videos.length} videos · {categories.length} categories
          </p>
        </div>
        <UploadDialog categories={categories} />
      </div>

      <Card variant="default">
        <CardContent className="p-0">
          {videos.length === 0 ? (
            <p className="px-6 py-12 text-center text-caption text-ink-muted">
              No videos yet — upload your first documentary above.
            </p>
          ) : (
            <div className="divide-y divide-subtle">
              {videos.map((v) => (
                <div key={v.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-canvas-subtle ring-1 ring-subtle">
                    {v.poster_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={v.poster_url}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-caption text-ink-muted">
                        Encoding…
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-ink">{v.title}</p>
                      {v.is_published ? (
                        <Badge variant="earth">Published</Badge>
                      ) : (
                        <Badge variant="outline">Draft</Badge>
                      )}
                    </div>
                    <p className="mt-1 truncate font-mono text-caption text-ink-muted">
                      {v.duration_seconds ? formatDuration(v.duration_seconds) : "—"} · uid{" "}
                      {v.stream_uid?.slice(0, 8) ?? "—"}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/tv/${v.id}`}>Edit</Link>
                  </Button>
                  <VideoRowActions videoId={v.id} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
