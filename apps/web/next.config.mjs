import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "videodelivery.net" },
      { protocol: "https", hostname: "customer-*.cloudflarestream.com" },
      { protocol: "https", hostname: "imagedelivery.net" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        // Apple Universal Links require this exact path served as JSON
        // without an extension. Next normally guesses; we force JSON here.
        source: "/.well-known/apple-app-site-association",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
      {
        source: "/.well-known/assetlinks.json",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
    ];
  },
};

const sentryEnabled = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);

// Only wrap when a DSN is present; otherwise the build (and especially `npm run dev`
// without keys) shouldn't pay for source-map upload setup or noisy Sentry warnings.
export default sentryEnabled
  ? withSentryConfig(nextConfig, {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      // Avoid uploading source maps without an auth token (typical local builds).
      sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
      // Hide source maps from public network traffic.
      hideSourceMaps: true,
      // Tunnel client requests through a Next route to bypass ad-blockers.
      tunnelRoute: "/monitoring",
      disableLogger: true,
    })
  : nextConfig;
