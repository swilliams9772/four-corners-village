import { Search } from "lucide-react";
import { PosterCard } from "@/components/tv/poster-card";
import { Card } from "@/components/ui/card";
import { DisplayHeading, Eyebrow } from "@/components/ui/typography";
import { createClient } from "@/lib/supabase/server";
import { DEV_VIDEOS } from "@/lib/dev-data";
import type { Video } from "@/lib/supabase/types";

export const metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const supabase = await createClient();
  let results: Video[] = [];

  if (query) {
    if (supabase) {
      const { data } = await supabase
        .from("videos")
        .select("*")
        .eq("is_published", true)
        .or(`title.ilike.%${query}%,synopsis.ilike.%${query}%`)
        .limit(48);
      results = (data as Video[] | null) ?? [];
    } else {
      const lc = query.toLowerCase();
      results = DEV_VIDEOS.filter(
        (v) =>
          v.title.toLowerCase().includes(lc) ||
          (v.synopsis ?? "").toLowerCase().includes(lc),
      );
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-10">
      <header className="mb-10">
        <Eyebrow>
          <Search className="size-3" />
          Search
        </Eyebrow>
        <DisplayHeading level={1} size="h2">
          {query ? <>Results for &ldquo;{query}&rdquo;</> : "Search the library"}
        </DisplayHeading>
        {!query && (
          <p className="mt-3 text-body text-ink-subtle">
            Use the search icon in the header to find titles by name or synopsis.
          </p>
        )}
      </header>

      {results.length === 0 && query ? (
        <Card variant="glass" className="mx-auto max-w-md p-12 text-center">
          <p className="text-body text-ink-subtle">No titles match that query.</p>
          <p className="mt-2 text-caption text-ink-muted">
            Try another keyword, or browse the library.
          </p>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {results.map((v) => (
            <PosterCard key={v.id} video={v} />
          ))}
        </div>
      )}
    </div>
  );
}
