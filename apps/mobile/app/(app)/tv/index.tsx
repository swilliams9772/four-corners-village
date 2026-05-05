import * as React from "react";
import { ScrollView, View, Text, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import { Search } from "lucide-react-native";
import { getSupabase } from "@/lib/supabase";
import type { Video, VideoCategory } from "@four-corners/api-types";

export default function TvBrowse() {
  const [categories, setCategories] = React.useState<VideoCategory[]>([]);
  const [videosByCategory, setVideosByCategory] = React.useState<
    Record<string, Video[]>
  >({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = getSupabase();
      const { data: cats } = await supabase
        .from("video_categories")
        .select("*")
        .order("display_order");
      const { data: vids } = await supabase
        .from("videos")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(40);

      if (cancelled) return;
      setCategories((cats as VideoCategory[]) ?? []);

      const grouped: Record<string, Video[]> = {};
      for (const v of (vids as Video[]) ?? []) {
        const k = v.category_id ?? "uncategorized";
        (grouped[k] ??= []).push(v);
      }
      setVideosByCategory(grouped);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top"]}>
      <View className="flex-row items-center justify-between px-6 pt-2 pb-4">
        <View>
          <Text className="font-body uppercase tracking-[3px] text-ink-muted text-xs">
            Vintage TV
          </Text>
          <Text className="mt-1 font-display-bold text-ink" style={{ fontSize: 28 }}>
            Cinema for the soul.
          </Text>
        </View>
        <Pressable
          className="size-11 items-center justify-center rounded-full border border-border bg-elevated"
          onPress={() => router.push("/(app)/tv/search")}
          accessibilityRole="search"
        >
          <Search color="#C8C5BA" size={18} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        {loading ? (
          <Text className="px-6 text-ink-muted">Loading…</Text>
        ) : (
          categories.map((cat) => {
            const list = videosByCategory[cat.id] ?? [];
            if (list.length === 0) return null;
            return <Row key={cat.id} title={cat.name} videos={list} />;
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ title, videos }: { title: string; videos: Video[] }) {
  return (
    <View className="mt-2">
      <Text className="px-6 mb-3 font-display text-ink" style={{ fontSize: 18 }}>
        {title}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
      >
        {videos.map((v) => (
          <Link key={v.id} href={`/(app)/tv/${v.slug}`} asChild>
            <Pressable className="w-40">
              <View
                className="aspect-[2/3] overflow-hidden rounded-2xl border border-border bg-elevated"
              >
                {v.poster_url ? (
                  <Image source={{ uri: v.poster_url }} style={{ width: "100%", height: "100%" }} />
                ) : (
                  <View className="size-full items-center justify-center">
                    <Text className="text-ink-muted">No poster</Text>
                  </View>
                )}
              </View>
              <Text
                className="mt-2 font-display text-ink"
                numberOfLines={1}
                style={{ fontSize: 14 }}
              >
                {v.title}
              </Text>
            </Pressable>
          </Link>
        ))}
      </ScrollView>
    </View>
  );
}
