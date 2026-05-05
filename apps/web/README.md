# Four Corners Village

Next.js 16 App Router · Supabase · Stripe · Cloudflare Stream · Tailwind + shadcn/ui

This is the production application that replaces the original marketing-only Vite app at `../app/`. It implements the full vision from the project plan in five phases:

| Phase | What it ships |
| - | - |
| 0 | Marketing site (home, pricing, practitioners, legal), Supabase schema, env scaffolding |
| 1 | Auth (email/password + Google + Apple), member dashboard, Stripe Customer Portal |
| 2 | **Four Corners Vintage TV** — admin upload, browse, title pages, HLS player with watermark, $5.55/$55.55 paywall |
| 3 | Practitioner application, sub-spaces (`/v/[slug]`), Stripe Connect Express, 85/15 destination charges, financial dashboard |
| 4 | LMS (courses + modules + lessons), Zoom OAuth, Digital Altars (Realtime), Lunar sync, AI Oracle (Claude/OpenAI/heuristic) |
| 5 | Legal (Terms, Privacy, DMCA), Sentry, error boundaries |

---

## Getting started locally

```bash
cd app-next
cp .env.example .env.local      # fill in keys you have, leave others blank
npm install
npm run dev
```

The app runs cleanly with **zero** keys configured — landing page, marketing, dev seed catalog for Vintage TV, and the Oracle's heuristic mode all work out of the box. Each integration only activates when its env vars are filled in.

Open <http://localhost:3000>.

---

## Wiring up integrations (in order)

### 1. Supabase (auth + Postgres + Realtime)

1. Create a project at <https://supabase.com>.
2. Copy `Project URL`, `anon` key, `service_role` key into `.env.local`.
3. Apply the schema:
   ```bash
   npx supabase link --project-ref <ref>
   npx supabase db push
   ```
   Or paste each file in `supabase/migrations/` into the SQL editor.
4. In **Authentication → Providers**, enable Email, Google, and Apple.
5. Set Site URL to `http://localhost:3000` (and your prod domain).
6. Add yourself to `ADMIN_EMAILS` in `.env.local` to access `/admin`.

### 2. Stripe (subscriptions + Connect)

1. Create test products in <https://dashboard.stripe.com/test/products>:
   - **Vintage TV — Monthly** at $5.55/month
   - **Vintage TV — Annual** at $55.55/year
   - **The Initiate** at $49/month
   - **The Guide** at $149/month
   - **The Sanctuary** at $399/month
2. Copy each Price ID to the matching `STRIPE_PRICE_*` var.
3. Copy the secret key + publishable key into env.
4. **Webhook**: in Stripe → Developers → Webhooks, add endpoint
   `https://YOUR-DOMAIN/api/webhooks/stripe` listening to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `account.updated` (for Connect)
   Copy the signing secret to `STRIPE_WEBHOOK_SECRET`.
5. **Connect**: in Stripe → Settings → Connect, enable Express accounts,
   set the redirect URL to `https://YOUR-DOMAIN/practitioner/onboarding`.

For local webhook testing:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 3. Cloudflare Stream (Vintage TV video)

1. Create account at <https://dash.cloudflare.com>.
2. Enable Stream and note your **Account ID** + **Customer Subdomain** (e.g. `customer-abc123`).
3. Create an API token with `Stream:Edit` permission.
4. For signed playback URLs, generate a key:
   ```bash
   curl -X POST -H "Authorization: Bearer <TOKEN>" \
     https://api.cloudflare.com/client/v4/accounts/<ACCT>/stream/keys
   ```
   Use the returned `id` and `jwk` for `CLOUDFLARE_STREAM_SIGNING_KEY_ID` and `CLOUDFLARE_STREAM_SIGNING_JWK` (paste the JWK as a single-line JSON string).
5. Upload your first video at `/admin/tv` once signed in as an admin.

### 4. Resend (transactional email)

1. Sign up at <https://resend.com>.
2. Verify your sending domain.
3. Create an API key, copy to `RESEND_API_KEY`.
4. Set `RESEND_FROM_EMAIL` (e.g. `Four Corners <hello@fourcorners.village>`).

### 5. Zoom (Phase 4 — Sanctuary tier)

1. Create an OAuth app at <https://marketplace.zoom.us>.
2. Set redirect URL to `https://YOUR-DOMAIN/api/zoom/callback`.
3. Required scopes: `meeting:write`, `user:read`.
4. Copy client ID + secret into `.env.local`.

### 6. AI Oracle

Set either `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`. If neither is set, the Oracle uses a deterministic heuristic interpreter (still works, just less poetic).

### 7. Sentry

1. Create a project at <https://sentry.io> (Next.js).
2. Copy DSN into `NEXT_PUBLIC_SENTRY_DSN`.
3. For source-map upload in CI, add `SENTRY_AUTH_TOKEN`.

---

## Deploying

Recommended stack:

