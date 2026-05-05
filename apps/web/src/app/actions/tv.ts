"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleMyList(videoId: string) {
  const supabase = await createClient();
  if (!supabase) return { error: "Not configured" };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: existing } = await supabase
    .from("video_my_list")
    .select("video_id")
    .eq("user_id", user.id)
    .eq("video_id", videoId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("video_my_list")
      .delete()
      .eq("user_id", user.id)
      .eq("video_id", videoId);
    revalidatePath("/tv/my-list");
    return { ok: true, inList: false };
  } else {
    await supabase
      .from("video_my_list")
      .insert({ user_id: user.id, video_id: videoId });
    revalidatePath("/tv/my-list");
    return { ok: true, inList: true };
  }
}

export async function recordProgress(videoId: string, positionSeconds: number, completed = false) {
  const supabase = await createClient();
  if (!supabase) return { error: "Not configured" };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  await supabase
    .from("video_progress")
    .upsert({
      user_id: user.id,
      video_id: videoId,
      position_seconds: Math.floor(positionSeconds),
      completed,
      last_watched_at: new Date().toISOString(),
    });
  return { ok: true };
}
