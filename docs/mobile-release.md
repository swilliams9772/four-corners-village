# Mobile release playbook — EAS Build, TestFlight, Play Internal

This is the operating manual for shipping the Four Corners Village iOS and Android apps. It assumes [docs/launch.md](launch.md) has already been completed (Apple Developer + Play Console enrollment, Cloudflare/Supabase/Stripe live, etc.) and that [docs/mobile-iap.md](mobile-iap.md) is in effect (Reader-app pattern, no IAP).

## Tooling install (one-time)

```bash
# Inside the monorepo root
pnpm install

# Sign in to Expo / EAS
pnpm dlx eas-cli@latest login

# Bind the local repo to an EAS project (writes the projectId into app.json -> extra.eas.projectId)
cd apps/mobile
pnpm dlx eas-cli init
```

After `eas init`, replace `TBD-RUN-EAS-INIT` in [`apps/mobile/app.json`](../apps/mobile/app.json) → `extra.eas.projectId` with the generated UUID.

## Environment variables on EAS

Set the public mobile env on the EAS project so cloud builds receive them. Mirror the values from Vercel for **production**, separate ones for **preview**:

```bash
cd apps/mobile

# Production
eas secret:create --scope project --name EXPO_PUBLIC_APP_URL --value "https://fourcorners.village"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "<prod url>"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "<prod anon>"
eas secret:create --scope project --name EXPO_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE --value "<code>"
eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID --value "<from GCP>"
eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --value "<from GCP>"
eas secret:create --scope project --name EXPO_PUBLIC_POSTHOG_KEY --value "<phc_…>"
eas secret:create --scope project --name EXPO_PUBLIC_POSTHOG_HOST --value "https://us.i.posthog.com"
```

Server-only secrets (`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `CLOUDFLARE_STREAM_SIGNING_JWK`, etc.) **never** touch EAS — they remain in Vercel.

## Apple-side prerequisites

1. App Store Connect → My Apps → **+** → New App.
   - Platform: iOS
   - Bundle ID: `village.fourcorners.app` (matches `app.json -> ios.bundleIdentifier`)
   - SKU: `four-corners-village-ios`
2. Capabilities (App ID Configuration in the developer portal):
   - **Push Notifications**
   - **Sign In with Apple**
   - **Associated Domains** with `applinks:fourcorners.village` and `applinks:www.fourcorners.village`
3. **External Link Account Entitlement** (for the Reader-app exception). Submit the request via [https://developer.apple.com/contact/request/external-link-account/](https://developer.apple.com/contact/request/external-link-account/). Approval takes ~1-2 weeks.
4. After approval, paste the App Store Connect numeric App ID and your Apple Team ID into `apps/mobile/eas.json` → `submit.production.ios`.
5. Update `apps/web/public/.well-known/apple-app-site-association` and replace `TEAMID` with your real Team ID before the next web deploy.

## Google-side prerequisites

1. Play Console → **Create app**.
   - App name: Four Corners Village
   - Package name: `village.fourcorners.app`
   - App or game: App
   - Free or paid: Free
2. Set up the closed testing track ("Internal testing"); add your own testers' Gmail addresses.
3. Create a service account with **Service Account User** + **Release manager** roles, download the JSON, save it as `apps/mobile/google-play-service-account.json` (gitignored).
4. After the first manual upload, grab the SHA-256 cert fingerprint from Play Console → App integrity → App signing → "App signing key certificate" → SHA-256, and paste into `apps/web/public/.well-known/assetlinks.json`. Redeploy the web app.

## OAuth client IDs (Google Sign-In)

In the Google Cloud Console for the same project as Supabase Google login:

1. **iOS client**: bundle ID `village.fourcorners.app` → `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`.
2. **Web client** (already created for Supabase): URI `https://<supabase-project>.supabase.co/auth/v1/callback` → `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.
3. Configure Supabase → Authentication → Providers → Google → Authorized client IDs: include both above.

## Build cadence

| Track          | When                | Command                                              | Distribution               |
|----------------|---------------------|------------------------------------------------------|----------------------------|
| Development    | Daily               | `pnpm --filter mobile build:ios -- --profile development` | Expo Go / dev client install |
| Preview        | Per feature branch  | `eas build --profile preview --platform all`         | TestFlight internal / APK  |
| Production     | Weekly during launch | `eas build --profile production --platform all`     | TestFlight + Play Internal |

EAS Build uses the profile names defined in [`apps/mobile/eas.json`](../apps/mobile/eas.json).

## Submit cadence

```bash
# After production build finishes (`eas build:list` shows the artifact):
cd apps/mobile

eas submit --profile production --platform ios     # uploads to TestFlight
eas submit --profile production --platform android # uploads to Internal testing track
```

iOS goes through TestFlight Beta App Review (~24h) before reaching internal testers. Once stable for ≥7 days, promote to **App Store** review via App Store Connect → "Distribute Build to App Store" → submit.

Android: from Internal → Closed → Open → Production via Play Console → Release → Production → "Promote release".

## Week 9 milestone — internal access live

- TestFlight internal group "Founders" populated (you + 5-10 alpha members).
- Play Internal track populated with the same accounts (different emails, ≤100 testers).
- Confirm these flows on a real device:
  - Email signup → email confirm
  - Apple Sign-In + Google Sign-In
  - Push permission prompt → token row in `push_tokens`
  - Vintage TV: subscribe via web browser (deep-link from app) → return → playback works → watermark + screen-record blocking visible on iOS
  - Altars realtime: place an offering on web, see it appear on mobile within ~2s
  - Oracle: draw a three-card spread end-to-end
  - Sign out → push token row revoked

## Week 12 milestone — public release

- Resolve every TestFlight feedback item.
- Lighthouse pass via the in-app WebView (or Safari) on `https://fourcorners.village/m` — score ≥90 on Performance, ≥95 on A11y.
- Run [docs/smoke-tests.md](smoke-tests.md) one more time on prod, mark every box.
- App Store: "Submit for Review" with the Reader-app review note (template below).
- Google Play: promote Internal → Production with staged rollout 10% → 50% → 100% over 5 days.

## App Store Review notes (paste into App Store Connect → App Review)

> Four Corners Village is a Reader app. All subscriptions are sold on our website at https://fourcorners.village under the "Vintage TV" plan. The mobile app authenticates the user's existing entitlement via our Supabase backend and lets them stream on-demand video and access live community features. There is no in-app purchase. To test as a paid user:
>
> Email: review+ios@fourcorners.village
> Password: <set in App Store Connect "Sign-In Information">
>
> This account is preloaded with an active Vintage TV subscription. Tapping any title plays a watermarked HLS stream signed via Cloudflare Stream. We've requested the External Link Account Entitlement under our developer account, ID <case ID>.

## Rollback

If a production build is critical-broken:

1. EAS Update → push a JS-only patch via `eas update --branch production` (works for any change that doesn't require a new native binary).
2. If native: `eas build --profile production --platform <platform> --auto-submit-with-profile production` to push a fixed binary, then expedite review (one expedited request per app per 90 days).
3. For Stripe / Supabase regressions, the web app and mobile app share the same backend; revert Vercel deploy in parallel.

## Cost summary

- Apple Developer: $99 / year
- Google Play Console: $25 one-time
- EAS Free tier: 30 builds / month (sufficient through week 12); upgrade to Production if we exceed.
- Expo push notifications: free up to 100 notifications / second.
