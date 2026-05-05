# 4 Corners Village — Launch Playbook

A concrete, click-by-click runbook for taking the platform from "nothing provisioned" to a production soft-launch behind the waitlist gate. Each section produces a set of secrets that get pasted into the **Vercel env** at the matching scope (`Production`, `Preview`, `Development`).

> **Order matters.** Domain → Cloudflare → Supabase → Stripe → Resend → Sentry → Vercel → Apple → Google. The diagram is in [redesign_launch_and_mobile_905dd8be.plan.md](../.cursor/plans/redesign_launch_and_mobile_905dd8be.plan.md).

---

## 0. Prerequisites

- Personal email + a payment card (most providers are free or trial; Apple is $99/yr, Google is $25 once)
- A clean browser session for each provider (use a profile / incognito to avoid org confusion)
- This repo cloned, with `pnpm install` run at the root

Pick the brand + domain first using `docs/brand-and-domain.md`. The rest of this guide assumes **`fourcorners.village`** is the canonical domain.

---

## 1. Cloudflare (Registrar + Stream)

### 1a. Register the domain

1. Sign up at <https://dash.cloudflare.com>.
2. From the dashboard go to **Domain Registration → Register Domains**, search `fourcorners.village`, complete checkout. (~$10/yr at registrar cost.)
3. After registration, the domain auto-provisions a Cloudflare zone — DNS is already managed.

### 1b. Stream account + signing key

1. **Stream → Get Started**, accept the pay-as-you-go plan (~$5/1,000 minutes streamed).
2. Note your **customer code** in the Stream dashboard (e.g. `customer-abc123`). Paste into:
   - `CLOUDFLARE_STREAM_CUSTOMER_CODE`
3. **My Profile → API Tokens → Create Token**: template "Stream — Read & Write". Paste into:
   - `CLOUDFLARE_STREAM_API_TOKEN`
4. Note the **Account ID** in the right sidebar of the home dashboard. Paste into:
   - `CLOUDFLARE_ACCOUNT_ID`
5. **Stream → Keys → Create a signing key.** Cloudflare returns a JSON object with `id`, `pem`, and `jwk`. We use the JWK:
   - The `id` field → `CLOUDFLARE_STREAM_SIGNING_KEY_ID`
   - The entire `jwk` field, **collapsed onto one line** (run `node -e 'console.log(JSON.stringify(require("./key.json").jwk))'` if you need to flatten it) → `CLOUDFLARE_STREAM_SIGNING_JWK`
6. **Stream → Settings**: enable signed URL enforcement so `customer-abc123.cloudflarestream.com/<uid>/manifest/video.m3u8` requires a token. The `lib/cloudflare/stream.ts` helper already mints them.

---

## 2. Supabase (auth, Postgres, realtime, storage)

### 2a. Project

1. Sign up / log in at <https://supabase.com/dashboard>.
2. **New Project** — name `four-corners-prod`, region close to your audience (US East for default). Save the database password somewhere safe.
3. Wait for the project to provision (~2 min).

### 2b. Keys + connection string

In **Project Settings → API**:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY` (server-only — never expose)

### 2c. Apply migrations

From the repo root:

```bash
brew install supabase/tap/supabase
supabase login
supabase link --project-ref <ref-from-dashboard>
supabase db push    # applies everything in apps/web/supabase/migrations/
```

This creates: `profiles`, `subscriptions`, `practitioners`, `videos` + categories + series + progress, `courses` + modules + lessons + enrollments, `altars` + offerings, `oracle_readings`, `waitlist`, plus RLS policies on every table.

### 2d. Auth providers

In **Authentication → Providers**:

- **Email**: enable, default templates fine
- **Google**: enable, paste OAuth credentials from <https://console.cloud.google.com/apis/credentials>
  - Authorized redirect URIs: `https://<project-ref>.supabase.co/auth/v1/callback`
- **Apple**: enable, generate Sign in with Apple credentials in App Store Connect → Certificates → Keys (after section 8)

In **Authentication → URL Configuration**:

