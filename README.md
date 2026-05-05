# Four Corners — Monorepo

A turborepo + pnpm workspace housing the web app, mobile app, and shared packages.

```
.
├── apps/
│   ├── web/              # Next.js 16 + React 19 (the production app)
│   └── mobile/           # Expo Router + React Native (iOS + Android)
├── packages/
│   ├── design-tokens/    # Single source of truth for color, type, space, motion
│   ├── api-types/        # Supabase + Stripe + domain types shared web ↔ native
│   └── ui-primitives/    # Cross-platform components (web via Tailwind, native via NativeWind)
├── docs/                 # Brand, launch checklist, design directions
└── turbo.json
```

## Quick start

```bash
pnpm install
pnpm dev            # runs web + mobile in parallel
pnpm dev:web        # web only
pnpm dev:mobile     # mobile only
pnpm typecheck      # all packages
pnpm build          # all packages
```

## Packages

- **`@four-corners/design-tokens`** — colors, type scale, spacing, motion, easing, theme objects. Exported as both CSS variables (web) and TypeScript objects (native). See [packages/design-tokens/README.md](packages/design-tokens/README.md).
- **`@four-corners/api-types`** — `Database`, `Profile`, `VtvVideo`, `PractitionerSpace`, etc. Generated from Supabase schema, shared with the mobile app.
- **`@four-corners/ui-primitives`** — small set of components that work on both surfaces (Button, Card, Heading, ElementalChip).

## Apps

- **`@four-corners/web`** — see [apps/web/README.md](apps/web/README.md) for full documentation. Production at `https://fourcorners.village`.
- **`@four-corners/mobile`** — see [apps/mobile/README.md](apps/mobile/README.md). Distributed via App Store + Google Play.

## Documents

- [docs/brand-and-domain.md](docs/brand-and-domain.md) — naming, domain, trademark notes
- [docs/design-directions.md](docs/design-directions.md) — three visual directions to choose from
- [docs/launch-checklist.md](docs/launch-checklist.md) — production launch from zero
- [docs/mobile-strategy.md](docs/mobile-strategy.md) — Expo, Reader-app rule, App Store path
