import * as React from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";
import { env } from "./env";
import { registerPushToken, unregisterPushToken } from "./push";

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const Ctx = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!env.supabase.configured) {
      setLoading(false);
      return;
    }
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      // Register push tokens lazily after a successful auth event so we
      // don't ask for permission before the user has signed in.
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        registerPushToken().catch(() => {});
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      signOut: async () => {
        if (!env.supabase.configured) return;
        await unregisterPushToken().catch(() => {});
        await getSupabase().auth.signOut();
      },
    }),
    [session, loading],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
