"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { draw } from "@/lib/oracle/cards";
import { interpretReading } from "@/lib/oracle/interpret";

const drawSchema = z.object({
  question: z.string().max(500).optional(),
  spread: z.enum(["one", "three"]).default("three"),
});

export async function drawOracleReading(input: { question?: string; spread?: "one" | "three" }) {
  const parsed = drawSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const cards = draw(parsed.data.spread === "one" ? 1 : 3);
  const interpretation = await interpretReading({
    question: parsed.data.question ?? null,
    cards,
  });

  const supabase = await createClient();
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("oracle_readings").insert({
        user_id: user.id,
        question: parsed.data.question ?? null,
        cards: cards as unknown as object,
        interpretation,
      });
    }
  }

  return {
    ok: true as const,
    cards,
    interpretation,
  };
}
