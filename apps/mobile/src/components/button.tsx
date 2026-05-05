import * as React from "react";
import { Pressable, Text, View, ActivityIndicator } from "react-native";
import * as Haptics from "expo-haptics";
import { cn } from "@/lib/cn";

type Variant = "brand" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  brand: "bg-brand active:opacity-80",
  ghost: "bg-transparent active:bg-glass",
  outline: "border border-strong active:bg-glass",
};

const variantLabel: Record<Variant, string> = {
  brand: "text-brand-foreground",
  ghost: "text-ink",
  outline: "text-ink",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3.5 rounded-xl",
  md: "h-11 px-5 rounded-2xl",
  lg: "h-14 px-6 rounded-2xl",
};

const sizeLabel: Record<Size, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export function Button({
  label,
  onPress,
  variant = "brand",
  size = "md",
  loading,
  disabled,
  haptic = true,
  leading,
  trailing,
  className,
}: {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  haptic?: boolean;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
}) {
  function handlePress() {
    if (disabled || loading) return;
    if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress?.();
  }
  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      className={cn(
        "flex-row items-center justify-center gap-2",
        variantClasses[variant],
        sizeClasses[size],
        (disabled || loading) && "opacity-50",
        className,
      )}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator size="small" color="currentColor" />
      ) : (
        leading && <View>{leading}</View>
      )}
      <Text
        className={cn(
          "font-body-medium tracking-tight",
          variantLabel[variant],
          sizeLabel[size],
        )}
      >
        {label}
      </Text>
      {!loading && trailing && <View>{trailing}</View>}
    </Pressable>
  );
}
