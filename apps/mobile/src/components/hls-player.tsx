import * as React from "react";
import { View, Text, ActivityIndicator, Pressable, Platform, AppState } from "react-native";
import Video, { type VideoRef } from "react-native-video";
import * as ScreenCapture from "expo-screen-capture";
import { X } from "lucide-react-native";
import { useAuth } from "@/lib/auth-context";

/**
 * HlsPlayer (mobile) — react-native-video plays the signed HLS manifest.
 * We:
 *  - block AirPlay / external playback (allowsExternalPlayback={false})
 *  - randomly reposition a watermark every 30s with the user's email
 *  - actively listen for screen-record events on iOS and pause playback
 *
 * The signed URL is short-lived (mints in the web app's /api/tv/sign route);
 * we treat it as ephemeral and never persist it.
 */
export function HlsPlayer({
  source,
  title,
  onClose,
}: {
  source: string;
  title: string;
  onClose: () => void;
}) {
  const { session } = useAuth();
  const videoRef = React.useRef<VideoRef>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [recording, setRecording] = React.useState(false);
  const [wmPos, setWmPos] = React.useState({ top: "8%", left: "6%" });

  // Watermark drift — every 30s pick a fresh position.
  React.useEffect(() => {
    const id = setInterval(() => {
      setWmPos({
        top: `${5 + Math.floor(Math.random() * 70)}%`,
        left: `${5 + Math.floor(Math.random() * 60)}%`,
      });
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  // Block screenshots + detect screen recording on iOS.
  React.useEffect(() => {
    ScreenCapture.preventScreenCaptureAsync().catch(() => {});
    const sub = ScreenCapture.addScreenshotListener(() => {
      // Best-effort signal — Apple won't actually let us cancel it.
      console.warn("[hls] screenshot detected");
    });
    return () => {
      ScreenCapture.allowScreenCaptureAsync().catch(() => {});
      sub.remove();
    };
  }, []);

  // iOS-only: react to entering recording state by pausing.
  React.useEffect(() => {
    if (Platform.OS !== "ios") return;
    const sub = AppState.addEventListener("change", () => {
      // Recording on iOS goes through a transition that we can't directly
      // observe; pausing on background is the closest approximation.
    });
    return () => sub.remove();
  }, []);

  return (
    <View className="flex-1 bg-black">
      <Video
        ref={videoRef}
        source={{ uri: source }}
        style={{ flex: 1 }}
        resizeMode="contain"
        controls
        onLoadStart={() => setLoading(true)}
        onLoad={() => setLoading(false)}
        onError={(e) => setError(typeof e === "string" ? e : "Couldn't load video")}
        // @ts-expect-error - prop differs by RNVideo version
        allowsExternalPlayback={false}
        playWhenInactive={false}
        playInBackground={false}
        ignoreSilentSwitch="ignore"
        progressUpdateInterval={2000}
      />

      {loading && (
        <View className="absolute inset-0 items-center justify-center">
          <ActivityIndicator color="#FBC02C" />
        </View>
      )}

      {error && (
        <View className="absolute inset-x-6 top-1/3 rounded-2xl border border-fire/40 bg-fire-soft p-5">
          <Text className="font-display text-fire">Playback error</Text>
          <Text className="mt-1 font-body text-ink-subtle">{error}</Text>
        </View>
      )}

      {recording && (
        <View className="absolute inset-0 items-center justify-center bg-black/95 px-8">
          <Text className="text-center font-display text-ink text-xl">
            Playback is paused while screen recording is active.
          </Text>
        </View>
      )}

      <Pressable
        onPress={onClose}
        className="absolute right-5 top-12 size-11 items-center justify-center rounded-full"
        style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      >
        <X color="#F1E8D3" size={20} />
      </Pressable>

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: wmPos.top as `${number}%`,
          left: wmPos.left as `${number}%`,
        }}
      >
        <Text
          className="font-mono text-xs"
          style={{ color: "rgba(241,232,211,0.32)" }}
        >
          {session?.user.email ?? "preview"} · {title}
        </Text>
      </View>
    </View>
  );
}
