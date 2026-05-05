import { env } from "@/lib/env";

const CF_API = "https://api.cloudflare.com/client/v4";

type CFResponse<T> = {
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  messages: unknown[];
  result: T;
};

function authHeaders() {
  return {
    Authorization: `Bearer ${env.cloudflare.apiToken}`,
    "Content-Type": "application/json",
  };
}

function requireConfigured() {
  if (!env.cloudflare.configured) {
    throw new Error(
      "Cloudflare Stream is not configured. Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_STREAM_API_TOKEN.",
    );
  }
}

export type StreamVideo = {
  uid: string;
  thumbnail: string;
  preview: string;
  readyToStream: boolean;
  status: { state: string };
  meta: Record<string, unknown>;
  duration: number;
  playback: { hls: string; dash: string };
};

/**
 * Create a one-time Direct Creator Upload URL. The browser uploads
 * directly to Cloudflare via TUS protocol (resumable) without
 * proxying bytes through our server.
 */
export async function createDirectUpload(opts: {
  maxDurationSeconds?: number;
  meta?: Record<string, string>;
  requireSignedURLs?: boolean;
}): Promise<{ uploadURL: string; uid: string }> {
  requireConfigured();
  const res = await fetch(
    `${CF_API}/accounts/${env.cloudflare.accountId}/stream/direct_upload`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        maxDurationSeconds: opts.maxDurationSeconds ?? 14400,
        requireSignedURLs: opts.requireSignedURLs ?? true,
        meta: opts.meta ?? {},
      }),
    },
  );
  const data = (await res.json()) as CFResponse<{ uploadURL: string; uid: string }>;
  if (!data.success) {
    throw new Error(`CF Stream direct upload failed: ${JSON.stringify(data.errors)}`);
  }
  return data.result;
}

export async function getVideo(uid: string): Promise<StreamVideo> {
  requireConfigured();
  const res = await fetch(
    `${CF_API}/accounts/${env.cloudflare.accountId}/stream/${uid}`,
    { headers: authHeaders() },
  );
  const data = (await res.json()) as CFResponse<StreamVideo>;
  if (!data.success) {
    throw new Error(`CF Stream get video failed: ${JSON.stringify(data.errors)}`);
  }
  return data.result;
}

export async function deleteVideo(uid: string) {
  requireConfigured();
  const res = await fetch(
    `${CF_API}/accounts/${env.cloudflare.accountId}/stream/${uid}`,
    { method: "DELETE", headers: authHeaders() },
  );
  return res.ok;
}

/**
 * Sign a playback token using the per-account JWK from Cloudflare.
 * Token expires in `expSeconds` and embeds the user identifier so we
 * can render a watermark with it server-side.
 *
 * Cloudflare expects an RS256-signed JWT.
 */
export async function signPlaybackToken(opts: {
  videoUid: string;
  userId: string;
  expSeconds?: number;
}): Promise<string> {
  requireConfigured();
  if (!env.cloudflare.signingKeyId || !env.cloudflare.signingJwk) {
    // Fallback: rely on requireSignedURLs=false during dev. Throw
    // to surface the misconfig in production.
    throw new Error(
      "CF Stream signing key not configured. Set CLOUDFLARE_STREAM_SIGNING_KEY_ID and CLOUDFLARE_STREAM_SIGNING_JWK.",
    );
  }

  const exp = Math.floor(Date.now() / 1000) + (opts.expSeconds ?? 7200);
  const header = {
    alg: "RS256" as const,
    typ: "JWT",
    kid: env.cloudflare.signingKeyId,
  };
  const payload = {
    sub: opts.videoUid,
    kid: env.cloudflare.signingKeyId,
    exp,
    accessRules: [
      { type: "any", action: "allow" },
    ],
    // Custom claim used by us when rendering watermark
    fcv_uid: opts.userId,
  };

  const jwk = JSON.parse(env.cloudflare.signingJwk) as JsonWebKey;
  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const enc = (s: string) =>
    Buffer.from(s).toString("base64url");

  const data = `${enc(JSON.stringify(header))}.${enc(JSON.stringify(payload))}`;
  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(data),
  );
  const sigB64 = Buffer.from(new Uint8Array(sig)).toString("base64url");
  return `${data}.${sigB64}`;
}

export function hlsUrlFor(uidOrToken: string) {
  const code = env.cloudflare.customerCode;
  if (!code) return `https://videodelivery.net/${uidOrToken}/manifest/video.m3u8`;
  return `https://${code}.cloudflarestream.com/${uidOrToken}/manifest/video.m3u8`;
}

export function thumbnailUrlFor(uid: string, opts?: { time?: string; height?: number }) {
  const time = opts?.time ?? "5s";
  const height = opts?.height ?? 720;
  const code = env.cloudflare.customerCode;
  const base = code
    ? `https://${code}.cloudflarestream.com`
    : `https://videodelivery.net`;
  return `${base}/${uid}/thumbnails/thumbnail.jpg?time=${time}&height=${height}`;
}
