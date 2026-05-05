/**
 * Next.js instrumentation hook. Boots Sentry per runtime when a DSN is set.
 *
 * Inlining the init calls (rather than dynamic-importing sentry.{server,edge}.config.ts)
 * avoids a Turbopack quirk where extension-less dynamic imports fail to resolve.
 */
export async function register() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  const Sentry = await import("@sentry/nextjs");

  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
    });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
    });
  }
}

export async function onRequestError(
  err: unknown,
  request: { path: string; method: string; headers: { [key: string]: string } },
  context: {
    routerKind: "Pages Router" | "App Router";
    routePath: string;
    routeType: "render" | "route" | "action" | "middleware";
  },
) {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(err, request, context);
}
