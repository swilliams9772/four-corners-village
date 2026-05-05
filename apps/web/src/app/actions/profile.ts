"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const profileSchema = z.object({
  full_name: z.string().max(120).optional(),
  display_name: z.string().max(60).optional(),
  bio: z.string().max(1000).optional(),
  birth_date: z.string().optional(),
  birth_time: z.string().optional(),
  birth_location: z.string().max(200).optional(),
});

export async function updateProfile(formData: FormData): Promise<void> {
  const supabase = await createClient();
  if (!supabase) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const parsed = profileSchema.safeParse({
    full_name: formData.get("full_name") ?? undefined,
    display_name: formData.get("display_name") ?? undefined,
    bio: formData.get("bio") ?? undefined,
    birth_date: formData.get("birth_date") ?? undefined,
    birth_time: formData.get("birth_time") ?? undefined,
    birth_location: formData.get("birth_location") ?? undefined,
  });
  if (!parsed.success) return;

  const update: Record<string, string | null> = {};
  for (const [k, v] of Object.entries(parsed.data)) {
    if (v !== undefined && v !== "") update[k] = v;
    else update[k] = null;
  }

  await supabase.from("profiles").update(update).eq("id", user.id);
  revalidatePath("/account");
}
