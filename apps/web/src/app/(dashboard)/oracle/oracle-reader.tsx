"use client";

import { useState, useTransition } from "react";
import { Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { drawOracleReading } from "@/app/actions/oracle";
import type { DrawnCard } from "@/lib/oracle/cards";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

export function OracleReader() {
  const [question, setQuestion] = useState("");
  const [reading, setReading] = useState<{ cards: DrawnCard[]; interpretation: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDraw() {
    startTransition(async () => {
      const r = await drawOracleReading({ question: question || undefined, spread: "three" });
      if ("error" in r && r.error) {
        toast.error(r.error);
        return;
      }
      if ("ok" in r && r.ok) {
        setReading({ cards: r.cards, interpretation: r.interpretation });
      }
    });
  }

  if (!reading) {
    return (
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="q">Your question (optional)</Label>
          <Textarea
            id="q"
            placeholder="What does my heart most need to know today?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
          />
          <p className="text-caption text-ink-muted">
            A clearer question often draws a clearer card. You may also leave it open.
          </p>
        </div>
        <Button onClick={handleDraw} variant="brand" size="lg" disabled={pending} className="w-full">
          <Sparkles className="size-4" />
          {pending ? "Drawing the cards…" : "Draw three cards"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-3">
        {reading.cards.map((c, i) => (
          <article
            key={c.card.name + c.position}
            className="group/card relative overflow-hidden rounded-2xl border border-strong bg-gradient-to-br from-lunar/15 via-canvas-subtle to-fire/10 p-5 shadow-altar"
            style={{ animation: `fade-in-up 0.7s var(--ease-silk) ${i * 0.18}s both` }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-12 -right-12 size-36 rounded-full bg-lunar/30 opacity-50 blur-3xl transition-opacity group-hover/card:opacity-90"
            />
            <p className="relative text-caption uppercase tracking-widest text-ink-muted">
              {c.position}
            </p>
            <p className="relative mt-2 font-display text-h5 leading-tight text-ink">
              {c.card.name}
              {c.reversed && (
                <span className="ml-2 align-middle font-mono text-caption text-lunar">
                  reversed
                </span>
              )}
            </p>
            <ul className="relative mt-4 space-y-1.5">
              {(c.reversed ? c.card.reversed : c.card.upright).map((kw) => (
                <li
                  key={kw}
                  className="flex items-center gap-2 text-label text-ink-subtle"
                >
                  <span
                    className={cn(
                      "size-1 shrink-0 rounded-full",
                      c.reversed ? "bg-lunar" : "bg-fire",
                    )}
                  />
                  {kw}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="rounded-2xl border border-lunar/30 bg-lunar/[0.04] p-7">
        <p className="mb-3 inline-flex items-center gap-2 text-caption uppercase tracking-widest text-lunar">
          <span className="block h-px w-6 bg-lunar/60" /> Interpretation
        </p>
        <p className="whitespace-pre-line font-display text-body-lg leading-relaxed text-ink text-pretty">
          {reading.interpretation}
        </p>
      </div>

      <Button
        variant="outline"
        size="lg"
        onClick={() => {
          setReading(null);
          setQuestion("");
        }}
        className="w-full"
      >
        <RotateCcw className="size-4" />
        Draw another
      </Button>
    </div>
  );
}
