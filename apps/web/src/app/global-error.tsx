"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

/**
 * Top-level error boundary. Next 16 requires this file to provide its own
 * <html>/<body> because the root layout has been crashed past. Keep it bare —
 * fonts, themes, and providers are unavailable here.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global error boundary]", error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "#0f172a",
          color: "#e2e8f0",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: "0.5rem", fontSize: "1.875rem", fontWeight: 700 }}>
          Something broke at the foundation.
        </h1>
        <p style={{ marginBottom: "1.5rem", maxWidth: 28 * 16, color: "#94a3b8" }}>
          The page couldn't render at all. We've logged it. Please try again.
        </p>
        {error.digest && (
          <p
            style={{
              marginBottom: "1.5rem",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: "0.75rem",
              color: "#475569",
            }}
          >
            ref: {error.digest}
          </p>
        )}
        <button
          onClick={() => reset()}
          style={{
            padding: "0.625rem 1.25rem",
            background: "#fbbf24",
            color: "#0f172a",
            border: "none",
            borderRadius: "0.5rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
