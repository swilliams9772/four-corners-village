import * as React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "@/lib/auth-context";

/**
 * App entry — redirects to (auth) if logged out, (app) if logged in. The
 * splash + font loading happens in `_layout.tsx`.
 */
export default function Index() {
  const { session, loading } = useAuth();
  if (loading) return null;
  return <Redirect href={session ? "/(app)/dashboard" : "/(auth)/welcome"} />;
}
