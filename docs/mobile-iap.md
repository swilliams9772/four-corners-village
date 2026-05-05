# Mobile subscription model — Reader app

**Decision (locked):** 4 Corners Village ships its iOS and Android apps as **Reader apps** under Apple's [External Link Account Entitlement](https://developer.apple.com/documentation/storekit/external_link_account) and Google Play's [equivalent allowance](https://support.google.com/googleplay/android-developer/answer/12435178). Subscriptions to **Vintage TV** and to practitioner tiers (Initiate / Guide / Sanctuary) are sold **only on the web**. The mobile app authenticates the existing entitlement and lets paying users consume content.

## Why

- Avoids a 15-30% IAP cut on subscription revenue (margin-negative at our $5.55/mo price point).
- Keeps a single source of truth for entitlement and tax in Stripe.
- Removes the dual-rail entitlement-sync surface (Stripe ↔ App Store Server Notifications ↔ Play Developer API), which is high-risk for a small team.
- Apple explicitly carves out "reader" content (audio, video, magazines, books, professional databases) — Vintage TV qualifies as on-demand video, the same path Netflix, Mubi, Spotify, and Calm use.

## What this means in code

1. The mobile app **never** offers in-app purchase. No StoreKit / Play Billing dependency is added.
2. When a user without an entitlement tries to play a Vintage TV title or apply for a practitioner space, mobile opens the web in `WebBrowser` (or a native `Linking.openURL`) pointed at:
   - `${APP_URL}/dashboard/account/billing` for Vintage TV
   - `${APP_URL}/practitioners/apply` for practitioner onboarding
3. After the web flow completes (Stripe Checkout → webhook → `subscriptions` row), the mobile app refreshes entitlement state from `GET /api/me/entitlements` (Bearer token).
4. The web's existing webhook (`/api/webhooks/stripe`) is the only writer of subscription rows. Mobile is a strict reader.

## App Store Review notes

- **External Link Account Entitlement** is required to *promote* the web (not strictly required to merely allow account login). We will request it via App Store Connect with the `com.apple.developer.storekit.external-link.account` entitlement.
- For the cleanest first review pass we ship without a "Subscribe" CTA in the app at all. Users discover that purchases happen on the web by signing in and seeing the unlocked content. The Account screen exposes a single "Manage on web" link, which falls under reader-app allowances.
- Google Play: we declare "User choice billing" is **not** used and rely on the standard reader-app exemption; alternative billing systems are not enabled.

## Reversal path

If we ever decide to flip to dual-rail IAP:

1. Add `expo-iap` (or `react-native-iap`) and create native products mirroring `STRIPE_PRICE_TV_MONTHLY` / `_ANNUAL`.
2. Subscribe to App Store Server Notifications v2 + Google Play Developer API → write `subscriptions` rows tagged `source = "ios" | "android"`.
3. Pause Stripe checkout for native sessions; let the entitlement layer in `lib/auth.ts#hasActiveTvSubscription` consume `source` agnostically.
4. Update Account screen to surface store-of-record management links per platform.

We expect the Reader path to hold for at least the first 6 months.
