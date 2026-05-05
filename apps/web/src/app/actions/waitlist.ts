"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

const schema = z.object({
  email: z.string().email(),
  interest: z.enum(["member", "practitioner", "tv", "all"]).optional().default("all"),
  source: z.string().optional(),
});

export async function joinWaitlist(input: {
  email: string;
  interest?: "member" | "practitioner" | "tv" | "all";
  source?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please enter a valid email." };
  }

  const supabase = await createClient();
  if (!supabase) {
    // Dev-mode fallback - log and pretend it worked
    console.info("[waitlist:dev]", parsed.data);
    return { ok: true };
  }

  const { error } = await supabase.from("waitlist").insert({
    email: parsed.data.email,
    interest: parsed.data.interest,
    source: parsed.data.source ?? env.app.url,
  });

  if (error && error.code !== "23505") {
    // 23505 is unique_violation (already on waitlist) - treat as success
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
