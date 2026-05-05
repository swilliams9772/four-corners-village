"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { createDirectUpload, deleteVideo as deleteCfVideo, getVideo, thumbnailUrlFor } from "@/lib/cloudflare/stream";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  const session = await getCurrentUser();
  if (!session?.isAdmin) throw new Error("Forbidden");
  return session;
}

/**
 * Server action: returns a one-time Direct Creator Upload URL.
 * The browser uploads bytes straight to Cloudflare without
 * proxying through us. We persist the placeholder DB row immediately
 * so admins can edit metadata while encoding completes.
 */
export async function startVideoUpload(input: { title: string; categoryId?: string }) {
  await requireAdmin();
  const supabase = createServiceClient();

  const slug = `${slugify(input.title)}-${Math.random().toString(36).slice(2, 7)}`;

  const cf = await createDirectUpload({
    requireSignedURLs: true,
    meta: { name: input.title },
    maxDurationSeconds: 4 * 60 * 60,
  });

  const { data, error } = await supabase
    .from("videos")
    .insert({
      slug,
      title: input.title,
      stream_uid: cf.uid,
      category_id: input.categoryId ?? null,
      is_published: false,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    videoId: data.id as string,
    uploadURL: cf.uploadURL,
    streamUid: cf.uid,
  };
}

const updateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).optional(),
  synopsis: z.string().max(5000).optional(),
  category_id: z.string().uuid().nullable().optional(),
  series_id: z.string().uuid().nullable().optional(),
  episode_number: z.coerce.number().int().nullable().optional(),
  season_number: z.coerce.number().int().optional(),
  is_published: z.coerce.boolean().optional(),
  release_date: z.string().nullable().optional(),
});

export async function updateVideo(formData: FormData): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();

  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title") ?? undefined,
    synopsis: formData.get("synopsis") ?? undefined,
    category_id: formData.get("category_id") || null,
    series_id: formData.get("series_id") || null,
    episode_number: formData.get("episode_number") ? Number(formData.get("episode_number")) : null,
    season_number: formData.get("season_number") ? Number(formData.get("season_number")) : 1,
    is_published: formData.get("is_published") === "on",
    release_date: formData.get("release_date") || null,
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const { id, ...patch } = parsed.data;
  const { error } = await supabase.from("videos").update(patch).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/tv");
  revalidatePath("/tv");
}

export async function refreshVideoFromCloudflare(videoId: string) {
  await requireAdmin();
  const supabase = createServiceClient();

  const { data: video } = await supabase
    .from("videos")
    .select("stream_uid")
    .eq("id", videoId)
    .single();

  if (!video?.stream_uid) return { error: "No stream UID" };

  const cf = await getVideo(video.stream_uid);
  await supabase
    .from("videos")
    .update({
      duration_seconds: Math.round(cf.duration ?? 0),
      poster_url: thumbnailUrlFor(video.stream_uid),
    })
    .eq("id", videoId);

  revalidatePath("/admin/tv");
  return { ok: true, ready: cf.readyToStream };
}

export async function deleteVideoAction(videoId: string) {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data: video } = await supabase
    .from("videos")
    .select("stream_uid")
    .eq("id", videoId)
    .single();

  if (video?.stream_uid) {
    try {
      await deleteCfVideo(video.stream_uid);
    } catch (err) {
      console.error("[tv-admin] CF delete failed", err);
    }
  }

  const { error } = await supabase.from("videos").delete().eq("id", videoId);
  if (error) return { error: error.message };
  revalidatePath("/admin/tv");
  return { ok: true };
}

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const supabase = createServiceClient();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name required" };
  const { error } = await supabase
    .from("video_categories")
    .insert({ name, slug: slugify(name) });
  if (error) return { error: error.message };
  revalidatePath("/admin/tv");
  return { ok: true };
}
