import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eyebrow, DisplayHeading } from "@/components/ui/typography";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createCourse } from "@/app/actions/practitioner-courses";
import { formatPrice } from "@/lib/utils";
import type { Course, Practitioner } from "@/lib/supabase/types";

export const metadata = { title: "My Courses (Practitioner)" };

export default async function PractitionerCoursesPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/login");
  const supabase = await createClient();
  if (!supabase) redirect("/dashboard");

  const { data: pData } = await supabase
    .from("practitioners")
    .select("*")
    .eq("user_id", session.user.id)
    .maybeSingle();
  const p = pData as Practitioner | null;
  if (!p) redirect("/practitioners/apply");

  if (p.tier === "initiate") {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <Eyebrow>Upgrade required</Eyebrow>
        <DisplayHeading level={1} size="h3" className="mt-3">
          Course hosting needs the Guide tier
        </DisplayHeading>
        <p className="mt-3 text-body text-ink-subtle text-pretty">
          Upgrade to Guide ($149/mo) or Sanctuary ($399/mo) to host courses inside your space.
        </p>
        <Button asChild variant="brand" className="mt-7">
          <Link href="/pricing">View tiers</Link>
        </Button>
      </div>
    );
  }

  const { data: cData } = await supabase
    .from("courses")
    .select("*")
    .eq("practitioner_id", p.id)
    .order("created_at", { ascending: false });
  const courses = (cData as Course[] | null) ?? [];

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-9 flex items-center gap-3">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-earth-soft text-earth ring-1 ring-earth/30">
          <BookOpen className="size-5" />
        </span>
        <div>
          <Eyebrow>Practitioner</Eyebrow>
          <DisplayHeading level={1} size="h2" className="mt-2">
            My courses
          </DisplayHeading>
        </div>
      </div>

      <Card variant="default" className="mb-8">
        <CardContent className="p-6">
          <h2 className="mb-5 font-display text-h5 text-ink">Create a new course</h2>
          <form action={createCourse} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (USD)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={0}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={3} />
            </div>
            <Button type="submit" variant="brand">
              <Plus className="size-4" /> Create
            </Button>
          </form>
        </CardContent>
      </Card>

      {courses.length === 0 ? (
        <Card variant="sunken">
          <CardContent className="p-10 text-center text-caption text-ink-muted">
            No courses yet — your first offering begins above.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {courses.map((c) => (
            <Link key={c.id} href={`/practitioner/courses/${c.id}`} className="block">
              <Card variant="default" className="transition-colors hover:border-strong">
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="font-medium text-ink">{c.title}</p>
                    <p className="mt-0.5 text-caption text-ink-muted">
                      {c.price_cents > 0 ? formatPrice(c.price_cents) : "Free"} ·{" "}
                      {c.is_published ? "Published" : "Draft"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {c.is_published ? (
                      <Badge variant="earth">Live</Badge>
                    ) : (
                      <Badge variant="outline">Draft</Badge>
                    )}
                    <ChevronRight className="size-4 text-ink-muted" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
