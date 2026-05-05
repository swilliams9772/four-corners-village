"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[error boundary]", error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-center">
      <h1 className="mb-2 text-3xl font-bold">Something went sideways.</h1>
      <p className="mb-6 max-w-md text-slate-400">
        We've logged the issue. Please try again.
      </p>
      {error.digest && <p className="mb-6 font-mono text-xs text-slate-600">ref: {error.digest}</p>}
      <Button variant="brand" onClick={reset}>Try again</Button>
    </div>
  );
}
