import * as React from "react";
import { Canvas, Circle, Group, RadialGradient, vec, BlurMask } from "@shopify/react-native-skia";
import { calculateLunarPhase } from "@four-corners/ui-primitives";

/**
 * Native LunarOrb — Skia-based equivalent of the SVG orb on web. Renders a
 * lit cap whose width tracks the current illumination, with a soft halo. The
 * SVG version on web is hand-drawn; here we approximate the same visual
 * weight with circles so we can reuse phase math from the shared package.
 */
export function LunarOrb({ size = 160 }: { size?: number }) {
  const phase = React.useMemo(() => calculateLunarPhase(), []);
  const r = size / 2;
  const c = vec(r, r);

  // Illumination determines the visible width of the lit cap.
  const litWidth = phase.illumination;
  const waxing = phase.progress < 0.5;

  return (
    <Canvas style={{ width: size, height: size }}>
      <Group>
        {/* halo */}
        <Circle cx={r} cy={r} r={r * 0.95} color="#9D7EFF" opacity={0.18}>
          <BlurMask blur={28} style="normal" />
        </Circle>

        {/* dark base */}
        <Circle cx={r} cy={r} r={r * 0.78}>
          <RadialGradient
            c={c}
            r={r * 0.78}
            colors={["#1B1A2E", "#0B0B12"]}
          />
        </Circle>

        {/* lit cap (approximation) */}
        <Group
          transform={[
            { translateX: r - r * 0.78 + r * 0.78 * (waxing ? litWidth : 1 - litWidth) },
            { translateY: 0 },
          ]}
        >
          <Circle cx={r * 0.78} cy={r} r={r * 0.78} color="#F1E8D3" opacity={0.92} />
        </Group>

        {/* surface highlight */}
        <Circle cx={r * 0.86} cy={r * 0.84} r={r * 0.18} color="#FFFFFF" opacity={0.18}>
          <BlurMask blur={18} style="normal" />
        </Circle>
      </Group>
    </Canvas>
  );
}