- **Site URL**: `https://fourcorners.village`
- **Redirect URLs**: add `https://fourcorners.village/auth/callback`, `https://*-fourcorners.vercel.app/auth/callback` (for previews), and `http://localhost:3000/auth/callback` (dev)

### 2e. Realtime + storage

Realtime is on by default. The Altars page subscribes to `altar_offerings` INSERTs. Enable it explicitly per-table in **Database → Replication**:

- `altar_offerings` → toggle "Realtime"

Storage — create a bucket `avatars` (public read, authenticated write). Practitioner cover images currently use external URLs; if/when you need uploads, add a `covers` bucket.

---

## 3. Stripe (live + Connect 85/15)

### 3a. Account + activation

1. Sign up at <https://dashboard.stripe.com>.
2. **Activate your account** — provide business info + bank account. Until activated, you can only use test mode.

### 3b. Products + prices

In **Products → Add product** (live mode), create five:

| Product               | Price         | Recurrence | Key                       |
| --------------------- | ------------- | ---------- | ------------------------- |
| Vintage TV (monthly)  | $5.55         | Monthly    | `STRIPE_PRICE_TV_MONTHLY` |
| Vintage TV (annual)   | $55.55        | Yearly     | `STRIPE_PRICE_TV_ANNUAL`  |
| Practitioner Initiate | $49.00        | Monthly    | `STRIPE_PRICE_INITIATE`   |
| Practitioner Guide    | $149.00       | Monthly    | `STRIPE_PRICE_GUIDE`      |
| Practitioner Sanctuary| $399.00       | Monthly    | `STRIPE_PRICE_SANCTUARY`  |

Paste each `price_xxx` ID into the matching env var.

### 3c. API keys

In **Developers → API keys**:

- **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Secret key** → `STRIPE_SECRET_KEY`

### 3d. Webhook

In **Developers → Webhooks → Add endpoint**:

- URL: `https://fourcorners.village/api/webhooks/stripe`
- Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`, `account.updated`
- After saving, reveal the **signing secret** → `STRIPE_WEBHOOK_SECRET`

For local dev, use `stripe listen --forward-to localhost:3000/api/webhooks/stripe` and use that CLI's signing secret.

### 3e. Connect (Express)

In **Connect → Settings**:

- Branding: upload logo + brand color (use `--brand` from tokens)
- Express onboarding redirect URL: `https://fourcorners.village/practitioner/onboarding`
- Platform fees: handled per-charge via the `application_fee_amount` parameter — already wired in `apps/web/src/app/actions/practitioner.ts`. Default platform take is 15% (Initiate/Guide) or 5% (Sanctuary). Confirm tier-aware logic if you change splits.

---

## 4. Resend (transactional email)

1. Sign up at <https://resend.com>.
2. **Domains → Add Domain** → `fourcorners.village`. Resend prints DNS records (3 × TXT/CNAME/MX). Add them to the Cloudflare zone — DNS propagates within minutes since the zone is already on Cloudflare.
3. Verify; once green, create an **API key** under Settings → API Keys. Paste:
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL="4 Corners Village <hello@4cornersvillage.com>"`

---

## 5. Sentry

1. Sign up at <https://sentry.io>.
2. Create org `four-corners` and project `four-corners-web` (Next.js platform). Sentry shows a DSN.
3. Settings → Auth Tokens → Create token (org-scope `project:releases` + `project:write`).

Paste:

- `NEXT_PUBLIC_SENTRY_DSN` (the DSN from project setup)
- `SENTRY_ORG=four-corners`
- `SENTRY_PROJECT=four-corners-web`
- `SENTRY_AUTH_TOKEN` (the token)

The app already wires `@sentry/nextjs` and uploads source maps automatically via the build hook.

---

## 6. Vercel

1. Install the Vercel CLI: `npm i -g vercel` (or use `pnpm dlx vercel`).
2. From the repo root:
   ```bash
   pnpm dlx vercel link
   ```
   Choose your team, name the project `four-corners-web`, root directory `apps/web` (Vercel detects Next.js automatically because of the `apps/web/next.config.ts`).
3. **Add domain**: project → **Settings → Domains → Add `fourcorners.village`** (and `www.fourcorners.village` if desired). Vercel returns DNS records. Cloudflare DNS zone — add an `A 76.76.21.21` record + `CNAME www → cname.vercel-dns.com`. SSL provisions automatically.

### 6a. Environment variables — by env

Use this script after collecting all keys:

```bash
cd apps/web
# Production keys
pnpm dlx vercel env add NEXT_PUBLIC_SUPABASE_URL production
pnpm dlx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
pnpm dlx vercel env add SUPABASE_SERVICE_ROLE_KEY production
# … repeat for every var listed in .env.example, scoped to production

