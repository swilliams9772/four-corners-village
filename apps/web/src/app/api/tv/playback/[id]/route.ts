import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, hasActiveTvSubscription } from "@/lib/auth";
import { signPlaybackToken, hlsUrlFor } from "@/lib/cloudflare/stream";
import { env } from "@/lib/env";

/**
 * Returns a short-lived signed HLS manifest URL plus watermark info
 * for the requested video. Refuses if the user isn't a TV subscriber.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const active = await hasActiveTvSubscription(session.user.id);
  if (!active) {
    return NextResponse.json({ error: "Subscription required" }, { status: 402 });
  }

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 500 });

  const { data: video } = await supabase
    .from("videos")
    .select("id, stream_uid, is_published, title")
    .eq("id", id)
    .maybeSingle();

  if (!video || !video.is_published || !video.stream_uid) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Log a view event (best-effort, fire-and-forget)
  supabase
    .from("video_views")
    .insert({
      user_id: session.user.id,
      video_id: video.id,
      ip_hash: null,
      user_agent: request.headers.get("user-agent") ?? null,
    })
    .then(() => {});

  // If signing keys aren't configured, fall back to public manifest
  // (only acceptable in dev where requireSignedURLs=false).
  if (!env.cloudflare.signingJwk || !env.cloudflare.signingKeyId) {
    return NextResponse.json({
      manifestUrl: hlsUrlFor(video.stream_uid),
      watermark: {
        userId: session.user.id.slice(0, 8),
        email: session.user.email,
      },
      mode: "unsigned",
    });
  }

  const token = await signPlaybackToken({
    videoUid: video.stream_uid,
    userId: session.user.id,
    expSeconds: 7200,
  });

  return NextResponse.json({
    manifestUrl: hlsUrlFor(token),
    watermark: {
      userId: session.user.id.slice(0, 8),
      email: session.user.email,
    },
    mode: "signed",
  }, {
    headers: {
      // Prevent any kind of intermediate caching
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
    },
  });
}
