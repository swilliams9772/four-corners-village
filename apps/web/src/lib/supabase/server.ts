import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";

/**
 * Server-side Supabase client (RSCs, server actions, route handlers).
 * Returns a no-op stub if Supabase isn't configured yet so the
 * marketing pages still render cleanly during local development.
 */
export async function createClient() {
  const cookieStore = await cookies();

  if (!env.supabase.configured) {
    // Stub that returns null sessions and empty queries
    return null;
  }

  return createServerClient(env.supabase.url, env.supabase.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component - ignore. Middleware refreshes the session.
        }
      },
    },
  });
}

/**
 * Service-role client for privileged work (Stripe webhooks, admin ops).
 * NEVER expose to the browser.
 */
export function createServiceClient() {
  const { url, serviceRoleKey } = env.supabase.requireServer();
  return createServerClient(url, serviceRoleKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {},
    },
  });
}
