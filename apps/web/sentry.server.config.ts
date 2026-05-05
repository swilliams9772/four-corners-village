import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const env = process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development";

if (dsn) {
  Sentry.init({
    dsn,
    environment: env,
    // Higher sampling on server because volume is much lower than browser
    // and per-trace value (Stripe webhook, signed URL, oracle draw) is high.
    tracesSampleRate: env === "production" ? 0.2 : 1.0,
    profilesSampleRate: env === "production" ? 0.05 : 0,
  });
}
