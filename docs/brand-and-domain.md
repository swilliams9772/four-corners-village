# Brand & Domain — Shortlist

A working brand identity for the platform. Pick one before code copy is finalized in Phase 2.

---

## Brand-name candidates

The vision the client described is "spiritual WeWork" + "Netflix for spiritual documentaries (Vintage TV)" + "school where practitioners host courses" — a digital village. Names that fit:

| # | Name | Tone | Best for |
| - | - | - | - |
| 1 | **Four Corners Village** | Literal, on-brief | Carries forward the existing identity. Domain availability is the constraint. |
| 2 | **Four Corners** | Punchy, ownable | Strongest brand mark; needs disambiguation in SEO. |
| 3 | **The Village** | Warm, community-forward | Risks being too generic; works only with the right TLD. |
| 4 | **Cardinal** (as in cardinal directions) | Modern, single word | App-store friendly; has a religious dual meaning that fits. |
| 5 | **Compass Sanctuary** | Evocative, spiritual | Pairs well with the Sanctuary tier name. |
| 6 | **Solstice** | Astronomical, premium | Already used by some; check trademark. |
| 7 | **Kindred Village** | Community-first | Slightly softer; very searchable. |
| 8 | **Aether** | Mystical, short | Must check availability — heavily contested. |

**Recommendation:** keep **Four Corners Village** as the long-form brand and **Four Corners** as the wordmark / app name. It's already wired through the entire codebase (see [package.json `name`](app-next/package.json) → `four-corners-village`) and the four-directions metaphor is the visual core of the design.

---

## Domain candidates (in priority order)

Check availability via [Cloudflare Registrar](https://dash.cloudflare.com/?to=/:account/domains/register) (or Porkbun / Namecheap as a backup). Cloudflare sells at-cost wholesale pricing.

| Tier | Domain | Why |
| - | - | - |
| **Primary picks** | `fourcorners.village` | The README placeholder; matches brand exactly; `.village` is descriptive. |
|  | `fourcorners.app` | App-first positioning; clean for App Store / Play Store deeplinks. |
|  | `fourcorners.co` | Short, memorable, good for email. |
| **If unavailable** | `four-corners.app` | Hyphenated fallback. |
|  | `fourcornersvillage.com` | Most universal TLD; longer but unambiguous. |
|  | `4corners.village` | Numeric variant. |
| **For sub-brands** | `vintage.tv` | If we want a standalone domain for the Vintage TV product. |
|  | `village.app` | Aspirational; almost certainly taken. |

**Recommendation:** acquire **two** domains:

1. **`fourcorners.village`** — primary, redirects to www; this is the canonical address.
2. **`fourcornersvillage.com`** — defensive purchase, 301 redirects to `.village`.

Total cost: ~$25 + ~$10/yr ongoing.

---

## Logo & wordmark direction

Defer to Figma in Phase 1. Working brief for whoever designs it (or for AI-assisted concepting):

- **Mark:** a four-pointed compass star inscribed in a circle, where each point is a different element (Air/Fire/Water/Earth). Negative space inside reads as a doorway / portal.
- **Wordmark:** Display serif (Fraunces, weight 400) for "Four Corners," small caps grotesque (Geist Mono) for "VILLAGE" beneath.
- **Color:** monochrome on dark; on light, use the deep cosmic ink (`--color.bg.canvas`).
- **Sizes:** 16px (favicon), 32px (app icon), 64px (header), 256px (marketing), 1024px (App Store).

A first-pass SVG of the mark lives at [`packages/design-tokens/src/brand/mark.svg`](packages/design-tokens/src/brand/mark.svg) (added in Phase 1).

---

## Trademark notes

- "Four Corners" alone is a generic geographic / colloquial term — likely difficult to register as a trademark in the US.
- "Four Corners Village" as a composite mark in **Class 41 (educational services)** and **Class 42 (software platform)** is filable and distinctive.
- The Vintage TV name pairs with **Class 38 (broadcasting)** and **Class 41**.
- Recommend a USPTO TEAS Plus filing (~$250/class) once revenue is real. Not blocking for launch.

---

## Action item

Once you read this, tell me which domain to register and I'll produce the exact Cloudflare Registrar click-path. The DNS records we'll add immediately are pre-listed in [docs/launch-checklist.md](docs/launch-checklist.md) (added in Phase 3).
