import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Eyebrow, DisplayHeading } from "@/components/ui/typography";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import type { Course, CourseLesson, CourseModule, Practitioner } from "@/lib/supabase/types";
import { CourseEditor } from "./course-editor";

export const metadata = { title: "Edit Course" };

export default async function PractitionerCourseEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getCurrentUser();
  if (!session) redirect("/login");

  const supabase = await createClient();
  if (!supabase) redirect("/dashboard");

  const { data: pData } = await supabase
    .from("practitioners")
    .select("*")
    .eq("user_id", session.user.id)
    .maybeSingle();
  const practitioner = pData as Practitioner | null;
  if (!practitioner) redirect("/practitioners/apply");

  const { data: cData } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .eq("practitioner_id", practitioner.id)
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

  // Sort lessons by display_order inside each module — Postgres can't order
  // nested arrays, so we do it client-side here.
  const sortedModules = modules.map((m) => ({
    ...m,
    course_lessons: [...(m.course_lessons ?? [])].sort(
      (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
    ),
  }));

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href="/practitioner/courses"
        className="group/link mb-6 inline-flex items-center gap-2 text-caption uppercase tracking-widest text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-3.5 transition-transform group-hover/link:-translate-x-0.5" />
        Back to courses
      </Link>

      <div className="mb-2 flex flex-wrap items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-earth-soft text-earth ring-1 ring-earth/30">
          <BookOpen className="size-5" />
        </span>
        <Eyebrow>Course editor</Eyebrow>
      </div>
      <DisplayHeading level={1} size="h2" className="mt-3 flex flex-wrap items-baseline gap-3">
        {course.title}
        {course.is_published ? (
          <Badge variant="earth">Live</Badge>
        ) : (
          <Badge variant="outline">Draft</Badge>
        )}
      </DisplayHeading>
      <p className="mt-2 text-caption text-ink-muted tabular-nums">
        {course.price_cents > 0 ? formatPrice(course.price_cents) : "Free"}
        {" · "}
        {sortedModules.length} {sortedModules.length === 1 ? "module" : "modules"}
      </p>

      {course.is_published && (
        <Card variant="outline" className="mt-7 border-earth/30 bg-earth-soft">
          <CardContent className="p-4">
            <p className="text-caption text-ink">
              This course is live.{" "}
              <Link
                href={`/v/${practitioner.slug}/courses/${course.slug}`}
                className="text-air underline-offset-2 hover:underline"
                target="_blank"
              >
                View public page →
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      <div className="mt-8">
        <CourseEditor course={course} modules={sortedModules} />
      </div>
    </div>
  );
}
