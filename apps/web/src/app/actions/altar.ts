"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const offeringSchema = z.object({
  altarId: z.string().uuid(),
  offeringType: z.enum(["candle", "prayer", "flower", "crystal", "intention"]),
  message: z.string().max(500).nullable().optional(),
});

export async function placeOffering(input: {
  altarId: string;
  offeringType: "candle" | "prayer" | "flower" | "crystal" | "intention";
  message: string | null;
}) {
  const parsed = offeringSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const supabase = await createClient();
  if (!supabase) return { error: "Not configured" };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("altar_offerings").insert({
    altar_id: parsed.data.altarId,
    user_id: user.id,
    offering_type: parsed.data.offeringType,
    message: parsed.data.message,
  });
  if (error) return { error: error.message };

  return { ok: true };
}
