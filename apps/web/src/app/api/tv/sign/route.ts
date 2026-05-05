import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserFromBearer, hasActiveTvSubscription } from "@/lib/auth";
import { signPlaybackToken, hlsUrlFor } from "@/lib/cloudflare/stream";
import { env } from "@/lib/env";

/**
 * Mobile-friendly playback endpoint. Accepts a Bearer access token from the
 * Expo app (Supabase JWT) plus a `uid` query param (the Cloudflare Stream
 * UID), validates the subscription, and returns a short-lived signed manifest.
 *
 * The web app uses `/api/tv/playback/[id]` against a video DB id and reads
 * the user from cookies; we keep them as separate routes so neither auth
 * shape contaminates the other.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const session = await getCurrentUserFromBearer(authHeader);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const uid = request.nextUrl.searchParams.get("uid");
  if (!uid || !/^[a-z0-9]+$/i.test(uid)) {
    return NextResponse.json({ error: "Bad uid" }, { status: 400 });
  }

  const active = await hasActiveTvSubscription(session.user.id);
  if (!active) return NextResponse.json({ error: "Subscription required" }, { status: 402 });

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 500 });

  const { data: video } = await supabase
    .from("videos")
    .select("id, stream_uid, is_published")
    .eq("stream_uid", uid)
    .maybeSingle();
  if (!video || !video.is_published) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!env.cloudflare.signingJwk || !env.cloudflare.signingKeyId) {
    return NextResponse.json({
      manifest: hlsUrlFor(uid),
      mode: "unsigned",
    });
  }

  const token = await signPlaybackToken({
    videoUid: uid,
    userId: session.user.id,
    expSeconds: 7200,
  });

  return NextResponse.json(
    { manifest: hlsUrlFor(token), mode: "signed" },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, private" } },
  );
}
