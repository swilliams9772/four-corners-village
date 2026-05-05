import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Auth + paywall gating.
 *
 * - /dashboard, /admin, /practitioners/apply: must be signed in
 * - /admin/*: must additionally be admin (role check happens in page layout)
 * - /tv/watch/*: must be signed in AND have an active TV subscription
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { response, user, supabase } = await updateSession(request);

  const requiresAuth =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/account") ||
    pathname === "/practitioners/apply" ||
    pathname.startsWith("/practitioner/") ||
    pathname.startsWith("/tv/watch") ||
    pathname.startsWith("/tv/my-list");

  if (requiresAuth && !user) {
    const redirect = new URL("/login", request.url);
    redirect.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirect);
  }

  // TV paywall - active sub required to watch
  if (user && supabase && pathname.startsWith("/tv/watch")) {
    const { data } = await supabase
      .from("subscriptions")
      .select("status, current_period_end")
      .eq("user_id", user.id)
      .eq("product", "tv")
      .in("status", ["active", "trialing"])
      .order("current_period_end", { ascending: false })
      .limit(1)
      .maybeSingle();

    const active =
      data &&
      (!data.current_period_end ||
        new Date(data.current_period_end) > new Date());

    if (!active) {
      return NextResponse.redirect(new URL("/tv/subscribe", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm)$).*)",
  ],
};
