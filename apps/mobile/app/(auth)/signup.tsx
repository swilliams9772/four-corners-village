import * as React from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { router, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { Button } from "@/components/button";
import { getSupabase } from "@/lib/supabase";

export default function Signup() {
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  async function handleSubmit() {
    setPending(true);
    try {
      const { error } = await getSupabase().auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) {
        Alert.alert("Couldn't create account", error.message);
        return;
      }
      setSent(true);
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <SafeAreaView className="flex-1 bg-canvas px-6">
        <View className="flex-1 items-center justify-center">
          <Text className="font-display-bold text-ink" style={{ fontSize: 28 }}>
            Check your email.
          </Text>
          <Text className="mt-3 text-center font-body text-ink-subtle leading-relaxed">
            We sent a confirmation link to {email}.{"\n"}Open it on this device to finish.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-canvas px-6" edges={["top", "bottom"]}>
      <Pressable
        className="mt-2 size-10 items-center justify-center"
        onPress={() => router.back()}
      >
        <ChevronLeft size={22} color="#C8C5BA" />
      </Pressable>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="mt-6">
          <Text className="font-body uppercase tracking-[3px] text-ink-muted text-xs">
            New here
          </Text>
          <Text
            className="mt-3 font-display-bold text-ink"
            style={{ fontSize: 36, lineHeight: 38 }}
          >
            Plant your seed.
          </Text>
        </View>

        <View className="mt-8 gap-3">
          <Field
            label="Full name"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
          />
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password-new"
            textContentType="newPassword"
          />
        </View>

        <View className="mt-6">
          <Button
            label={pending ? "Preparing your space…" : "Create account"}
            size="lg"
            loading={pending}
            disabled={!email || !password || !fullName}
            onPress={handleSubmit}
          />
        </View>

        <Link href="/(auth)/login" asChild>
          <Pressable className="mt-auto mb-2 items-center py-3">
            <Text className="font-body text-ink-subtle">
              Have an account?{" "}
              <Text className="text-ink" style={{ textDecorationLine: "underline" }}>
                Sign in
              </Text>
            </Text>
          </Pressable>
        </Link>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  ...props
}: React.ComponentProps<typeof TextInput> & { label: string }) {
  return (
    <View>
      <Text className="mb-2 font-body-medium text-ink-subtle text-sm">{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor="#7C7B85"
        className="h-12 rounded-2xl border border-border bg-elevated px-4 font-body text-ink text-base"
      />
    </View>
  );
}
