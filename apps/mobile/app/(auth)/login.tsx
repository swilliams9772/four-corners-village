import * as React from "react";
import { View, Text, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { router, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as AppleAuthentication from "expo-apple-authentication";
import { ChevronLeft } from "lucide-react-native";
import { Pressable } from "react-native";
import { Button } from "@/components/button";
import { getSupabase } from "@/lib/supabase";
import { useGoogleSignIn } from "@/lib/use-google-signin";
import { signInWithApple } from "@/lib/use-apple-signin";

export default function Login() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pending, setPending] = React.useState(false);

  async function handleSubmit() {
    setPending(true);
    try {
      const { error } = await getSupabase().auth.signInWithPassword({ email, password });
      if (error) {
        Alert.alert("Couldn't sign in", error.message);
        return;
      }
      router.replace("/(app)/dashboard");
    } finally {
      setPending(false);
    }
  }

  const { signInWithGoogle, googleReady } = useGoogleSignIn();

  return (
    <SafeAreaView className="flex-1 bg-canvas px-6" edges={["top", "bottom"]}>
      <Pressable className="mt-2 size-10 items-center justify-center" onPress={() => router.back()}>
        <ChevronLeft size={22} color="#C8C5BA" />
      </Pressable>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="mt-6">
          <Text className="font-body uppercase tracking-[3px] text-ink-muted text-xs">
            Welcome back
          </Text>
          <Text className="mt-3 font-display-bold text-ink" style={{ fontSize: 36, lineHeight: 38 }}>
            Step inside.
          </Text>
        </View>

        <View className="mt-8 gap-3">
          <Button
            label="Continue with Apple"
            variant="outline"
            size="lg"
            onPress={signInWithApple}
            disabled={Platform.OS !== "ios"}
          />
          <Button
            label="Continue with Google"
            variant="outline"
            size="lg"
            onPress={signInWithGoogle}
            disabled={!googleReady}
          />
        </View>

        <View className="my-6 flex-row items-center gap-3">
          <View className="h-px flex-1 bg-border" />
          <Text className="text-ink-muted text-xs uppercase tracking-widest">or email</Text>
          <View className="h-px flex-1 bg-border" />
        </View>

        <View className="gap-3">
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
            autoComplete="password"
            textContentType="password"
          />
        </View>

        <View className="mt-6">
          <Button
            label={pending ? "Signing in…" : "Sign in"}
            size="lg"
            loading={pending}
            disabled={!email || !password}
            onPress={handleSubmit}
          />
        </View>

        <Link href="/(auth)/signup" asChild>
          <Pressable className="mt-auto mb-2 items-center py-3">
            <Text className="font-body text-ink-subtle">
              New to the village?{" "}
              <Text className="text-ink" style={{ textDecorationLine: "underline" }}>
                Create an account
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
