import * as React from "react";
import { ScrollView, View, Text, Pressable, Alert, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Linking from "expo-linking";
import { Button } from "@/components/button";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme";
import { env } from "@/lib/env";

export default function Account() {
  const { session, signOut } = useAuth();
  const { override, setOverride } = useTheme();

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 140 }}>
        <Text className="font-body uppercase tracking-[3px] text-ink-muted text-xs">Account</Text>
        <Text
          className="mt-2 font-display-bold text-ink"
          style={{ fontSize: 32, lineHeight: 36 }}
        >
          You
        </Text>
        <Text className="mt-3 font-mono text-ink-muted text-sm">{session?.user.email}</Text>

        <Section title="Appearance">
          <Row
            label="Use system theme"
            value={override === "system"}
            onValueChange={(v) => setOverride(v ? "system" : "dark")}
          />
          {override !== "system" && (
            <Row
              label="Dark mode"
              value={override === "dark"}
              onValueChange={(v) => setOverride(v ? "dark" : "light")}
            />
          )}
        </Section>

        <Section title="Membership">
          <LinkRow
            label="Manage subscription"
            description="Vintage TV billing, plan, payment method"
            onPress={() => Linking.openURL(`${env.app.url}/account/billing`)}
          />
          <LinkRow
            label="Become a practitioner"
            description="Lease a sub-space inside the village"
            onPress={() => Linking.openURL(`${env.app.url}/practitioners/apply`)}
          />
        </Section>

        <Section title="Support">
          <LinkRow
            label="Privacy policy"
            onPress={() => Linking.openURL(`${env.app.url}/legal/privacy`)}
          />
          <LinkRow
            label="Terms of service"
            onPress={() => Linking.openURL(`${env.app.url}/legal/terms`)}
          />
          <LinkRow
            label="Contact us"
            onPress={() => Linking.openURL("mailto:hello@fourcorners.village")}
          />
        </Section>

        <View className="mt-8">
          <Button
            label="Sign out"
            variant="outline"
            size="lg"
            onPress={() => {
              Alert.alert("Sign out?", "You can sign back in any time.", [
                { text: "Cancel", style: "cancel" },
                { text: "Sign out", style: "destructive", onPress: signOut },
              ]);
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mt-7">
      <Text className="mb-3 font-body uppercase tracking-[2.5px] text-ink-muted text-xs">
        {title}
      </Text>
      <View className="overflow-hidden rounded-2xl border border-border bg-elevated">{children}</View>
    </View>
  );
}

function Row({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View className="flex-row items-center justify-between border-b border-border px-4 py-3.5 last:border-b-0">
      <Text className="font-body text-ink">{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

function LinkRow({
  label,
  description,
  onPress,
}: {
  label: string;
  description?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "rgba(255,255,255,0.04)" }}
      className="border-b border-border px-4 py-3.5 last:border-b-0"
    >
      <Text className="font-body text-ink">{label}</Text>
      {description && (
        <Text className="mt-0.5 font-body text-ink-muted text-xs">{description}</Text>
      )}
    </Pressable>
  );
}
