"use client";

import { useEffect, useState, useTransition } from "react";
import { Flame, Heart, Sparkles, Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { placeOffering } from "@/app/actions/altar";
import type { AltarOffering } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

const offeringTypes = [
  {
    id: "candle",
    label: "Candle",
    icon: Flame,
    iconClass: "text-fire",
    activeClass: "border-fire/40 bg-fire/5 text-fire",
    glow: "from-fire/30",
  },
  {
    id: "prayer",
    label: "Prayer",
    icon: Sparkles,
    iconClass: "text-lunar",
    activeClass: "border-lunar/40 bg-lunar/5 text-lunar",
    glow: "from-lunar/30",
  },
  {
    id: "flower",
    label: "Flower",
    icon: Heart,
    iconClass: "text-fire",
    activeClass: "border-fire/40 bg-fire/5 text-fire",
    glow: "from-fire/30",
  },
  {
    id: "crystal",
    label: "Crystal",
    icon: Star,
    iconClass: "text-air",
    activeClass: "border-air/40 bg-air/5 text-air",
    glow: "from-air/30",
  },
  {
    id: "intention",
    label: "Intention",
    icon: Send,
    iconClass: "text-earth",
    activeClass: "border-earth/40 bg-earth/5 text-earth",
    glow: "from-earth/30",
  },
] as const;

export function AltarBoard({
  altarId,
  initialOfferings,
}: {
  altarId: string;
  initialOfferings: AltarOffering[];
}) {
  const [offerings, setOfferings] = useState(initialOfferings);
  const [type, setType] = useState<typeof offeringTypes[number]["id"]>("candle");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`altar:${altarId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "altar_offerings", filter: `altar_id=eq.${altarId}` },
        (payload) => {
          setOfferings((prev) => [payload.new as AltarOffering, ...prev]);
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [altarId]);

  function handleOffer() {
    startTransition(async () => {
      const r = await placeOffering({ altarId, offeringType: type, message: message || null });
      if ("ok" in r && r.ok) {
        setMessage("");
      }
    });
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-subtle bg-canvas-subtle p-5">
        <div className="flex items-center gap-2">
          <span className="block h-px w-8 bg-border-strong" />
          <p className="text-caption uppercase tracking-widest text-ink-muted">
            Place an offering
          </p>
        </div>
        <div className="mt-4 mb-4 flex flex-wrap gap-2">
          {offeringTypes.map((t) => {
            const Icon = t.icon;
            const active = type === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-label transition-colors duration-quick",
                  active
                    ? t.activeClass
                    : "border-subtle text-ink-subtle hover:border-strong hover:text-ink",
                )}
              >
                <Icon className={cn("size-3.5", active ? "" : t.iconClass)} />
                {t.label}
              </button>
            );
          })}
        </div>
        <Textarea
          rows={2}
          placeholder="A word, a name, an intention (optional)…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={200}
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-caption text-ink-muted tabular-nums">
            {message.length}/200
          </span>
          <Button variant="brand" size="sm" disabled={pending} onClick={handleOffer}>
            {pending ? "Placing…" : "Place offering"}
          </Button>
        </div>
      </div>

      <div>
        <div className="mb-5 flex items-baseline justify-between">
          <p className="text-caption uppercase tracking-widest text-ink-muted">
            Active offerings
          </p>
          <span className="font-mono text-caption text-ink tabular-nums">
            {offerings.length}
          </span>
        </div>
        {offerings.length === 0 ? (
          <p className="rounded-xl border border-dashed border-subtle p-8 text-center text-caption text-ink-muted">
            The altar is quiet. Be the first to make an offering.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {offerings.map((o) => {
              const def =
                offeringTypes.find((t) => t.id === o.offering_type) ?? offeringTypes[0];
              const Icon = def.icon;
              return (
                <div
                  key={o.id}
                  className="group/offering relative overflow-hidden rounded-xl border border-subtle bg-canvas p-4 transition-colors duration-quick hover:border-strong"
                >
                  <div
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute -top-12 -right-10 size-32 rounded-full opacity-50 blur-2xl transition-opacity duration-slow group-hover/offering:opacity-90",
                      "bg-gradient-to-br to-transparent",
                      def.glow,
                    )}
                  />
                  <div className="relative">
                    <div className="mb-2 flex items-center gap-2">
                      <Icon
                        className={cn(
                          "size-4 animate-[pulse_3s_ease-in-out_infinite]",
                          def.iconClass,
                        )}
                      />
                      <span className="text-caption uppercase tracking-widest text-ink-muted">
                        {def.label}
                      </span>
                    </div>
                    {o.message ? (
                      <p className="line-clamp-3 font-display text-body text-ink leading-snug">
                        {o.message}
                      </p>
                    ) : (
                      <p className="font-display text-body italic text-ink-muted">— silence —</p>
                    )}
                    <p className="mt-3 text-caption text-ink-muted tabular-nums">
                      {formatRelative(o.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
