"use client";

import { useState, useTransition, use } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithPassword, signInWithProvider } from "@/app/actions/auth";
import { toast } from "@/components/ui/sonner";

export function LoginForm({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ redirect?: string }>;
}) {
  const params = use(searchParamsPromise);
  const redirect = params.redirect ?? "/dashboard";
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("redirectTo", redirect);
    startTransition(async () => {
      const res = await signInWithPassword(formData);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="space-y-5">
      {/* Social-first ordering — most users sign in via Google/Apple */}
      <div className="grid gap-3">
        <Button
          variant="outline"
          size="lg"
          className="w-full justify-center"
          onClick={() => {
            startTransition(async () => {
              const r = await signInWithProvider("google", redirect);
              if (r && "error" in r && r.error) toast.error(r.error);
            });
          }}
        >
          <GoogleIcon />
          Continue with Google
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full justify-center"
          onClick={() => {
            startTransition(async () => {
              const r = await signInWithProvider("apple", redirect);
              if (r && "error" in r && r.error) toast.error(r.error);
            });
          }}
        >
          <AppleIcon />
          Continue with Apple
        </Button>
      </div>

      <div className="relative my-7" aria-hidden>
        <div className="hairline" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-canvas px-3 text-caption uppercase tracking-widest text-ink-muted">
          or with email
        </span>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <a href="#" className="text-caption text-ink-muted hover:text-ink-subtle">
              Forgot?
            </a>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
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
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#FFC107"
        d="M21.8 10H12v4h5.6c-.5 2.5-2.7 4-5.6 4a6 6 0 1 1 4-10.5l3-3A10 10 0 1 0 22 12c0-.7-.1-1.4-.2-2z"
      />
      <path
        fill="#FF3D00"
        d="m4.5 7.6 3.3 2.4A6 6 0 0 1 12 8c1.5 0 2.9.6 4 1.5l3-3A10 10 0 0 0 4.5 7.6z"
      />
      <path
        fill="#4CAF50"
        d="M12 22a10 10 0 0 0 6.7-2.6l-3-2.6c-1 .7-2.3 1.2-3.7 1.2-2.9 0-5.4-1.7-6.4-4l-3.3 2.6A10 10 0 0 0 12 22z"
      />
      <path
        fill="#1976D2"
        d="M21.8 10H12v4h5.6c-.3 1.4-1 2.6-2.1 3.4l3 2.6c1.7-1.5 3-4 3-7-.1-.7-.2-1.4-.7-3z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.4 2.7c0 1-.4 2-1 2.7-.8 1-2 1.7-3.1 1.6-.1-1 .4-2 1-2.7.8-.9 2-1.6 3.1-1.6zM20 17.4c-.5 1.2-.8 1.7-1.5 2.8-1 1.5-2.4 3.4-4 3.4-1.5 0-1.9-1-4-1-2 0-2.5 1-4 1-1.7 0-3-1.7-4-3.2-2.6-4-3-8.6-1.3-11 1.2-1.8 3-2.8 4.8-2.8 1.8 0 2.9 1 4.4 1 1.4 0 2.3-1 4.4-1 1.5 0 3.2.9 4.3 2.3-3.8 2.1-3.2 7.5.9 8.5z" />
    </svg>
  );
}
