import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { exchangeZoomCode, tokensFromResponse } from "@/lib/zoom";
import { createServiceClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

const STATE_COOKIE = "zoom_oauth_state";

/**
 * Zoom OAuth callback. Exchanges code -> tokens, persists them on the
 * practitioner row, and clears the state cookie. Sanctuary-tier only.
 *
 * Note: tokens are stored as plain JSON. For production, encrypt with
 * Supabase Vault / a managed KMS before persisting.
 */
export async function GET(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.redirect(new URL("/login", req.url));

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  if (!code) {
    return NextResponse.redirect(new URL("/practitioner/space?zoom=missing", req.url));
  }

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(STATE_COOKIE)?.value;

  // Always clear the state cookie — it's single-use.
  cookieStore.delete(STATE_COOKIE);

  if (!expectedState || expectedState !== state) {
    return NextResponse.redirect(new URL("/practitioner/space?zoom=state_mismatch", req.url));
  }
  // The first segment of `state` must match the current user (we minted it that way
  // in connectZoom). Defends against a session swap mid-flow.
  if (!state.startsWith(`${session.user.id}.`)) {
    return NextResponse.redirect(new URL("/practitioner/space?zoom=state_mismatch", req.url));
  }

  try {
    const resp = await exchangeZoomCode(code);
    const tokens = tokensFromResponse(resp);

    const supabase = createServiceClient();
    const { error } = await supabase
      .from("practitioners")
      .update({
        zoom_tokens: tokens,
        zoom_connected_at: new Date().toISOString(),
      })
      .eq("user_id", session.user.id);

    if (error) {
      console.error("[zoom callback] supabase update failed", error);
      return NextResponse.redirect(new URL("/practitioner/space?zoom=error", req.url));
    }

    return NextResponse.redirect(new URL("/practitioner/space?zoom=connected", req.url));
  } catch (err) {
    console.error("[zoom callback]", err);
    return NextResponse.redirect(new URL("/practitioner/space?zoom=error", req.url));
  }
}
