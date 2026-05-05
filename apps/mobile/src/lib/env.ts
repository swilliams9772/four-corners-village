import Constants from "expo-constants";

/**
 * Expo public env. We mirror the web's NEXT_PUBLIC_ vars under the
 * EXPO_PUBLIC_ prefix so they ship into the JS bundle. Server-only secrets
 * (service role keys, Stripe secret) NEVER touch the mobile app.
 */
const extra = Constants.expoConfig?.extra ?? {};

function read(name: string): string {
  return (
    process.env[`EXPO_PUBLIC_${name}`] ??
    process.env[name] ??
    (extra as Record<string, string>)[name] ??
    ""
  );
}

export const env = {
  app: {
    url: read("APP_URL") || "https://fourcorners.village",
    name: "4 Corners Village",
  },
  supabase: {
    url: read("SUPABASE_URL"),
    anonKey: read("SUPABASE_ANON_KEY"),
    get configured() {
      return Boolean(this.url && this.anonKey);
    },
  },
  cloudflare: {
    customerCode: read("CLOUDFLARE_STREAM_CUSTOMER_CODE"),
  },
  posthog: {
    key: read("POSTHOG_KEY"),
    host: read("POSTHOG_HOST") || "https://us.i.posthog.com",
  },
  google: {
    iosClientId: read("GOOGLE_IOS_CLIENT_ID"),
    webClientId: read("GOOGLE_WEB_CLIENT_ID"),
  },
};
