import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Course } from "@/lib/supabase/types";

export const metadata = { title: "My Courses" };

export default async function MyCoursesPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/login");

  const supabase = await createClient();
  let enrolled: (Course & { practitioner_slug?: string })[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("course_enrollments")
      .select("course_id, courses(*, practitioners(slug))")
      .eq("user_id", session.user.id);
    enrolled = (data ?? []).map((row) => {
      const c = (row as unknown as { courses: Course & { practitioners?: { slug: string } } }).courses;
      return { ...c, practitioner_slug: c.practitioners?.slug };
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center gap-3">
        <BookOpen className="h-7 w-7 text-emerald-400" />
        <h1 className="text-2xl font-semibold">My Courses</h1>
      </div>

      {enrolled.length === 0 ? (
        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="p-12 text-center">
            <p className="mb-4 text-slate-400">You haven't enrolled in any courses yet.</p>
            <Button asChild variant="earth">
              <Link href="/practitioners">Browse Practitioners</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {enrolled.map((c) => (
            <Link key={c.id} href={`/v/${c.practitioner_slug}/courses/${c.slug}`}>
              <Card className="border-slate-700 bg-slate-800/50 transition-colors hover:border-emerald-500/50">
                <CardContent className="p-6">
                  <h3 className="mb-2 text-lg font-semibold">{c.title}</h3>
                  {c.description && <p className="mb-3 text-sm text-slate-400">{c.description}</p>}
                  <Badge variant="default">Enrolled</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
