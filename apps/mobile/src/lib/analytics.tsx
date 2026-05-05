import * as React from "react";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { env } from "./env";
import { supabase } from "./supabase";

/**
 * Mobile analytics provider. Mirrors the web's setup — pageviews are
 * captured manually via the navigation listener so the App Router and
 * Expo Router agree on event shape.
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  if (!env.posthog.key) return <>{children}</>;
  return (
    <PHProvider
      apiKey={env.posthog.key}
      options={{
        host: env.posthog.host,
        captureAppLifecycleEvents: true,
        enableSessionReplay: false,
        customAsyncStorage: AsyncStorage,
        flushAt: 1,
        flushInterval: 30,
      }}
    >
      <Identifier />
      {children}
    </PHProvider>
  );
}

function Identifier() {
  const ph = usePostHog();
  React.useEffect(() => {
    if (!ph) return;
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) ph.identify(data.user.id, { email: data.user.email });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") ph.reset();
      else if (session?.user) ph.identify(session.user.id, { email: session.user.email });
    });
    return () => sub.subscription.unsubscribe();
  }, [ph]);
  return null;
}

export { usePostHog };
