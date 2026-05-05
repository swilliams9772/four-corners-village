import { View, Text } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/button";
import { LunarOrb } from "@/components/lunar-orb";

export default function Welcome() {
  return (
    <View className="flex-1 bg-canvas">
      <LinearGradient
        colors={["#1A1430", "#0B0B12", "#11101F"]}
        style={{ position: "absolute", inset: 0 }}
      />
      <SafeAreaView className="flex-1 px-7" edges={["top", "bottom"]}>
        <View className="mt-8 items-center">
          <LunarOrb size={148} />
        </View>

        <View className="mt-10">
          <Text className="font-body uppercase tracking-[3px] text-ink-muted text-xs">
            Four Corners
          </Text>
          <Text
            className="mt-3 font-display-bold text-ink leading-[0.95]"
            style={{ fontSize: 44 }}
          >
            A digital sanctuary for sacred living.
          </Text>
          <Text className="mt-5 font-body text-ink-subtle leading-relaxed text-base">
            Documentaries, practitioners, altars, oracles. Tuned to the moon.
          </Text>
        </View>

        <View className="mt-auto mb-4 gap-3">
          <Button
            label="Create your account"
            size="lg"
            onPress={() => router.push("/(auth)/signup")}
          />
          <Button
            label="I already have one"
            variant="ghost"
            size="lg"
            onPress={() => router.push("/(auth)/login")}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
