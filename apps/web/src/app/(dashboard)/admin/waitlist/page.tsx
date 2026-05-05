import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eyebrow, DisplayHeading } from "@/components/ui/typography";
import { createClient } from "@/lib/supabase/server";
import type { WaitlistEntry } from "@/lib/supabase/types";

export const metadata = { title: "Admin · Waitlist" };

export default async function AdminWaitlistPage() {
  const supabase = await createClient();
  let entries: WaitlistEntry[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("waitlist")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    entries = (data as WaitlistEntry[] | null) ?? [];
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Eyebrow>Admin</Eyebrow>
      <DisplayHeading level={1} size="h2" className="mt-3 mb-9 flex items-baseline gap-3">
        Waitlist
        <span className="font-mono text-h6 text-ink-muted tabular-nums">
          {entries.length}
        </span>
      </DisplayHeading>

      <Card variant="default">
        <CardContent className="p-0">
          {entries.length === 0 ? (
            <p className="px-6 py-7 text-caption text-ink-muted">
              No waitlist signups yet.
            </p>
          ) : (
            <div className="divide-y divide-subtle">
              {entries.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between gap-3 px-6 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{e.email}</p>
                    <p className="text-caption text-ink-muted">
                      {new Date(e.created_at).toLocaleString()}
                    </p>
                  </div>
                  {e.interest && (
                    <Badge variant="outline" className="shrink-0 capitalize">
                      {e.interest}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
