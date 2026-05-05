"use client";

import * as React from "react";
import { usePostHog } from "posthog-js/react";
import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

/**
 * Watches the Supabase auth state on the client and identifies / resets
 * the PostHog distinct id whenever the user signs in or out. Mounted
 * once at the root inside `<PostHogProvider>`.
 */
export function AnalyticsIdentifier() {
  const ph = usePostHog();

  React.useEffect(() => {
    if (!ph) return;
    if (!env.supabase.configured) return;
    const sb = createBrowserClient(env.supabase.url, env.supabase.anonKey);
    let cancelled = false;

    sb.auth.getUser().then(({ data }) => {
      if (cancelled || !data.user) return;
      ph.identify(data.user.id, { email: data.user.email });
    });

    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        ph.reset();
      } else if (session?.user) {
        ph.identify(session.user.id, { email: session.user.email });
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [ph]);

  return null;
}
