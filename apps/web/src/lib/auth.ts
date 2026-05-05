import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { isAdminEmail } from "@/lib/utils";
import type { Profile } from "@/lib/supabase/types";

/**
 * Server-side helper. Returns the authenticated profile, or null
 * if no session / Supabase isn't configured.
 */
export async function getCurrentUser(): Promise<{
  user: { id: string; email: string };
  profile: Profile;
  isAdmin: boolean;
} | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;

  return {
    user: { id: user.id, email: user.email },
    profile: profile as Profile,
    isAdmin: profile.role === "admin" || isAdminEmail(user.email),
  };
}

/**
 * Bearer-token auth — used by the mobile app's API consumption. Verifies the
 * access token against Supabase auth.users and returns the same shape as
 * `getCurrentUser` (cookie-based). Distinct entry point because the cookie
 * helpers don't apply to header-only requests.
 */
export async function getCurrentUserFromBearer(
  authHeader: string | null,
): Promise<{ user: { id: string; email: string }; isAdmin: boolean } | null> {
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1];
  if (!token) return null;
  if (!env.supabase.configured) return null;

  // Use a one-shot anon client purely to validate the JWT.
  const sb = createSupabaseClient(env.supabase.url, env.supabase.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user || !data.user.email) return null;
  return {
    user: { id: data.user.id, email: data.user.email },
    isAdmin: isAdminEmail(data.user.email),
  };
}

export async function hasActiveTvSubscription(userId: string): Promise<boolean> {
  // Use the service-role client because callers come from many auth contexts
  // (cookie-based pages AND Bearer-token mobile API routes). The user id is
  // always trusted because it comes from a verified session.
  if (!env.supabase.configured || !env.supabase.serviceRoleKey) return false;
  const sb = createSupabaseClient(env.supabase.url, env.supabase.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data } = await sb
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("user_id", userId)
    .eq("product", "tv")
    .in("status", ["active", "trialing"])
    .order("current_period_end", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return false;
  if (!data.current_period_end) return true;
  return new Date(data.current_period_end) > new Date();
}
