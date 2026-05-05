import * as React from "react";
import { ScrollView, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth-context";
import { LunarOrb } from "@/components/lunar-orb";
import { LunarSyncCard } from "@/components/lunar-sync-card";

export default function Dashboard() {
  const { session } = useAuth();
  const greeting = greetingFromHour();
  const display =
    (session?.user.user_metadata as { full_name?: string } | null)?.full_name ??
    session?.user.email?.split("@")[0] ??
    "friend";

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} className="flex-1 px-6">
        <View className="mt-2 flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="font-body uppercase tracking-[3px] text-ink-muted text-xs">
              {greeting}
            </Text>
            <Text
              className="mt-3 font-display-bold text-ink"
              style={{ fontSize: 32, lineHeight: 36 }}
            >
              Welcome back,{"\n"}
              {display}.
            </Text>
          </View>
          <View className="ml-3">
            <LunarOrb size={84} />
          </View>
        </View>

        <View className="mt-8">
          <LunarSyncCard />
        </View>

        <View className="mt-6 gap-4">
          <DashboardTile
            eyebrow="Today"
            title="Visit the village altar"
            body="Light a candle, leave an intention."
            href="/(app)/altar"
          />
          <DashboardTile
            eyebrow="Watch"
            title="Vintage TV"
            body="A new piece is waiting in the queue."
            href="/(app)/tv"
          />
          <DashboardTile
            eyebrow="Reflect"
            title="Draw an oracle card"
            body="A three-card spread, drawn through tonight's moon."
            href="/(app)/oracle"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DashboardTile({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
}) {
  return (
    <View className="rounded-3xl border border-border bg-elevated/60 p-5">
      <Text className="font-body uppercase tracking-[2.5px] text-ink-muted text-xs">
        {eyebrow}
      </Text>
      <Text className="mt-2 font-display text-ink" style={{ fontSize: 22, lineHeight: 26 }}>
        {title}
      </Text>
      <Text className="mt-1 font-body text-ink-subtle">{body}</Text>
    </View>
  );
}

function greetingFromHour() {
  const h = new Date().getHours();
  if (h < 5) return "Late hour";
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  if (h < 21) return "Evening";
  return "Night blessings";
}
