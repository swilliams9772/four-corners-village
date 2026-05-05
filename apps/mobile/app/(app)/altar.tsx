import * as React from "react";
import { ScrollView, View, Text, Pressable, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Flame, Heart, Sparkles, Star, Send } from "lucide-react-native";
import { Button } from "@/components/button";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import type { Altar, AltarOffering, AltarOfferingType } from "@four-corners/api-types";
import { cn } from "@/lib/cn";

const offeringTypes: {
  id: AltarOfferingType;
  label: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  color: string;
}[] = [
  { id: "candle", label: "Candle", icon: Flame, color: "#FF5F3F" },
  { id: "prayer", label: "Prayer", icon: Sparkles, color: "#C7C3EC" },
  { id: "flower", label: "Flower", icon: Heart, color: "#FF9C7E" },
  { id: "crystal", label: "Crystal", icon: Star, color: "#5DC2DA" },
  { id: "intention", label: "Intention", icon: Send, color: "#41AE6B" },
];

export default function AltarPage() {
  const { session } = useAuth();
  const [altar, setAltar] = React.useState<Altar | null>(null);
  const [offerings, setOfferings] = React.useState<AltarOffering[]>([]);
  const [type, setType] = React.useState<AltarOfferingType>("candle");
  const [message, setMessage] = React.useState("");
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = getSupabase();
      const { data: a } = await supabase
        .from("altars")
        .select("*")
        .order("is_global", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      setAltar(a as Altar);

      if (a) {
        const { data: off } = await supabase
          .from("altar_offerings")
          .select("*")
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false })
          .limit(60);
        if (!cancelled) setOfferings((off as AltarOffering[]) ?? []);

        // Realtime subscription mirrors the web behavior.
        const channel = supabase
          .channel(`altar-mobile:${(a as Altar).id}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "altar_offerings",
              filter: `altar_id=eq.${(a as Altar).id}`,
            },
            (payload) => {
              setOfferings((prev) => [payload.new as AltarOffering, ...prev]);
            },
          )
          .subscribe();
        return () => {
          supabase.removeChannel(channel);
        };
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function placeOffering() {
    if (!altar || !session) return;
    setPending(true);
    try {
      const supabase = getSupabase();
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const { error } = await supabase.from("altar_offerings").insert({
        altar_id: altar.id,
        user_id: session.user.id,
        offering_type: type,
        message: message || null,
        expires_at: expires,
      });
      if (error) {
        Alert.alert("Couldn't place offering", error.message);
        return;
      }
      setMessage("");
    } finally {
      setPending(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 140 }}>
        <Text className="font-body uppercase tracking-[3px] text-ink-muted text-xs">
          Sacred space
        </Text>
        <Text className="mt-2 font-display-bold text-ink" style={{ fontSize: 32, lineHeight: 36 }}>
          Digital altar
        </Text>
        <Text className="mt-3 font-body text-ink-subtle leading-relaxed">
          Light a candle, leave an intention. Offerings remain for seven days.
        </Text>

        {altar && (
          <View className="mt-7 rounded-3xl border border-border bg-elevated p-5">
            <Text className="font-body uppercase tracking-[2.5px] text-ink-muted text-xs">
              Place an offering
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingTop: 12, paddingBottom: 12 }}
            >
              {offeringTypes.map((t) => {
                const Icon = t.icon;
                const active = type === t.id;
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => setType(t.id)}
                    className={cn(
                      "flex-row items-center gap-2 rounded-full border px-3.5 py-1.5",
                      active ? "border-strong bg-glass" : "border-border",
                    )}
                  >
                    <Icon size={14} color={t.color} />
                    <Text className="font-body text-ink text-sm">{t.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <TextInput
              placeholder="A word, a name, an intention…"
              placeholderTextColor="#7C7B85"
              value={message}
              onChangeText={setMessage}
              maxLength={200}
              multiline
              className="min-h-[60px] rounded-xl border border-border bg-canvas px-3 py-2 font-body text-ink"
            />
            <View className="mt-3 flex-row items-center justify-between">
              <Text className="font-mono text-ink-muted text-xs">{message.length}/200</Text>
              <Button label="Place" loading={pending} onPress={placeOffering} />
            </View>
          </View>
        )}

        <Text className="mt-9 font-body uppercase tracking-[2.5px] text-ink-muted text-xs">
          {offerings.length} active offerings
        </Text>

        <View className="mt-3 gap-3">
          {offerings.map((o) => {
            const def = offeringTypes.find((t) => t.id === o.offering_type) ?? offeringTypes[0];
            const Icon = def.icon;
            return (
              <View key={o.id} className="rounded-2xl border border-border bg-elevated p-4">
                <View className="flex-row items-center gap-2">
                  <Icon size={14} color={def.color} />
                  <Text className="font-body uppercase tracking-[2.5px] text-ink-muted text-xs">
                    {def.label}
                  </Text>
                </View>
                {o.message ? (
                  <Text className="mt-2 font-display text-ink leading-snug">{o.message}</Text>
                ) : (
                  <Text className="mt-2 font-display italic text-ink-muted">— silence —</Text>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
