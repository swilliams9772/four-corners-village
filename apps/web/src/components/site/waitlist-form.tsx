"use client";

import * as React from "react";
import { Loader2, Sparkle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { joinWaitlist } from "@/app/actions/waitlist";

export function WaitlistForm({
  interest = "all",
}: {
  interest?: "member" | "practitioner" | "tv" | "all";
}) {
  const [email, setEmail] = React.useState("");
  const [pending, startTransition] = React.useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const result = await joinWaitlist({ email, interest });
      if (result.ok) {
        toast.success("You're on the list", {
          description: "Check your inbox for a confirmation. We'll be in touch.",
        });
        setEmail("");
      } else {
        toast.error("Something went astray", {
          description: result.error ?? "Try again in a moment.",
        });
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Sparkle
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
          aria-hidden
        />
        <Input
          type="email"
          required
          placeholder="you@somewhere.sacred"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 pl-11 text-body"
          aria-label="Email address"
        />
      </div>
      <Button type="submit" variant="brand" size="lg" disabled={pending} className="sm:px-7">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Sending...
          </>
        ) : (
          "Join the village"
        )}
      </Button>
    </form>
  );
}
