import * as React from "react";
import { ScrollView, View, Text, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Sparkles, RotateCcw } from "lucide-react-native";
import { Button } from "@/components/button";
import { api } from "@/lib/api";
import { LunarOrb } from "@/components/lunar-orb";

type DrawnCard = {
  card: { name: string; upright: string[]; reversed: string[] };
  reversed: boolean;
  position: string;
};

export default function OraclePage() {
  const [question, setQuestion] = React.useState("");
  const [reading, setReading] = React.useState<{ cards: DrawnCard[]; interpretation: string } | null>(
    null,
  );
  const [pending, setPending] = React.useState(false);

  async function draw() {
    setPending(true);
    try {
      const json = await api.drawOracle({
        question: question || undefined,
        spread: "three",
      });
      setReading(json as { cards: DrawnCard[]; interpretation: string });
    } catch (e) {
      Alert.alert("Couldn't draw cards", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setPending(false);
    }
  }

  if (reading) {
    return (
      <SafeAreaView className="flex-1 bg-canvas" edges={["top"]}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 140 }}>
          <View className="gap-3">
            {reading.cards.map((c, i) => (
              <View
                key={i}
                className="rounded-3xl border border-strong p-5"
                style={{ backgroundColor: "rgba(157,126,255,0.10)" }}
              >
                <Text className="font-body uppercase tracking-[3px] text-ink-muted text-xs">
                  {c.position}
                </Text>
                <Text className="mt-2 font-display text-ink" style={{ fontSize: 22 }}>
                  {c.card.name}
                  {c.reversed && (
                    <Text className="font-mono text-lunar"> reversed</Text>
                  )}
                </Text>
                <Text className="mt-2 font-body text-ink-subtle">
                  {(c.reversed ? c.card.reversed : c.card.upright).join(" · ")}
                </Text>
              </View>
            ))}
          </View>

          <View
            className="mt-6 rounded-3xl border border-lunar p-5"
            style={{ backgroundColor: "rgba(199,195,236,0.10)" }}
          >
            <Text className="font-body uppercase tracking-[3px] text-lunar text-xs">
              Interpretation
            </Text>
            <Text className="mt-3 font-display text-ink leading-relaxed" style={{ fontSize: 16 }}>
              {reading.interpretation}
            </Text>
          </View>

          <View className="mt-7">
            <Button
              label="Draw another"
              variant="outline"
              size="lg"
              leading={<RotateCcw color="#F1E8D3" size={18} />}
              onPress={() => {
                setReading(null);
                setQuestion("");
              }}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 140 }}>
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="font-body uppercase tracking-[3px] text-ink-muted text-xs">
              Reading
            </Text>
            <Text
              className="mt-2 font-display-bold text-ink"
              style={{ fontSize: 32, lineHeight: 36 }}
            >
              The oracle
            </Text>
          </View>
          <LunarOrb size={72} />
        </View>
        <Text className="mt-3 font-body text-ink-subtle leading-relaxed">
          A three-card spread, drawn through tonight's moon.
        </Text>

        <View className="mt-8">
          <Text className="font-body-medium text-ink-subtle text-sm mb-2">
            Your question (optional)
          </Text>
          <TextInput
            value={question}
            onChangeText={setQuestion}
            placeholder="What does my heart most need to know today?"
            placeholderTextColor="#7C7B85"
            multiline
            className="min-h-[110px] rounded-2xl border border-border bg-elevated px-4 py-3 font-body text-ink text-base"
          />
        </View>

        <View className="mt-6">
          <Button
            label={pending ? "Drawing the cards…" : "Draw three cards"}
            size="lg"
            loading={pending}
            leading={<Sparkles color="#0B0B12" size={18} />}
            onPress={draw}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
