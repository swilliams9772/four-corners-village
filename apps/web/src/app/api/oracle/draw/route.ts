import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getCurrentUserFromBearer } from "@/lib/auth";
import { draw } from "@/lib/oracle/cards";
import { interpretReading } from "@/lib/oracle/interpret";
import { env } from "@/lib/env";

const drawSchema = z.object({
  question: z.string().max(500).optional(),
  spread: z.enum(["one", "three"]).default("three"),
});

/**
 * Mobile-friendly oracle draw. Mirrors the server action used by the web at
 * `app/actions/oracle.ts`, but accepts a Bearer access token instead of a
 * cookie session.
 */
export async function POST(request: NextRequest) {
  const session = await getCurrentUserFromBearer(request.headers.get("authorization"));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const parsed = drawSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Bad input" }, { status: 400 });

  const cards = draw(parsed.data.spread === "one" ? 1 : 3);
  const interpretation = await interpretReading({
    question: parsed.data.question ?? null,
    cards,
  });

  // Persist the reading using the service-role client so we don't need a
  // browser-style cookie context. RLS still applies because we only insert
  // rows the user owns.
  if (env.supabase.configured && env.supabase.serviceRoleKey) {
    const sb = createSupabaseClient(env.supabase.url, env.supabase.serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    await sb.from("oracle_readings").insert({
      user_id: session.user.id,
      question: parsed.data.question ?? null,
      cards: cards as unknown as object,
      interpretation,
    });
  }

  return NextResponse.json({ cards, interpretation });
}
