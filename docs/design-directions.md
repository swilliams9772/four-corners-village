# Visual Design Directions

Three coherent directions to choose from. Each is internally consistent — pick **one** before code copy is finalized in Phase 2.

The implementation in code currently leans toward **Direction 2 (Dusk Cathedral)** but the tokens support all three with config swaps.

---

## Direction 1 — Liminal Field

**Mood:** dawn light through morning fog. Soft, breathing, healing.

**Reference vibes:** Calm app, Othership, Apple Vision Pro UI, Casper.

**Palette:**
- Canvas: warm parchment (`#FBF8F2`), light-mode by default
- Accent: muted coral / sunrise pink, very desaturated
- Type: Cormorant Garamond display + Inter body
- Motion: very slow `silk` curves, breathing animations on every primary surface

**When to pick:** the app should feel daytime, restorative, mass-market spa-like. Best for member retention and the sleep / meditation use cases.

---

## Direction 2 — Dusk Cathedral *(implemented in tokens)*

**Mood:** twilight inside an old observatory. Deep cosmic ink + golden lantern + lunar silver. Sacred but modern.

**Reference vibes:** Mubi, Arc Browser dark mode, Co-Star, Apple TV+, Linear's marketing site.

**Palette:**
- Canvas: deep cosmic ink (`#08081A`), dark-mode default with light optional
- Accent: solar amber (`--air`) for primary CTA, lunar lavender for sacred surfaces, ember coral for warnings
- Type: **Fraunces** (variable, opsz axis) + **Geist Sans**. Display sizes use `opsz` 96-144 for stone-cut feel.
- Motion: `velvet` for UI, `ceremonial` for hero reveals, `spring` for celebration micro-interactions

**Why this default:** matches the Vintage TV cinema product, the spiritual / mystical brand direction, and works equally well for high-contrast accessibility. The four elemental hues (Air/Fire/Water/Earth) read clearly against the ink canvas.

---

## Direction 3 — Modern Earth

**Mood:** Patagonia x Apple Watch. Crafted, grounded, premium-outdoor.

**Reference vibes:** Aman Resorts, Hodinkee, Aesop, the new Headspace.

**Palette:**
- Canvas: bone (`#F4EFE2`) light + clay (`#3F321B`) dark dual
- Accent: forest emerald primary, sand secondary, oxblood warning
- Type: GT Sectra display + Söhne body (nearest free pairings: Fraunces + Inter Tight)
- Motion: minimal — only opacity + slight Y-translate

**When to pick:** the brand direction wants to feel grown-up, materially crafted, away-from-screens. Trades some of the mystical drama for elegance.

---

## Token-system implications

The same tokens package supports all three directions because semantic tokens (`bg-canvas`, `text-ink`, `brand`) resolve from theme variables. Switching direction = swapping which palette stops the semantic tokens point to inside [`themes.ts`](packages/design-tokens/src/themes.ts).

We picked Direction 2 as the default in the current implementation. If we want to ship 1 or 3 instead, the change is one file: re-map `darkTheme`/`lightTheme` to the new palette stops.

---

## Mood-board pull (link out)

These are reference points the Figma file should pull from when establishing a final look. Keep three boards inside Figma:

- **Cinema & motion**: Mubi, Apple TV+, Arc, Linear marketing
- **Sacred / mystical UI**: Co-Star, Sanctuary app, Pattern, Stellar
- **Wellness / breathing**: Calm, Othership, Headspace, Reflectly

The implementation already includes the **shadow-altar** elevation and the **aurora drift** ambient layer in [globals.css](apps/web/src/app/globals.css) — these are the load-bearing pieces of the Dusk Cathedral feel.

---

## Decision log

- 2026-05-05 — chose Direction 2 (Dusk Cathedral) as the implemented default. Tokens support pivoting later.