# Preview / dev get test-mode keys
pnpm dlx vercel env add STRIPE_SECRET_KEY preview         # test mode key
pnpm dlx vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY preview
# … etc
```

For the **Cloudflare Stream JWK**, paste the value as a single line (no newlines or wrapping quotes — the Vercel form accepts it as a string and `lib/cloudflare/stream.ts` calls `JSON.parse` on it).

### 6b. Build settings

Vercel auto-detects:

- Framework Preset: **Next.js**
- Root Directory: **apps/web**
- Build Command: `pnpm turbo run build --filter=@four-corners/web` (override if it picks `next build` only)
- Install Command: `pnpm install --frozen-lockfile`

Push to `main` to trigger production deploy.

---

## 7. PostHog (analytics)

1. Sign up at <https://posthog.com> (cloud — US region).
2. Project → API Keys → copy `phc_…`. Paste:
   - `NEXT_PUBLIC_POSTHOG_KEY`
   - `NEXT_PUBLIC_POSTHOG_HOST` (default `https://us.i.posthog.com`)

The app initializes PostHog client-side from `apps/web/src/lib/analytics.ts`. Server-side events for webhooks use the **PostHog server-side key** (separate; create under Project Settings → Personal API keys when needed).

---

## 8. Apple Developer (iOS)

> Required only if you're shipping the mobile app. Web launch can skip this section.

1. Enroll at <https://developer.apple.com/programs/enroll>. **$99/yr.**
2. **Certificates, Identifiers & Profiles → Identifiers → New** App ID:
   - Bundle ID: `village.fourcorners.app`
   - Capabilities: Sign in with Apple, Push Notifications, Universal Links, Associated Domains
3. **Keys → New**:
   - **APNs auth key** for push (download `.p8`, save the Key ID + Team ID)
   - **Sign in with Apple key** (used in Supabase Apple provider config)
4. **App Store Connect → My Apps → New App**:
   - Name: 4 Corners Village
   - Primary language: English (U.S.)
   - Bundle ID: `village.fourcorners.app`
   - SKU: `four-corners-app`

EAS Submit will require an **App Store Connect API key** (Users & Access → Keys → Create). Save the `.p8` and Key ID + Issuer ID.

---

## 9. Google Play Console (Android)

> Required only if shipping the mobile app.

1. Pay the $25 one-time fee at <https://play.google.com/console/signup>.
2. **Create app**:
   - App name: 4 Corners Village
   - Default language: English (United States)
   - App or game: App
   - Free or paid: Free (TV is a Reader-app pattern; see Phase 4 IAP decision)
3. Set up the **app integrity** + **internal testing** tracks. Create a closed track for the founding-circle members.
4. **Setup → API access → Service accounts**: create a service account, grant Play access, download the JSON key. EAS Submit will use it.

---

## 10. Soft launch checklist

Once every section above is green:

```bash
# 1. Apply latest migrations to prod
supabase db push

# 2. Verify env on the prod build
pnpm dlx vercel env pull .env.production.local
pnpm --filter @four-corners/web typecheck
pnpm --filter @four-corners/web build

# 3. Deploy
git push origin main

# 4. Set the waitlist gate so signups require an invite
pnpm dlx vercel env add NEXT_PUBLIC_WAITLIST_ONLY production   # value: 1
```

Then run through `docs/smoke-tests.md`. When all pass, email founding members from `docs/launch-email.md`.
