# Post-launch playbook — analytics, observability, accessibility

This playbook covers Phase 5: what we run **after** the public launch lands. It assumes [docs/launch.md](launch.md) and [docs/mobile-release.md](mobile-release.md) have shipped.

## 1. PostHog analytics

### Wired automatically

The web app instruments these events without any extra work:

| Event                          | Source                                                  | Distinct ID         |
|--------------------------------|---------------------------------------------------------|---------------------|
| `$pageview`                    | `<PostHogProvider>` in [`apps/web/src/app/layout.tsx`](../apps/web/src/app/layout.tsx) | Supabase user.id    |
| `$pageleave`                   | PostHog auto                                            | Supabase user.id    |
| `tv_subscription_started`      | Stripe webhook → `captureServerEvent`                   | Supabase user.id    |
| `tier_subscription_started`    | Stripe webhook → `captureServerEvent`                   | Supabase user.id    |

The mobile app is wrapped in [`AnalyticsProvider`](../apps/mobile/src/lib/analytics.tsx); it auto-captures app lifecycle events (open / background / foreground / install / update) and identifies the user as soon as their Supabase session loads.

### Funnels to set up in PostHog UI

Create these in **Insights → New → Funnel** on day one of GA:

1. **Marketing → Member**
   `$pageview (/) → $pageview (/signup) → user_signed_up → $pageview (/dashboard)`
2. **Free → Vintage TV**
   `$pageview (/dashboard) → $pageview (/tv) → $pageview (/tv/subscribe) → tv_subscription_started`
3. **Practitioner application**
   `$pageview (/practitioners/apply) → practitioner_application_submitted → practitioner_approved → tier_subscription_started`
4. **Mobile activation**
   `mobile_app_opened (first session) → user_signed_in → mobile_first_tv_play`

The `user_signed_up` and `practitioner_application_submitted` events still need to be captured manually in their respective server actions; left as a follow-up since both writes already exist on Supabase tables and we can hydrate from there if needed.

### Cohorts

- **Founders cohort**: anyone whose first event has `app_version: < 1.0.0` (TestFlight + Play Internal users). Tag for retention emails.
- **Lapsed TV**: `subscriptions.status = "canceled"` users who haven't returned in 14 days.
- **High-engagement practitioners**: ≥1 course publish + ≥3 student enrollments in the first 30 days.

### Privacy

We respect `Do Not Track`, the GPC signal, and a `localStorage[fc-analytics-opt-out] = "1"` toggle. Document this in the privacy policy with a UI control surfaced from `/dashboard/account/privacy` (TODO).

## 2. Lighthouse + axe accessibility pass

Run the audit weekly post-launch via the [Web Vitals skill](../node_modules/.cache/cursor-public/cloudflare/skills/web-perf/SKILL.md) or directly from Chrome DevTools.

### Targets

| Metric                  | Target | Source                |
|-------------------------|--------|-----------------------|
| Performance             | ≥ 90   | Lighthouse desktop    |
| Performance (mobile)    | ≥ 75   | Lighthouse mobile     |
| Accessibility           | ≥ 95   | Lighthouse + axe      |
| Best Practices          | ≥ 95   | Lighthouse            |
| SEO                     | ≥ 95   | Lighthouse            |
| LCP                     | < 2.5s | CrUX (real users)     |
| INP                     | < 200ms| CrUX                  |
| CLS                     | < 0.1  | CrUX                  |

### Pages to audit

- `/` (marketing home — most expensive due to ambient aurora + scroll animation)
- `/tv` (browse — image-heavy)
- `/tv/[slug]` (title page with backdrop)
- `/dashboard` (dashboard shell)
- `/altars` (Realtime + Skia / SVG-driven)

### Common findings + fixes

- **LCP**: the aurora background should be `loading="eager"` only on `/`; everywhere else it's a decorative element and should `aria-hidden`. Check before each major release.
- **CLS**: `LunarOrb` and `LunarSyncCard` use intrinsic size; verify when adding new variants.
- **A11y**: every `Pressable`/`button` must have `aria-label` or visible text. Use `axe DevTools` on each page and resolve all "violations" (warnings are case-by-case).

## 3. Sentry alert thresholds

The Sentry SDK is initialized in `apps/web/sentry.{client,server}.config.ts` with environment-aware sampling. Configure these alert rules in **Sentry → Alerts → Create Alert** on the production project:

### Issue alerts

1. **New error (any)** → email + Slack to `#fc-engineering` immediately. *Severity: critical.*
2. **Error rate > 1% on a release** → email + PagerDuty after a 5-minute rolling window. *Severity: high.*
3. **Error rate > 5% on a single endpoint** → page on-call. *Severity: critical.*

### Performance alerts

4. **Apdex < 0.9 over 1 hour** → email. *Severity: medium.*
5. **P95 latency on `/api/webhooks/stripe` > 3s** → email + Slack. *Severity: high.*
6. **P95 latency on `/api/tv/sign` > 1s** → email. *Severity: medium.*

### Spike protection

7. **Web vitals — LCP P75 > 4s** for `/tv/*` for 30+ minutes → email. *Severity: medium.*
8. **Replay capture quota > 80%** → email. *Severity: low.*

### Smoke tests

Wire a lightweight cron via Vercel (already supported with `vercel.json`) to hit `/api/health` (TODO: add) every 5 minutes; route failures into Sentry as cron monitor missed-checkin events. Sentry's free tier covers cron monitoring.

## 4. Iteration cadence

- **Daily**: Sentry triage (10 min).
- **Weekly**: PostHog funnel review (30 min) — pull the four headline funnels, pick the worst step, file a ticket.
- **Bi-weekly**: Lighthouse + axe pass on the five canonical pages; ship perf/a11y fixes ahead of any new feature work.
- **Monthly**: review subscription churn cohort in PostHog + Stripe; iterate on retention email cadence + pricing copy.

## 5. KPIs (first 90 days)

| KPI                              | Target                       |
|----------------------------------|------------------------------|
| Waitlist → activated members     | ≥ 40 %                       |
| Activated → paid (any tier)      | ≥ 12 %                       |
| Vintage TV monthly churn         | ≤ 6 %                        |
| Practitioner applications        | ≥ 30 / month                 |
| Application → approved + onboarded| ≥ 60 %                       |
| Mobile DAU / MAU                 | ≥ 25 %                       |
| Sentry critical alerts / week    | ≤ 1                          |
| Lighthouse Perf (desktop, /)     | ≥ 90 sustained               |

Bake these into a PostHog dashboard pinned at the top of the workspace.
