import { notFound } from "next/navigation";
import Link from "next/link";
import { Play, Clock, Check, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eyebrow, DisplayHeading } from "@/components/ui/typography";
import { Reveal } from "@/components/ui/reveal";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { formatDuration, formatPrice, cn } from "@/lib/utils";
import { enrollOrCheckout } from "@/app/actions/courses";
import type { Course, CourseModule, CourseLesson, Practitioner } from "@/lib/supabase/types";

export const revalidate = 60;

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string; courseSlug: string }>;
}) {
  const { slug, courseSlug } = await params;
  const session = await getCurrentUser();

  const supabase = await createClient();
  if (!supabase) notFound();

  const { data: pData } = await supabase
    .from("practitioners")
    .select("*")
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle();
  const practitioner = pData as Practitioner | null;
  if (!practitioner) notFound();

  const { data: cData } = await supabase
    .from("courses")
    .select("*")
    .eq("practitioner_id", practitioner.id)
    .eq("slug", courseSlug)
    .eq("is_published", true)
    .maybeSingle();
  const course = cData as Course | null;
  if (!course) notFound();

  const { data: mData } = await supabase
    .from("course_modules")
    .select("*, course_lessons(*)")
    .eq("course_id", course.id)
    .order("display_order");
  const modules =
    (mData as (CourseModule & { course_lessons: CourseLesson[] })[] | null) ?? [];

  let isEnrolled = false;
  if (session) {
    const { data } = await supabase
      .from("course_enrollments")
      .select("course_id")
      .eq("user_id", session.user.id)
      .eq("course_id", course.id)
      .maybeSingle();
    isEnrolled = !!data;
  }

  const totalLessons = modules.reduce((acc, m) => acc + (m.course_lessons?.length ?? 0), 0);
  const totalDuration = modules.reduce(
    (acc, m) => acc + (m.course_lessons?.reduce((a, l) => a + (l.duration_seconds ?? 0), 0) ?? 0),
    0,
  );

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-32 sm:px-6 lg:px-10">
      <Link
        href={`/v/${practitioner.slug}`}
        className="group/link mb-8 inline-flex items-center gap-2 text-caption uppercase tracking-widest text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-3.5 transition-transform group-hover/link:-translate-x-0.5" />
        {practitioner.display_name}
      </Link>

      <Reveal>
        <Eyebrow>Course</Eyebrow>
        <DisplayHeading level={1} size="h1" className="mt-3 leading-[1.05]">
          {course.title}
        </DisplayHeading>
        {course.description && (
          <p className="mt-5 text-body-lg text-ink-subtle text-pretty">{course.description}</p>
        )}
      </Reveal>

      <div className="mt-7 mb-10 flex flex-wrap items-center gap-2">
        <Badge variant="outline" size="md">
          {modules.length} {modules.length === 1 ? "module" : "modules"}
        </Badge>
        <Badge variant="outline" size="md">
          {totalLessons} {totalLessons === 1 ? "lesson" : "lessons"}
        </Badge>
        {totalDuration > 0 && (
          <Badge variant="outline" size="md">
            <Clock className="size-3" />
            {formatDuration(totalDuration)}
          </Badge>
        )}
        {course.price_cents > 0 ? (
          <Badge variant="lunar" size="md">
            {formatPrice(course.price_cents)}
          </Badge>
        ) : (
          <Badge variant="earth" size="md">
            Free
          </Badge>
        )}
      </div>

      {!isEnrolled ? (
        <form action={enrollOrCheckout} className="mb-12">
          <input type="hidden" name="course_id" value={course.id} />
          <Button type="submit" variant="brand" size="lg">
            {course.price_cents > 0
              ? `Enroll for ${formatPrice(course.price_cents)}`
              : "Enroll free"}
          </Button>
        </form>
      ) : (
        <div className="mb-12">
          <Badge variant="earth" size="md">
            <Check className="size-3.5" /> Enrolled
          </Badge>
        </div>
      )}

      <div className="space-y-4">
        {modules.map((m, idx) => (
          <Card key={m.id} variant="default">
            <CardHeader className="flex-row items-baseline gap-3">
              <span className="font-display text-h6 text-ink-muted tabular-nums">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <CardTitle className="text-h5">{m.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {m.course_lessons?.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between rounded-xl border border-subtle p-3.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full",
                        isEnrolled
                          ? "bg-air/15 text-air ring-1 ring-air/30"
                          : "bg-glass text-ink-muted ring-1 ring-subtle",
                      )}
                    >
                      <Play className="size-3.5 fill-current" />
                    </span>
                    <span className="truncate text-label">{l.title}</span>
                  </div>
                  {l.duration_seconds && (
                    <span className="ml-3 flex shrink-0 items-center gap-1 text-caption text-ink-muted tabular-nums">
                      <Clock className="size-3" /> {formatDuration(l.duration_seconds)}
                    </span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
