import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eyebrow, DisplayHeading } from "@/components/ui/typography";
import { createClient } from "@/lib/supabase/server";
import { updateVideo } from "@/app/actions/tv-admin";
import type { Video, VideoCategory, VideoSeries } from "@/lib/supabase/types";

export const metadata = { title: "Edit Video" };

export default async function EditVideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  if (!supabase) notFound();

  const [{ data: video }, { data: cats }, { data: ser }] = await Promise.all([
    supabase.from("videos").select("*").eq("id", id).maybeSingle(),
    supabase.from("video_categories").select("*").order("display_order"),
    supabase.from("video_series").select("*").order("title"),
  ]);

  if (!video) notFound();

  const v = video as Video;
  const categories = (cats as VideoCategory[] | null) ?? [];
  const series = (ser as VideoSeries[] | null) ?? [];

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/admin/tv"
        className="group/link mb-6 inline-flex items-center gap-2 text-caption uppercase tracking-widest text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-3.5 transition-transform group-hover/link:-translate-x-0.5" />
        Back to library
      </Link>
      <Eyebrow>Vintage TV</Eyebrow>
      <DisplayHeading level={1} size="h2" className="mt-3 mb-9">
        {v.title}
      </DisplayHeading>

      <Card variant="default">
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateVideo} className="space-y-5">
            <input type="hidden" name="id" value={v.id} />
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={v.title} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="synopsis">Synopsis</Label>
              <Textarea id="synopsis" name="synopsis" rows={6} defaultValue={v.synopsis ?? ""} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category_id">Category</Label>
                <Select name="category_id" defaultValue={v.category_id ?? ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="series_id">Series</Label>
                <Select name="series_id" defaultValue={v.series_id ?? ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Standalone" />
                  </SelectTrigger>
                  <SelectContent>
                    {series.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="season_number">Season #</Label>
                <Input
                  id="season_number"
                  name="season_number"
                  type="number"
                  min={1}
                  defaultValue={v.season_number}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="episode_number">Episode #</Label>
                <Input
                  id="episode_number"
                  name="episode_number"
                  type="number"
                  min={1}
                  defaultValue={v.episode_number ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="release_date">Release date</Label>
                <Input
                  id="release_date"
                  name="release_date"
                  type="datetime-local"
                  defaultValue={v.release_date ? v.release_date.slice(0, 16) : ""}
                />
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <input
                id="is_published"
                name="is_published"
                type="checkbox"
                defaultChecked={v.is_published}
                className="size-4 rounded border-strong bg-canvas accent-air"
              />
              <Label htmlFor="is_published" className="cursor-pointer">
                Published (visible to subscribers)
              </Label>
            </div>
            <Button type="submit" variant="brand">
              Save
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card variant="sunken" className="mt-6">
        <CardHeader>
          <CardTitle className="text-h6">Cloudflare details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-label sm:grid-cols-[140px_1fr]">
            <dt className="text-caption uppercase tracking-widest text-ink-muted">Stream UID</dt>
            <dd className="font-mono text-caption text-ink">{v.stream_uid ?? "—"}</dd>
            <dt className="text-caption uppercase tracking-widest text-ink-muted">Duration</dt>
            <dd className="tabular-nums text-ink">
              {v.duration_seconds
                ? `${Math.floor(v.duration_seconds / 60)}m ${v.duration_seconds % 60}s`
                : "—"}
            </dd>
            <dt className="text-caption uppercase tracking-widest text-ink-muted">Created</dt>
            <dd className="text-ink">{new Date(v.created_at).toLocaleString()}</dd>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
