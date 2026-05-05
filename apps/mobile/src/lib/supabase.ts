import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { env } from "./env";

/**
 * Secure adapter for Supabase auth on native — keeps the refresh token in the
 * platform keychain (iOS Keychain / Android Keystore). On web preview builds
 * we fall back to localStorage since SecureStore isn't available there.
 */
const SecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!env.supabase.configured) {
    throw new Error(
      "Supabase env not configured. Set EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  if (!client) {
    client = createClient(env.supabase.url, env.supabase.anonKey, {
      auth: {
        storage: Platform.OS === "web" ? undefined : SecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}

/**
 * Convenience proxy — same instance as `getSupabase()` but lazily evaluated
 * via Proxy so module-level imports like `import { supabase }` don't crash
 * on cold start when env isn't yet configured (web preview, Storybook, etc).
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const real = getSupabase();
    // @ts-expect-error -- runtime forwarding
    const value = real[prop];
    return typeof value === "function" ? value.bind(real) : value;
  },
});
