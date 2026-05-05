"use client";

import * as React from "react";

type ThemeName = "dark" | "light" | "system";
type ResolvedTheme = "dark" | "light";

type Ctx = {
  theme: ThemeName;
  resolved: ResolvedTheme;
  setTheme: (t: ThemeName) => void;
  toggle: () => void;
};

const ThemeContext = React.createContext<Ctx | null>(null);

const PREFERS_DARK_QUERY = "(prefers-color-scheme: dark)";

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia(PREFERS_DARK_QUERY).matches ? "dark" : "light";
}

function applyTheme(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "fc-theme",
}: {
  children: React.ReactNode;
  defaultTheme?: ThemeName;
  storageKey?: string;
}) {
  const [theme, setThemeState] = React.useState<ThemeName>(defaultTheme);
  const [resolved, setResolved] = React.useState<ResolvedTheme>(
    defaultTheme === "system" ? "dark" : (defaultTheme as ResolvedTheme),
  );

  // Hydrate from storage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey) as ThemeName | null;
      if (stored) setThemeState(stored);
    } catch {
      /* SSR-only */
    }
  }, [storageKey]);

  // Resolve + apply
  React.useEffect(() => {
    const r: ResolvedTheme = theme === "system" ? getSystemTheme() : (theme as ResolvedTheme);
    setResolved(r);
    applyTheme(r);
  }, [theme]);

  // Listen to system pref changes only when in system mode
  React.useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia(PREFERS_DARK_QUERY);
    const handler = () => {
      const r = mq.matches ? "dark" : "light";
      setResolved(r);
      applyTheme(r);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = React.useCallback(
    (t: ThemeName) => {
      setThemeState(t);
      try {
        localStorage.setItem(storageKey, t);
      } catch {
        /* ignore */
      }
    },
    [storageKey],
  );

  const toggle = React.useCallback(() => {
    setTheme(resolved === "dark" ? "light" : "dark");
  }, [resolved, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme, toggle }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