- **Hosting:** Vercel (`vercel deploy`). All env vars set per environment in the Vercel dashboard.
- **DB + Auth + Storage:** Supabase managed Postgres.
- **Video:** Cloudflare Stream (separate from your main hosting; cheaper than Mux).
- **Domains:** Apex on Cloudflare DNS pointing to Vercel.

Set `NEXT_PUBLIC_APP_URL` to your production URL.

---

## Pricing & Vintage TV unit economics

The plan we built against ([../.cursor/plans/](../.cursor/plans/)) lays out the cost model. Quick numbers:

| Subs | Gross | Stripe fees | CF Stream | Net |
| - | - | - | - | - |
| 100 × $5.55 | $555 | -$46 | -$54 | **~$430/mo** |
| 1,000 × $5.55 | $5,550 | -$460 | -$540 | **~$4,400/mo** |

Recurring infrastructure (Vercel Pro + Supabase Pro + Resend + Sentry) is ~$95/mo and grows slowly. Cloudflare Stream is the only video cost driver and scales linearly with viewing hours.

---

## Project structure

```
app-next/
├── src/
│   ├── app/
│   │   ├── (marketing)/        # public site (home, pricing, practitioners, legal)
│   │   ├── (auth)/             # /login, /signup
│   │   ├── (dashboard)/        # member + practitioner + admin (sidebar shell)
│   │   ├── (tv)/tv/            # Vintage TV — own header, browse, watch, paywall
│   │   ├── v/[slug]/           # public practitioner sub-spaces
│   │   ├── api/                # webhooks (Stripe), playback signing, Zoom callback
│   │   ├── actions/            # all server actions (auth, billing, tv, practitioner...)
│   │   ├── auth/callback/      # Supabase OAuth handler
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                 # shadcn primitives
│   │   ├── site/               # marketing nav, footer, waitlist
│   │   ├── dashboard/          # sidebar shell
│   │   └── tv/                 # tv header, poster, player, rows
│   ├── lib/
│   │   ├── supabase/           # client / server / middleware / types
│   │   ├── stripe/             # server, client, connect
│   │   ├── cloudflare/         # stream API + signed token
│   │   ├── oracle/             # cards + interpreter
│   │   ├── lunar.ts            # phase calculation
│   │   ├── auth.ts             # session helper
│   │   ├── env.ts              # centralized env access
│   │   └── utils.ts
│   └── middleware.ts           # auth + paywall gating
├── supabase/migrations/        # schema (apply via `supabase db push`)
└── .env.example
```

---

## Pre-launch checklist

### Phase 5: things to do before flipping the public switch

- [ ] Provision real Supabase project + apply migrations
- [ ] Configure Stripe products + webhook + Connect
- [ ] Configure Cloudflare Stream + signing keys
- [ ] Configure Resend + verify sending domain
- [ ] Test signup → email confirmation → dashboard
- [ ] Test Vintage TV: subscribe → checkout → webhook → playback
- [ ] Test practitioner: apply → admin approve → Stripe Connect → publish space
- [ ] Test course purchase: enroll free + paid (Connect destination charge)
- [ ] Upload at least 10 documentaries to Vintage TV
- [ ] Approve at least 5 founding practitioners
- [ ] Run Lighthouse audit on all key pages (target ≥90 perf)
- [ ] Run axe-core a11y audit on all key flows
- [ ] Set up Sentry alerts for `>5%/min` error rate
- [ ] Register DMCA agent with the U.S. Copyright Office (~$6, search "DMCA Designated Agent")
- [ ] Add cookie-consent banner if launching in EU/UK
- [ ] Double-check ToS, Privacy, DMCA copy with legal counsel
- [ ] Write the welcome email and the Vintage TV "you're subscribed" email in Resend
- [ ] Announce launch to the waitlist

---

## Common dev tasks

```bash
# Run dev server
npm run dev

# Type-check (catches issues without running)
npm run typecheck

# Lint
npm run lint

# Apply latest DB migration
npm run db:push

# Reset local DB (destructive!)
npm run db:reset
```

---

## Notes on the no-download requirement (Vintage TV)

- HLS encrypted segments served via signed Cloudflare Stream URLs (token expires in 2 hours)
- `controlsList="nodownload"`, disabled context menu, disabled `<a download>`, `withCredentials=false`
- Email/UID watermark overlay rendered on the player surface
- View events logged for forensic audit
- **NOT included:** Widevine L1 / FairPlay / PlayReady DRM. To add DRM-grade protection, swap the Cloudflare Stream provider for Mux + Widevine in `src/lib/cloudflare/stream.ts` and `src/components/tv/hls-player.tsx`. The DB schema and rest of the app are unchanged.

This is the same protection model used by 90%+ of paid streaming services that aren't Netflix/Disney+/HBO. A determined user with screen-recording software can always capture playback. The goal is friction, not impossibility — and the watermark gives us forensic recourse if leaked content surfaces.
