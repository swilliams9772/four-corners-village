import * as React from "react";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Alert } from "react-native";
import { router } from "expo-router";
import { getSupabase } from "./supabase";
import { env } from "./env";

WebBrowser.maybeCompleteAuthSession();

/**
 * Google sign-in via expo-auth-session. We request the Google ID token, then
 * hand it to Supabase. Supabase verifies and provisions / authenticates.
 *
 * Setup:
 *   1. In Google Cloud Console create OAuth client IDs:
 *      - Web → set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
 *      - iOS → set EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
 *   2. Add the iOS client's URL scheme to app.json's `ios.infoPlist.CFBundleURLTypes`
 *      (Expo handles this via `expo-auth-session` plugin during prebuild).
 */
export function useGoogleSignIn() {
  const redirectUri = AuthSession.makeRedirectUri({ scheme: "fourcorners" });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: env.google.iosClientId || env.google.webClientId,
      iosClientId: env.google.iosClientId,
      scopes: ["openid", "profile", "email"],
      redirectUri,
      responseType: "id_token",
    },
    {
      authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenEndpoint: "https://oauth2.googleapis.com/token",
    },
  );

  React.useEffect(() => {
    async function exchange() {
      if (response?.type === "success") {
        const idToken =
          (response.params as Record<string, string | undefined>).id_token ??
          (response.authentication as { idToken?: string } | null)?.idToken;
        if (!idToken) {
          Alert.alert("Couldn't sign in", "Google didn't return an ID token.");
          return;
        }
        const { error } = await getSupabase().auth.signInWithIdToken({
          provider: "google",
          token: idToken,
        });
        if (error) {
          Alert.alert("Couldn't sign in", error.message);
          return;
        }
        router.replace("/(app)/dashboard");
      } else if (response?.type === "error") {
        Alert.alert("Google sign-in failed", "Please try again.");
      }
    }
    exchange();
  }, [response]);

  return {
    googleReady: !!request,
    signInWithGoogle: () => promptAsync(),
  };
}
