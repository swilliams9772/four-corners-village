import * as React from "react";
import { ScrollView, View, Text, TextInput, Image, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import { ChevronLeft, Search } from "lucide-react-native";
import { getSupabase } from "@/lib/supabase";
import type { Video } from "@four-corners/api-types";

export default function TvSearch() {
  const [q, setQ] = React.useState("");
  const [results, setResults] = React.useState<Video[]>([]);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    const id = setTimeout(async () => {
      setPending(true);
      const supabase = getSupabase();
      const { data } = await supabase
        .from("videos")
        .select("*")
        .eq("is_published", true)
        .ilike("title", `%${q}%`)
        .limit(40);
      setResults((data as Video[]) ?? []);
      setPending(false);
    }, 220);
    return () => clearTimeout(id);
  }, [q]);

  return (
    <SafeAreaView className="flex-1 bg-canvas px-6" edges={["top"]}>
      <View className="flex-row items-center gap-3">
        <Pressable
          className="size-10 items-center justify-center rounded-full border border-border bg-elevated"
          onPress={() => router.back()}
        >
          <ChevronLeft color="#C8C5BA" size={20} />
        </Pressable>
        <View className="flex-1 flex-row items-center gap-2 rounded-2xl border border-border bg-elevated px-3.5">
          <Search color="#7C7B85" size={16} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search Vintage TV"
            placeholderTextColor="#7C7B85"
            autoFocus
            className="h-11 flex-1 font-body text-ink text-base"
          />
        </View>
      </View>

      {pending ? (
        <ActivityIndicator className="mt-12" color="#FBC02C" />
      ) : (
        <ScrollView contentContainerStyle={{ paddingTop: 16, paddingBottom: 120 }}>
          {results.map((v) => (
            <Link key={v.id} href={`/(app)/tv/${v.slug}`} asChild>
              <Pressable className="mb-3 flex-row gap-3 rounded-2xl border border-border bg-elevated p-3">
                <View className="aspect-[2/3] w-20 overflow-hidden rounded-xl bg-canvas">
                  {v.poster_url && (
                    <Image source={{ uri: v.poster_url }} style={{ width: "100%", height: "100%" }} />
                  )}
                </View>
                <View className="flex-1 justify-center">
                  <Text className="font-display text-ink" style={{ fontSize: 16 }}>
                    {v.title}
                  </Text>
                  {v.synopsis && (
                    <Text className="mt-1 font-body text-ink-muted text-xs" numberOfLines={2}>
                      {v.synopsis}
                    </Text>
                  )}
                </View>
              </Pressable>
            </Link>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
