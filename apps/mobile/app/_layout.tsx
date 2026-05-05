import "../global.css";
import "react-native-gesture-handler";
import * as React from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  useFonts,
  Fraunces_400Regular,
  Fraunces_500Medium,
  Fraunces_600SemiBold,
} from "@expo-google-fonts/fraunces";
import { Geist_400Regular, Geist_500Medium, Geist_600SemiBold } from "@expo-google-fonts/geist";
import { ThemeProvider, useTheme } from "@/lib/theme";
import { AuthProvider } from "@/lib/auth-context";
import { AnalyticsProvider } from "@/lib/analytics";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fraunces_400Regular,
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
  });

  React.useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AnalyticsProvider>
          <ThemeProvider>
            <AuthProvider>
              <Shell />
            </AuthProvider>
          </ThemeProvider>
        </AnalyticsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function Shell() {
  const { scheme, theme } = useTheme();
  return (
    <>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.bg.canvas },
          animation: "fade",
        }}
      />
    </>
  );
}
