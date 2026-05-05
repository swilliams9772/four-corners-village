import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const env = process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV ?? "development";

if (dsn) {
  Sentry.init({
    dsn,
    environment: env,
    // Lower the trace sample rate in production so we don't burn through the
    // free Sentry quota; preview/dev keep full traces for debugging.
    tracesSampleRate: env === "production" ? 0.05 : 0.5,
    replaysSessionSampleRate: 0.0,
    replaysOnErrorSampleRate: 0.5,
    integrations: [Sentry.replayIntegration({ maskAllText: false, blockAllMedia: true })],
    // Filter ResizeObserver and other noisy browser-only errors that don't
    // represent real bugs and would otherwise flood the issue list.
    ignoreErrors: [
      "ResizeObserver loop completed with undelivered notifications",
      "ResizeObserver loop limit exceeded",
      "Non-Error promise rejection captured",
      // Network noise — usually the user navigated away mid-fetch.
      /Failed to fetch/i,
      /NetworkError when attempting to fetch/i,
      /Load failed/i,
    ],
    beforeSend(event, hint) {
      const err = hint.originalException;
      // Don't report aborted fetches — they're a normal part of route
      // transitions and Suspense.
      if (err && typeof err === "object" && "name" in err && err.name === "AbortError") {
        return null;
      }
      return event;
    },
  });
}
