import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { supabase } from "./supabase";

/**
 * Configure foreground display behavior. We surface alerts but skip
 * sound/badge by default so push doesn't break the contemplative tone.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let cachedToken: string | null = null;

/**
 * Request push permission, fetch the Expo Push Token, and persist it on the
 * user's profile via the `push_tokens` table. Safe to call multiple times —
 * we de-dupe on the cached token.
 */
export async function registerPushToken() {
  if (!Device.isDevice) return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "4 Corners Village",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 200, 100, 200],
      lightColor: "#9D7EFF",
    });
  }

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== "granted") {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (status !== "granted") return null;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId ??
    undefined;
  const result = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined,
  );
  const token = result.data;
  if (!token) return null;
  if (cachedToken === token) return token;
  cachedToken = token;

  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) return token;

  await supabase.from("push_tokens").upsert(
    {
      user_id: user.id,
      token,
      platform: Platform.OS,
      device_name: Device.deviceName ?? null,
      revoked: false,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "token" },
  );

  return token;
}

export async function unregisterPushToken() {
  if (!cachedToken) return;
  await supabase
    .from("push_tokens")
    .update({ revoked: true })
    .eq("token", cachedToken);
  cachedToken = null;
}

/**
 * Wire push-tap deep linking — the payload may carry `{ url: "/v/lila" }`
 * or a fully-qualified universal link. Expo Router's `Linking` integration
 * picks up our scheme + universal links automatically; this hook is here
 * for explicit interception (analytics, custom routing).
 */
export function addPushResponseListener(handler: (url: string | null) => void) {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data as { url?: string };
    handler(data?.url ?? null);
  });
}
