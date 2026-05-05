import * as React from "react";
import { View, Text } from "react-native";
import { calculateLunarPhase } from "@four-corners/ui-primitives";

/**
 * LunarSyncCard (mobile) — mirrors the web component. Shows the current
 * lunar phase, illumination, days until next phase, and traditional
 * guidance, in a soft cosmic gradient card.
 */
export function LunarSyncCard() {
  const [phase, setPhase] = React.useState(() => calculateLunarPhase());
  React.useEffect(() => {
    const id = setInterval(() => setPhase(calculateLunarPhase()), 60_000);
    return () => clearInterval(id);
  }, []);

  const illuminationPct = Math.round(phase.illumination * 100);
  const formatted = phase.name.replace(/-/g, " ");

  return (
    <View
      className="overflow-hidden rounded-3xl border border-border bg-elevated p-5"
      style={{ backgroundColor: "rgba(157,126,255,0.10)" }}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="font-body uppercase tracking-[3px] text-ink-muted text-xs">
            Lunar sync
          </Text>
          <Text
            className="mt-2 font-display text-ink capitalize"
            style={{ fontSize: 24, lineHeight: 28 }}
          >
            {phase.glyph}  {formatted}
          </Text>
          <Text className="mt-1 font-mono text-ink-muted text-xs">
            {illuminationPct}% illuminated · {phase.daysUntilNext}d until {phase.nextPhase.replace(/-/g, " ")}
          </Text>
        </View>
      </View>

      <Text className="mt-4 font-body text-ink-subtle leading-relaxed">{phase.guidance}</Text>

      <View className="mt-5 h-1 w-full overflow-hidden rounded-full bg-glass">
        <View
          className="h-full rounded-full bg-lunar"
          style={{ width: `${illuminationPct}%` }}
        />
      </View>
    </View>
  );
}
