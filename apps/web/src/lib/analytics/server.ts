import { PostHog } from "posthog-node";
import { env } from "@/lib/env";

let cached: PostHog | null = null;

/**
 * Server-side PostHog client used by webhooks (e.g. Stripe checkout
 * completion) and by server actions to capture events bound to a user
 * even when they're not in a browser tab.
 */
export function getServerPostHog(): PostHog | null {
  if (!env.posthog.configured) return null;
  if (cached) return cached;
  cached = new PostHog(env.posthog.key, {
    host: env.posthog.host,
    flushAt: 1,
    flushInterval: 0,
  });
  return cached;
}

export async function captureServerEvent(opts: {
  distinctId: string;
  event: string;
  properties?: Record<string, unknown>;
}) {
  const ph = getServerPostHog();
  if (!ph) return;
  ph.capture({
    distinctId: opts.distinctId,
    event: opts.event,
    properties: opts.properties,
  });
  // serverless: flush so we don't lose the event when the function recycles
  await ph.shutdown();
  cached = null;
}
