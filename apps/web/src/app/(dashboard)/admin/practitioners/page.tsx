import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eyebrow, DisplayHeading } from "@/components/ui/typography";
import { ApproveButtons } from "./approve-buttons";
import { createClient } from "@/lib/supabase/server";
import { tierStyles } from "@four-corners/ui-primitives";
import type { Practitioner } from "@/lib/supabase/types";

export const metadata = { title: "Admin · Practitioners" };

export default async function AdminPractitionersPage() {
  const supabase = await createClient();
  let pending: Practitioner[] = [];
  let approved: Practitioner[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("practitioners")
      .select("*")
      .order("created_at", { ascending: false });
    const all = (data as Practitioner[] | null) ?? [];
    pending = all.filter((p) => p.status === "pending");
    approved = all.filter((p) => p.status === "approved");
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <Eyebrow>Admin</Eyebrow>
      <DisplayHeading level={1} size="h2" className="mt-3 mb-9">
        Practitioner applications
      </DisplayHeading>

      <Card variant="default" className="mb-6">
        <CardHeader>
          <CardTitle>
            Pending review{" "}
            <span className="ml-1 font-mono text-caption text-ink-muted tabular-nums">
              ({pending.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {pending.length === 0 ? (
            <p className="px-6 py-7 text-caption text-ink-muted">No pending applications.</p>
          ) : (
            <div className="divide-y divide-subtle">
              {pending.map((p) => {
                const tier = tierStyles[p.tier];
                return (
                  <div
                    key={p.id}
                    className="flex flex-col items-start justify-between gap-4 px-6 py-5 sm:flex-row"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-display text-h6 text-ink">{p.display_name}</p>
                        <Badge variant="outline" className={tier.className}>
                          {tier.label}
                        </Badge>
                      </div>
                      {p.tagline && (
                        <p className="mt-1 text-caption text-ink-subtle">{p.tagline}</p>
                      )}
                      {p.bio && (
                        <p className="mt-3 line-clamp-3 text-label text-ink-muted">{p.bio}</p>
                      )}
                    </div>
                    <ApproveButtons practitionerId={p.id} />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card variant="default">
        <CardHeader>
          <CardTitle>
            Approved{" "}
            <span className="ml-1 font-mono text-caption text-ink-muted tabular-nums">
              ({approved.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {approved.length === 0 ? (
            <p className="px-6 py-7 text-caption text-ink-muted">No approved practitioners yet.</p>
          ) : (
            <div className="divide-y divide-subtle">
              {approved.map((p) => {
                const tier = tierStyles[p.tier];
                return (
                  <Link
                    key={p.id}
                    href={`/v/${p.slug}`}
                    className="flex items-center justify-between gap-3 px-6 py-4 transition-colors hover:bg-glass"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{p.display_name}</p>
                      <p className="font-mono text-caption text-ink-muted">/v/{p.slug}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="outline" className={tier.className}>
                        {tier.label}
                      </Badge>
                      {p.stripe_connect_onboarded ? (
                        <Badge variant="earth">Stripe ready</Badge>
                      ) : (
                        <Badge variant="outline">Stripe pending</Badge>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
