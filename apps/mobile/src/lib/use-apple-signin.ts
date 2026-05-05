import * as AppleAuthentication from "expo-apple-authentication";
import { Alert, Platform } from "react-native";
import { router } from "expo-router";
import { getSupabase } from "./supabase";

/**
 * Native Sign in with Apple → Supabase exchange. Apple returns an ID token
 * we hand to Supabase, which validates it and creates/updates the user.
 *
 * We require iOS 13+. On Android we fall back to web OAuth (handled by the
 * caller — show the button only on iOS).
 */
export async function signInWithApple() {
  if (Platform.OS !== "ios") {
    Alert.alert("Only on iOS", "Apple sign-in works on iOS only here. Use Google or email.");
    return;
  }
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      Alert.alert("Couldn't sign in", "Apple didn't return an identity token.");
      return;
    }

    const { error } = await getSupabase().auth.signInWithIdToken({
      provider: "apple",
      token: credential.identityToken,
    });

    if (error) {
      Alert.alert("Couldn't sign in", error.message);
      return;
    }

    router.replace("/(app)/dashboard");
  } catch (e) {
    if ((e as { code?: string }).code === "ERR_REQUEST_CANCELED") return;
    console.error(e);
    Alert.alert("Apple sign-in failed", "Please try again.");
  }
}
