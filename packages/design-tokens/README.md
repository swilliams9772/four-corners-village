# @four-corners/design-tokens

The single source of truth for the Four Corners design system. Web (Tailwind) and mobile (NativeWind) consume the same tokens.

## What's in here

| Module | Exports | Purpose |
| - | - | - |
| `palette.ts` | `palette` | Raw color stops (50–950) for `ink`, `parchment`, `lunar`, `air`, `fire`, `water`, `earth`. |
| `scale.ts` | `space`, `radius`, `shadow`, `blur` | Spatial system + elevation. |
| `typography.ts` | `typography` | Fraunces (display) + Geist (body), fluid type scale, optical sizing. |
| `motion.ts` | `easing`, `duration`, `motion` | `silk`, `velvet`, `ceremonial`, `spring`, `sharp` curves. |
| `themes.ts` | `darkTheme`, `lightTheme`, `themes` | Semantic resolutions. UI imports these names, not raw palette. |
| `tokens.css` | (CSS) | Web side — defines `--bg-canvas`, `--text-primary`, etc. |
| `tailwind-preset.ts` | `designTokensPreset` | Tailwind preset extending all above as classes. |

## Usage — web

```ts
// apps/web/tailwind.config.ts
import { designTokensPreset } from "@four-corners/design-tokens/tailwind";
export default { presets: [designTokensPreset], content: [...] };
```

```css
/* apps/web/src/app/globals.css */
@import "@four-corners/design-tokens/css";
@tailwind base;
@tailwind components;
@tailwind utilities;
```

```tsx
// In components
<div className="bg-canvas text-ink shadow-altar rounded-2xl">…</div>
<button className="bg-brand text-brand-foreground hover:bg-brand-hover">…</button>
<aside className="bg-air-soft text-air-foreground border border-subtle">…</aside>
```

## Usage — mobile

```ts
import { darkTheme, palette, space, typography } from "@four-corners/design-tokens";

const styles = StyleSheet.create({
  hero: {
    backgroundColor: darkTheme.bg.canvas,
    paddingHorizontal: parseInt(space.xl),
    fontFamily: typography.family.display.split(",")[0].trim(),
  },
});
```

NativeWind preset works the same as Tailwind:

```ts
// apps/mobile/tailwind.config.js
const { designTokensPreset } = require("@four-corners/design-tokens/tailwind");
module.exports = { presets: [designTokensPreset], content: [...] };
```

## Naming rules

- **Always use semantic tokens in UI code:** `bg-canvas`, `text-ink-muted`, `bg-air-soft`. Never reach for `palette.air[400]` directly.
- **Elemental tokens are for sectioning**, not decoration. East = air, South = fire, West = water, North = earth — use them when an element semantically belongs to a direction.
- **Lunar** is reserved for sacred/mystical surfaces (Altars, Oracle, lunar widgets).
- **Brand** is the primary call-to-action color in the active theme — air/gold on dark, fire/red on light, by design (the inversion creates contrast in the hero).
