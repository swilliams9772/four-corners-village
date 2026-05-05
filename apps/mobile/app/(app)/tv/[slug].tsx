import * as React from "react";
import { View, Text, ScrollView, Image, ActivityIndicator, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { ChevronLeft, Play, Lock } from "lucide-react-native";
import { Pressable } from "react-native";
import { getSupabase } from "@/lib/supabase";
import { Button } from "@/components/button";
import { HlsPlayer } from "@/components/hls-player";
import type { Video } from "@four-corners/api-types";
import { env } from "@/lib/env";
import { api, useEntitlements } from "@/lib/api";

export default function TitlePage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [video, setVideo] = React.useState<Video | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [playing, setPlaying] = React.useState(false);
  const [signedUrl, setSignedUrl] = React.useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = React.useState(false);
  const { entitlements, refresh: refreshEntitlements } = useEntitlements();
  const tvActive = entitlements?.tv.active ?? false;

  React.useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      const supabase = getSupabase();
      const { data } = await supabase
        .from("videos")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (cancelled) return;
      setVideo((data as Video) ?? null);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function startPlayback() {
    if (!video?.stream_uid) return;
    if (!tvActive) {
      // Reader-app: subscriptions are sold on the web; we deep-link out so
      // the App Store / Play review treats this as account management, not
      // an in-app purchase bypass.
      const url = entitlements?.checkout.url ?? `${env.app.url}/dashboard/account/billing`;
      await Linking.openURL(url);
      return;
    }
    setTokenLoading(true);
    try {
      const { manifest } = await api.signTvManifest(video.stream_uid);
      setSignedUrl(manifest);
      setPlaying(true);
    } catch (e) {
      console.error(e);
    } finally {
      setTokenLoading(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator color="#FBC02C" />
      </View>
    );
  }
  if (!video) {
    return (
      <SafeAreaView className="flex-1 bg-canvas px-6">
        <Text className="mt-12 font-display text-ink text-2xl">Title not found.</Text>
        <Pressable className="mt-4" onPress={() => router.back()}>
          <Text className="text-air">← Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (playing && signedUrl) {
    return (
      <HlsPlayer
        source={signedUrl}
        title={video.title}
        onClose={() => {
          setPlaying(false);
          void refreshEntitlements();
        }}
      />
    );
  }

  return (
    <View className="flex-1 bg-canvas">
      <View className="aspect-[16/9] w-full">
        {video.backdrop_url || video.poster_url ? (
          <Image
            source={{ uri: video.backdrop_url ?? video.poster_url ?? "" }}
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <View className="size-full bg-elevated" />
        )}
        <View
          className="absolute inset-x-0 bottom-0 h-1/2"
          style={{ backgroundColor: "rgba(11,11,18,0.9)" }}
        />
      </View>

      <SafeAreaView className="flex-1 -mt-8" edges={["bottom"]}>
        <Pressable
          className="absolute left-4 top-12 size-10 items-center justify-center rounded-full bg-canvas/70"
          onPress={() => router.back()}
        >
          <ChevronLeft color="#F1E8D3" size={22} />
        </Pressable>

        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
          <Text className="font-display-bold text-ink" style={{ fontSize: 32, lineHeight: 36 }}>
            {video.title}
          </Text>
          {video.synopsis && (
            <Text className="mt-4 font-body text-ink-subtle leading-relaxed">
              {video.synopsis}
            </Text>
          )}

          <View className="mt-8">
            {tvActive ? (
              <Button
                label={tokenLoading ? "Preparing…" : "Play"}
                size="lg"
                loading={tokenLoading}
                leading={<Play color="#0B0B12" size={18} fill="#0B0B12" />}
                onPress={startPlayback}
              />
            ) : (
              <View className="gap-3">
                <View className="flex-row items-center gap-2">
                  <Lock color="#FBC02C" size={14} />
                  <Text className="font-body text-air uppercase tracking-widest text-xs">
                    Vintage TV subscription required
                  </Text>
                </View>
                <Text className="font-body text-ink-subtle text-sm leading-relaxed">
                  Subscriptions are managed on the web — $5.55 / month or $55.55 / year.
                  After subscribing, return here to play.
                </Text>
                <Button
                  label="Subscribe on web"
                  size="lg"
                  variant="brand"
                  onPress={() =>
                    Linking.openURL(
                      entitlements?.checkout.url ?? `${env.app.url}/dashboard/account/billing`,
                    )
                  }
                />
                <Pressable className="self-start" onPress={() => void refreshEntitlements()}>
                  <Text className="font-body text-air text-sm">I just subscribed — refresh</Text>
                </Pressable>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
