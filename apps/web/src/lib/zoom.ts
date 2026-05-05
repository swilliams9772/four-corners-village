import { env } from "@/lib/env";
import type { ZoomTokens } from "@/lib/supabase/types";

const ZOOM_AUTH_URL = "https://zoom.us/oauth/authorize";
const ZOOM_TOKEN_URL = "https://zoom.us/oauth/token";

export function buildZoomAuthUrl(state: string): string {
  if (!env.zoom.configured) {
    throw new Error("Zoom integration not configured");
  }
  const url = new URL(ZOOM_AUTH_URL);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", env.zoom.clientId);
  url.searchParams.set("redirect_uri", env.zoom.redirectUri || `${env.app.url}/api/zoom/callback`);
  url.searchParams.set("state", state);
  return url.toString();
}

type ZoomTokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
};

export async function exchangeZoomCode(code: string): Promise<ZoomTokenResponse> {
  const basic = Buffer.from(`${env.zoom.clientId}:${env.zoom.clientSecret}`).toString("base64");
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: env.zoom.redirectUri || `${env.app.url}/api/zoom/callback`,
  });
  const res = await fetch(ZOOM_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  if (!res.ok) throw new Error(`Zoom token exchange failed: ${res.status}`);
  return res.json();
}

export async function refreshZoomToken(refreshToken: string): Promise<ZoomTokenResponse> {
  const basic = Buffer.from(`${env.zoom.clientId}:${env.zoom.clientSecret}`).toString("base64");
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const res = await fetch(ZOOM_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  if (!res.ok) throw new Error(`Zoom token refresh failed: ${res.status}`);
  return res.json();
}

/**
 * Convenience helper that turns a freshly-obtained token response into the
 * shape we persist in `practitioners.zoom_tokens`. Subtracts a 60s buffer from
 * `expires_in` so we refresh just before Zoom kicks us out.
 */
export function tokensFromResponse(resp: ZoomTokenResponse): ZoomTokens {
  return {
    access_token: resp.access_token,
    refresh_token: resp.refresh_token,
    expires_in: resp.expires_in,
    expires_at: Date.now() + (resp.expires_in - 60) * 1000,
    scope: resp.scope,
  };
}

/**
 * Returns a guaranteed-fresh access token, refreshing transparently if the
 * stored one has expired. Pass the persisted tokens; if a refresh happens, the
 * caller should write the returned tokens back to the database.
 */
export async function getFreshAccessToken(
  tokens: ZoomTokens,
): Promise<{ accessToken: string; tokens: ZoomTokens; refreshed: boolean }> {
  if (Date.now() < tokens.expires_at) {
    return { accessToken: tokens.access_token, tokens, refreshed: false };
  }
  const next = tokensFromResponse(await refreshZoomToken(tokens.refresh_token));
  return { accessToken: next.access_token, tokens: next, refreshed: true };
}

export async function createZoomMeeting(opts: {
  accessToken: string;
  topic: string;
  startTime: string;
  durationMinutes: number;
  agenda?: string;
}): Promise<{ id: number; join_url: string; start_url: string; password: string }> {
  const res = await fetch("https://api.zoom.us/v2/users/me/meetings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic: opts.topic,
      type: 2,
      start_time: opts.startTime,
      duration: opts.durationMinutes,
      agenda: opts.agenda,
      settings: {
        join_before_host: false,
        waiting_room: true,
        approval_type: 0,
      },
    }),
  });
  if (!res.ok) throw new Error(`Zoom create meeting failed: ${res.status}`);
  return res.json();
}
