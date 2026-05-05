"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { buildZoomAuthUrl } from "@/lib/zoom";
import { env } from "@/lib/env";

const STATE_COOKIE = "zoom_oauth_state";
/** Short window — only enough to round-trip through Zoom's consent screen. */
const STATE_TTL_SECONDS = 10 * 60;

/**
 * Mints a CSRF state token, stashes it in an HttpOnly cookie, and redirects
 * the practitioner to Zoom's OAuth consent screen. The matching state value
 * comes back to /api/zoom/callback where we re-validate against the cookie.
 */
export async function connectZoom(): Promise<void> {
  if (!env.zoom.configured) throw new Error("Zoom is not configured on this deployment");
  const session = await getCurrentUser();
  if (!session) redirect("/login");

  const state = `${session.user.id}.${crypto.randomUUID()}`;
  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: STATE_TTL_SECONDS,
  });

  redirect(buildZoomAuthUrl(state));
}

export async function disconnectZoom(): Promise<void> {
  const session = await getCurrentUser();
  if (!session) redirect("/login");

  const supabase = createServiceClient();
  await supabase
    .from("practitioners")
    .update({ zoom_tokens: null, zoom_connected_at: null })
    .eq("user_id", session.user.id);

  revalidatePath("/practitioner/space");
}
