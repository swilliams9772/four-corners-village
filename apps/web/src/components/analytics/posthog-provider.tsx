"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { env } from "@/lib/env";

let initialized = false;

/**
 * Lightweight analytics wrapper.
 *
 * - No-ops when `NEXT_PUBLIC_POSTHOG_KEY` is unset (most local dev).
 * - Captures pageviews on every route change (App Router doesn't fire its
 *   own; we observe `pathname + search`).
 * - Honors the user's GPC / DNT / `localStorage[fc-analytics-opt-out]`.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    if (initialized) return;
    if (!env.posthog.configured) return;
    if (typeof window === "undefined") return;
    if (
      navigator.doNotTrack === "1" ||
      // @ts-expect-error -- non-standard but widely shipped
      window.globalPrivacyControl === true ||
      window.localStorage.getItem("fc-analytics-opt-out") === "1"
    ) {
      return;
    }
    posthog.init(env.posthog.key, {
      api_host: env.posthog.host,
      capture_pageview: false,
      capture_pageleave: true,
      person_profiles: "identified_only",
      autocapture: false,
      disable_session_recording: true,
      loaded: (ph) => {
        if (process.env.NODE_ENV === "development") ph.debug();
      },
    });
    initialized = true;
  }, []);

  return <PHProvider client={posthog}>{children}<PostHogPageview /></PHProvider>;
}

function PostHogPageview() {
  const ph = usePostHog();
  const pathname = usePathname();
  const search = useSearchParams();

  React.useEffect(() => {
    if (!ph) return;
    if (!initialized) return;
    const url = `${pathname}${search?.toString() ? `?${search.toString()}` : ""}`;
    ph.capture("$pageview", { $current_url: url });
  }, [ph, pathname, search]);

  return null;
}
