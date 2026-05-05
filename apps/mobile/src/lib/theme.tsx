import * as React from "react";
import { useColorScheme } from "react-native";
import { darkTheme, lightTheme, type Theme } from "@four-corners/design-tokens";

type ThemeName = "dark" | "light";
type ThemeContext = {
  scheme: ThemeName;
  theme: Theme;
  override: ThemeName | "system";
  setOverride: (s: ThemeName | "system") => void;
};

const Ctx = React.createContext<ThemeContext | null>(null);

/**
 * ThemeProvider — mirrors the web's ThemeProvider, keyed off the system
 * preference unless the user explicitly overrides. The tokens themselves are
 * imported from the shared package, so web + mobile stay 1:1 in semantics.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [override, setOverride] = React.useState<ThemeName | "system">("system");

  const scheme: ThemeName =
    override === "system" ? (system === "light" ? "light" : "dark") : override;
  const theme = scheme === "light" ? lightTheme : darkTheme;

  return (
    <Ctx.Provider value={{ scheme, theme, override, setOverride }}>{children}</Ctx.Provider>
  );
}

export function useTheme(): ThemeContext {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
