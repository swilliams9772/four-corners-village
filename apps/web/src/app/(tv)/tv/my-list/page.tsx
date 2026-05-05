import Link from "next/link";
import { Bookmark, Sparkle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PosterCard } from "@/components/tv/poster-card";
import { Card } from "@/components/ui/card";
import { DisplayHeading, Eyebrow } from "@/components/ui/typography";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { Video } from "@/lib/supabase/types";

export const metadata = { title: "My List" };

export default async function MyListPage() {
  const session = await getCurrentUser();
  if (!session) return null;

  const supabase = await createClient();
  let videos: Video[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("video_my_list")
      .select("video_id, added_at, videos(*)")
      .eq("user_id", session.user.id)
      .order("added_at", { ascending: false });
    videos = (data ?? [])
      .map((row) => (row as unknown as { videos: Video }).videos)
      .filter(Boolean);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-10">
      <header className="mb-10">
        <Eyebrow>
          <Bookmark className="size-3" />
          Saved for later
        </Eyebrow>
        <DisplayHeading level={1} size="h2">
          My list
        </DisplayHeading>
      </header>

      {videos.length === 0 ? (
        <Card variant="glass" className="mx-auto max-w-md p-12 text-center">
          <Sparkle className="mx-auto mb-4 size-8 text-air" />
          <p className="mb-6 text-body text-ink-subtle">
            Nothing saved yet. Browse the library and tap{" "}
            <span className="text-ink-subtle">+</span> on titles you want to come back to.
          </p>
          <Button asChild variant="brand" size="lg">
            <Link href="/tv">Browse the library</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {videos.map((v) => (
            <PosterCard key={v.id} video={v} />
          ))}
        </div>
      )}
    </div>
  );
}
