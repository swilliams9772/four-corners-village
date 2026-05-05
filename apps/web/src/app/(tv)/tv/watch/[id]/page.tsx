import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { HlsPlayer } from "@/components/tv/hls-player";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { Video, VideoProgress } from "@/lib/supabase/types";

export const metadata = { title: "Watch" };

// Watch routes are auth/sub-gated by middleware
export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getCurrentUser();
  if (!session) notFound();

  const supabase = await createClient();
  if (!supabase) notFound();

  const [{ data: video }, { data: progress }] = await Promise.all([
    supabase.from("videos").select("*").eq("id", id).eq("is_published", true).maybeSingle(),
    supabase
      .from("video_progress")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("video_id", id)
      .maybeSingle(),
  ]);

  if (!video) notFound();
  const v = video as Video;
  const p = progress as VideoProgress | null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <Link
        href={`/tv/${v.slug}`}
        className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm text-white backdrop-blur transition-colors hover:bg-black/80"
      >
        <ArrowLeft className="h-4 w-4" />
        {v.title}
      </Link>
      <HlsPlayer videoId={v.id} initialPosition={p?.position_seconds ?? 0} />
    </div>
  );
}
