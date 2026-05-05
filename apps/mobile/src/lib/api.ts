import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { env } from "./env";

export type Entitlements = {
  user: { id: string; email: string };
  tv: { active: boolean };
  practitioner: { slug: string | null; tier: string | null };
  checkout: { url: string; practitionerUrl: string };
};

async function fetchWithToken<T>(path: string, init?: RequestInit): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${env.app.url}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} ${body}`);
  }
  return (await res.json()) as T;
}

export function useEntitlements() {
  const [data, setData] = useState<Entitlements | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchWithToken<Entitlements>("/api/me/entitlements");
      setData(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { entitlements: data, loading, error, refresh };
}

export const api = {
  async signTvManifest(uid: string): Promise<{ manifest: string; mode: "signed" | "unsigned" }> {
    return fetchWithToken(`/api/tv/sign?uid=${encodeURIComponent(uid)}`);
  },
  async drawOracle(input: { question?: string; spread?: "one" | "three" }) {
    return fetchWithToken<{ cards: unknown[]; interpretation: string }>(
      "/api/oracle/draw",
      { method: "POST", body: JSON.stringify(input) },
    );
  },
};
