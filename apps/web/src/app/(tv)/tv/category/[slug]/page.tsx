import { notFound } from "next/navigation";
import { PosterCard } from "@/components/tv/poster-card";
import { createClient } from "@/lib/supabase/server";
import { DEV_CATEGORIES, DEV_VIDEOS } from "@/lib/dev-data";
import type { Video, VideoCategory } from "@/lib/supabase/types";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: slug.replace(/-/g, " ") };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  let category: VideoCategory | null = null;
  let videos: Video[] = [];

  if (supabase) {
    const { data: c } = await supabase.from("video_categories").select("*").eq("slug", slug).maybeSingle();
    category = c as VideoCategory | null;
    if (category) {
      const { data: v } = await supabase
        .from("videos")
        .select("*")
        .eq("category_id", category.id)
        .eq("is_published", true)
        .order("release_date", { ascending: false });
      videos = (v as Video[] | null) ?? [];
    }
  } else {
    category = DEV_CATEGORIES.find((c) => c.slug === slug) ?? null;
    if (category) videos = DEV_VIDEOS.filter((v) => v.category_id === category!.id);
  }

  if (!category) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{category.name}</h1>
        {category.description && <p className="mt-2 text-slate-400">{category.description}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {videos.map((v) => <PosterCard key={v.id} video={v} />)}
      </div>
    </div>
  );
}
