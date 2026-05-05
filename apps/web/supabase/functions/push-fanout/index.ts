// Supabase Edge Function — push fan-out via Expo's notification service.
//
// Invoked by:
//   • Database webhooks on lunar phase changes / new TV titles / altar pings.
//   • Manual admin calls via SQL or a future admin UI.
//
// Required env (set with `supabase secrets set`):
//   SUPABASE_URL                — auto-injected
//   SUPABASE_SERVICE_ROLE_KEY   — auto-injected
//   EXPO_ACCESS_TOKEN           — only required if you turn on Push Security
//
// Body shape:
// {
//   "audience": "all" | "tv-subscribers" | "user:<uuid>",
//   "topic":    "lunar.full" | "tv.new" | "altar.ping" | "course.update",
//   "title":    string,
//   "body":     string,
//   "url"?:     string,           // deep-link, e.g. "/v/lila" or "/tv/<slug>"
//   "payload"?: Record<string, unknown>
// }

// @ts-expect-error Deno-only import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Body = {
  audience: string;
  topic: string;
  title: string;
  body: string;
  url?: string;
  payload?: Record<string, unknown>;
};

// @ts-expect-error Deno globals
Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let payload: Body;
  try {
    payload = (await req.json()) as Body;
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  // @ts-expect-error Deno globals
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  // @ts-expect-error Deno globals
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  // @ts-expect-error Deno globals
  const expoToken = Deno.env.get("EXPO_ACCESS_TOKEN");
  const sb = createClient(supabaseUrl, serviceKey);

  const tokens = await selectAudience(sb, payload.audience);
  if (tokens.length === 0) {
    await logNotification(sb, payload, 0, 0);
    return Response.json({ delivered: 0, failed: 0, reason: "no recipients" });
  }

  const messages = tokens.map((to) => ({
    to,
    title: payload.title,
    body: payload.body,
    sound: "default",
    data: {
      url: payload.url ?? null,
      topic: payload.topic,
      ...payload.payload,
    },
    channelId: "default",
  }));

  // Expo accepts up to 100 messages per request.
  let delivered = 0;
  let failed = 0;
  const failedTokens: string[] = [];

  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        ...(expoToken ? { Authorization: `Bearer ${expoToken}` } : {}),
      },
      body: JSON.stringify(chunk),
    });
    const json = (await res.json()) as { data?: Array<{ status: string; message?: string }> };
    json.data?.forEach((tk, idx) => {
      if (tk.status === "ok") delivered++;
      else {
        failed++;
        failedTokens.push(chunk[idx]!.to);
      }
    });
  }

  // Mark Expo-rejected tokens revoked so we don't keep paying for failures.
  if (failedTokens.length > 0) {
    await sb.from("push_tokens").update({ revoked: true }).in("token", failedTokens);
  }

  await logNotification(sb, payload, delivered, failed);
  return Response.json({ delivered, failed });
});

// deno-lint-ignore no-explicit-any
async function selectAudience(sb: any, audience: string): Promise<string[]> {
  const base = sb.from("push_tokens").select("token").eq("revoked", false);

  if (audience === "all") {
    const { data } = await base;
    return (data ?? []).map((r: { token: string }) => r.token);
  }
  if (audience.startsWith("user:")) {
    const userId = audience.slice("user:".length);
    const { data } = await base.eq("user_id", userId);
    return (data ?? []).map((r: { token: string }) => r.token);
  }
  if (audience === "tv-subscribers") {
    const { data: subs } = await sb
      .from("subscriptions")
      .select("user_id")
      .eq("product", "tv")
      .in("status", ["active", "trialing"]);
    const ids = (subs ?? []).map((s: { user_id: string }) => s.user_id);
    if (ids.length === 0) return [];
    const { data } = await base.in("user_id", ids);
    return (data ?? []).map((r: { token: string }) => r.token);
  }
  return [];
}

// deno-lint-ignore no-explicit-any
async function logNotification(sb: any, p: Body, delivered: number, failed: number) {
  await sb.from("notifications").insert({
    audience: p.audience,
    topic: p.topic,
    title: p.title,
    body: p.body,
    url: p.url ?? null,
    payload: p.payload ?? {},
    delivered_count: delivered,
    failed_count: failed,
  });
}
