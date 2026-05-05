"use client";

import { useState, useTransition, use } from "react";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/app/actions/auth";

export function SignupForm({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ redirect?: string }>;
}) {
  const params = use(searchParamsPromise);
  const redirect = params.redirect ?? "/dashboard";
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("redirectTo", redirect);
    startTransition(async () => {
      const res = await signUp(formData);
      if ("error" in res && res.error) setError(res.error);
      else setSent(true);
    });
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-success/30 bg-success-soft p-6 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-success/20">
          <CheckCircle2 className="size-6 text-success" />
        </div>
        <h2 className="mb-2 font-display text-h5 text-ink">Check your email</h2>
        <p className="text-label text-ink-subtle">
          We sent a confirmation link to verify your address. Open it on this device to finish.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          name="fullName"
          required
          autoComplete="name"
          placeholder="As you'd like to be greeted"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@somewhere.sacred"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <p className="text-caption text-ink-muted">8 characters minimum.</p>
      </div>
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2.5 text-label text-danger-foreground">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-danger" />
          <span>{error}</span>
        </div>
      )}
      <Button type="submit" variant="brand" size="lg" className="w-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Preparing your space...
          </>
        ) : (
          "Create account"
        )}
      </Button>
      <p className="text-caption text-ink-muted">
        By creating an account you agree to our{" "}
        <a href="/legal/terms" className="text-ink-subtle underline underline-offset-4">
          Terms
        </a>{" "}
        and{" "}
        <a href="/legal/privacy" className="text-ink-subtle underline underline-offset-4">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
}
