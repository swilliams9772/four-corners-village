# Production smoke tests

Run these manually against `https://fourcorners.village` after each production deploy that touches auth, payments, video, or practitioner flows. Each step has an expected result; a failure blocks the soft launch.

---

## 0. Prerequisites

- A throwaway Gmail (use `+tag` aliases for repeat runs)
- A Stripe **test card** for preview env (`4242 4242 4242 4242`, any future date, any CVC, any zip)
- A Stripe **live card** that you control for production (use a low-limit virtual card; refund the charge afterwards)
- Production env points at **Stripe live mode** + **Supabase prod** + **Cloudflare Stream prod**
- Preview / staging points at **Stripe test mode** + a separate Supabase project (`four-corners-staging`)

---

## 1. Marketing + waitlist (~2 min)

| # | Action | Expected |
|---|--------|----------|
| 1.1 | Visit `/` in a private window | Cinematic hero loads, lunar orb animates, no console errors |
| 1.2 | Tab through the page | Focus rings visible, all CTAs reachable via keyboard |
| 1.3 | Toggle dark/light via header | `data-theme` flips on `<html>`, palette swaps cleanly |
| 1.4 | Submit the waitlist form with a fresh email | Toast "On the path." A row appears in `waitlist` table in Supabase |
| 1.5 | Submit again with the same email | Toast acknowledges duplicate without erroring |

---

## 2. Auth (~5 min)

| # | Action | Expected |
|---|--------|----------|
| 2.1 | `/signup` with a fresh email + 12-char password | Redirect to `/dashboard`. Welcome email arrives within 1 min |
| 2.2 | Sign out, sign back in | Lands on `/dashboard` |
| 2.3 | Click "Continue with Google" | Google chooser → consent → returns to dashboard with profile populated |
| 2.4 | Click "Continue with Apple" (Safari/iOS) | Sign in with Apple sheet → returns signed in |
| 2.5 | Visit `/account`, change display name + birth chart fields, save | Toast "Saved." Reload page shows the values |
| 2.6 | Hit `/dashboard` while logged out | 307 to `/login?next=/dashboard` |

---

## 3. Vintage TV (~10 min)

| # | Action | Expected |
|---|--------|----------|
| 3.1 | Visit `/tv` while signed in but not subscribed | Hero, paywall callout, locked posters; clicking a tile prompts subscribe |
| 3.2 | Click "Subscribe — $5.55/mo", pick monthly, pay with live card | Stripe Checkout → return to `/tv?subscribed=1` → subscription badge "Active" |
| 3.3 | Open Supabase `subscriptions` table | Row with `product=tv`, `status=active`, correct `stripe_customer_id` |
| 3.4 | Open a title page `/tv/<slug>` | Backdrop renders, "Play" button enabled |
| 3.5 | Press Play | HLS streams within ~3s, watermark drifts every 30s, controls disabled for download |
| 3.6 | Open dev tools → Network → look at `.m3u8` request | URL contains a `?token=…` JWT signed with our key |
| 3.7 | Copy the `.m3u8` URL into a fresh anonymous window | 401 from Cloudflare (signed-URL enforcement is working) |
| 3.8 | Visit `/tv/my-list` | Empty state renders. Add a title via heart button — appears in the list |
| 3.9 | `/tv/search?q=<keyword>` | Results render with poster cards, no flicker |
| 3.10 | In Stripe → Customer Portal (via `/account/billing`), cancel subscription | Returns; `subscriptions.cancel_at_period_end=true` in DB |

---

## 4. Practitioner flow (~10 min)

| # | Action | Expected |
|---|--------|----------|
| 4.1 | `/practitioners/apply` while signed in, fill out (Initiate tier) | Toast "Application sent." Row in `practitioners` with `status=pending` |
| 4.2 | As an admin user (`ADMIN_EMAILS` matches), open `/admin/practitioners` | The pending row shows. Click **Approve** |
| 4.3 | Applicant refreshes `/practitioner/onboarding` | Step 1+2 complete; step 3 is "Continue with Stripe" |
| 4.4 | Click Continue with Stripe → Express onboarding (use real-ish data) | Returns to `/practitioner/onboarding` with step 3 complete |
| 4.5 | Click Subscribe to Initiate ($49/mo) → Checkout → success | Step 4 complete; banner says "You're live" with "View public space" |
| 4.6 | Visit `/v/<slug>` while logged out | Public page loads with bio, modalities, direction, courses |
| 4.7 | As Guide-tier practitioner, create a course at `/practitioner/courses` | Course appears as Draft. Add a module + lesson + upload a video |
| 4.8 | Cloudflare Stream encodes the lesson video (~30s for short clips) | After encode, lesson row shows duration; publish course |
| 4.9 | A different signed-in member visits `/v/<slug>/courses/<course-slug>` | Course detail renders. Free → "Enroll free" works; paid → Stripe Checkout |
| 4.10 | After enrollment, member can play lesson video on the course detail page | HLS stream + signed URL same as TV |

---

## 5. Sacred tools (~5 min)

| # | Action | Expected |
|---|--------|----------|
| 5.1 | `/altars` while signed in | Village altar card renders with current offerings |
| 5.2 | Pick "Candle" + leave a message + place offering | New tile appears immediately (Realtime). Open in second window — appears there too |
| 5.3 | `/oracle` → leave question blank → Draw three cards | Three cards animate in, interpretation streams in below within ~6s |
| 5.4 | Click "Draw another" | Form returns; previous reading saved to `oracle_readings` table |

---

## 6. Webhooks (~3 min)

| # | Action | Expected |
|---|--------|----------|
| 6.1 | In Stripe → **Developers → Events**, find the `checkout.session.completed` from step 3.2 | Status: 200, no retries needed |
| 6.2 | Find the `customer.subscription.updated` after step 3.10 cancel | Status: 200, our DB shows `cancel_at_period_end=true` |
| 6.3 | In Sentry, check the project's **Issues** | No new errors in the last hour from production |

---

## 7. Performance + a11y (run once before soft launch)

```bash
# Lighthouse — desktop + mobile
npx lighthouse https://fourcorners.village --view --preset=desktop
npx lighthouse https://fourcorners.village --view --form-factor=mobile

# axe DevTools — open the extension on home, /tv, /dashboard, /v/<slug>
```

Targets:

- LCP < 2.0s desktop / < 2.5s mobile
- CLS < 0.05
- TBT < 200ms
- axe — zero serious violations

---

## 8. Sign-off

When every box is green:

1. Flip `NEXT_PUBLIC_WAITLIST_ONLY=1` in Vercel production env
2. Redeploy (or `pnpm dlx vercel --prod`)
3. Email founding members from `docs/launch-email.md`
4. Watch Sentry + PostHog dashboards for the first 24 hours
