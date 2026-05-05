import { NextResponse, type NextRequest } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  getCurrentUserFromBearer,
  hasActiveTvSubscription,
} from "@/lib/auth";
import { env } from "@/lib/env";

/**
 * Entitlement endpoint used by the mobile app under the Reader-app model.
 * Subscriptions are sold on the web via Stripe; mobile consumes the user's
 * existing entitlement state. Returns a minimal shape so we can extend it
 * (course access, practitioner role) without breaking older client builds.
 */
export async function GET(request: NextRequest) {
  const session = await getCurrentUserFromBearer(request.headers.get("authorization"));
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tvActive = await hasActiveTvSubscription(session.user.id);

  let practitionerSlug: string | null = null;
  let practitionerTier: string | null = null;
  if (env.supabase.configured && env.supabase.serviceRoleKey) {
    const sb = createSupabaseClient(env.supabase.url, env.supabase.serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await sb
      .from("practitioners")
      .select("slug, tier, status")
      .eq("user_id", session.user.id)
      .maybeSingle();
    if (data?.status === "approved") {
      practitionerSlug = data.slug ?? null;
      practitionerTier = data.tier ?? null;
    }
  }

  return NextResponse.json(
    {
      user: { id: session.user.id, email: session.user.email },
      tv: { active: tvActive },
      practitioner: { slug: practitionerSlug, tier: practitionerTier },
      // Mobile is a Reader app; subscriptions purchased on web only.
      checkout: {
        url: `${env.app.url}/dashboard/account/billing`,
        practitionerUrl: `${env.app.url}/practitioners/apply`,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
