/**
 * Centralized env access. Throws on missing required server-only vars
 * the moment something tries to use them, but the app still boots so
 * marketing pages render even if integrations aren't wired up yet.
 */

function required(name: string, value: string | undefined): string {
  if (!value || value.length === 0) {
    throw new Error(
      `[env] Missing required environment variable: ${name}. See .env.example.`,
    );
  }
  return value;
}

export const env = {
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    name: process.env.NEXT_PUBLIC_APP_NAME ?? "4 Corners Village",
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    get configured() {
      return Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      );
    },
    requireServer() {
      return {
        url: required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
        serviceRoleKey: required(
          "SUPABASE_SERVICE_ROLE_KEY",
          process.env.SUPABASE_SERVICE_ROLE_KEY,
        ),
      };
    },
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY ?? "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
    prices: {
      tvMonthly: process.env.STRIPE_PRICE_TV_MONTHLY ?? "",
      tvAnnual: process.env.STRIPE_PRICE_TV_ANNUAL ?? "",
      initiate: process.env.STRIPE_PRICE_INITIATE ?? "",
      guide: process.env.STRIPE_PRICE_GUIDE ?? "",
      sanctuary: process.env.STRIPE_PRICE_SANCTUARY ?? "",
    },
    get configured() {
      return Boolean(process.env.STRIPE_SECRET_KEY);
    },
  },
  cloudflare: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID ?? "",
    apiToken: process.env.CLOUDFLARE_STREAM_API_TOKEN ?? "",
    customerCode: process.env.CLOUDFLARE_STREAM_CUSTOMER_CODE ?? "",
    signingKeyId: process.env.CLOUDFLARE_STREAM_SIGNING_KEY_ID ?? "",
    signingJwk: process.env.CLOUDFLARE_STREAM_SIGNING_JWK ?? "",
    get configured() {
      return Boolean(
        process.env.CLOUDFLARE_ACCOUNT_ID &&
          process.env.CLOUDFLARE_STREAM_API_TOKEN,
      );
    },
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY ?? "",
    from: process.env.RESEND_FROM_EMAIL ?? "4 Corners Village <hello@4cornersvillage.com>",
    get configured() {
      return Boolean(process.env.RESEND_API_KEY);
    },
  },
  zoom: {
    clientId: process.env.ZOOM_CLIENT_ID ?? "",
    clientSecret: process.env.ZOOM_CLIENT_SECRET ?? "",
    redirectUri: process.env.ZOOM_REDIRECT_URI ?? "",
    get configured() {
      return Boolean(process.env.ZOOM_CLIENT_ID && process.env.ZOOM_CLIENT_SECRET);
    },
  },
  ai: {
    openaiKey: process.env.OPENAI_API_KEY ?? "",
    anthropicKey: process.env.ANTHROPIC_API_KEY ?? "",
    get configured() {
      return Boolean(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY);
    },
  },
  sentry: {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? "",
    org: process.env.SENTRY_ORG ?? "",
    project: process.env.SENTRY_PROJECT ?? "",
    authToken: process.env.SENTRY_AUTH_TOKEN ?? "",
    get configured() {
      return Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);
    },
  },
  posthog: {
    key: process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "",
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    get configured() {
      return Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);
    },
  },
  launch: {
    /**
     * Soft-launch waitlist gate. When set to "1", new signups must present a
     * valid invite code (validated server-side against the `waitlist` row).
     * The gate is a runtime read so flipping it in Vercel doesn't require a
     * full rebuild.
     */
    waitlistOnly: process.env.NEXT_PUBLIC_WAITLIST_ONLY === "1",
  },
  admins: (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
};

export const isProduction = process.env.NODE_ENV === "production";
export const isDevelopment = process.env.NODE_ENV === "development";
