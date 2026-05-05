"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import {
  createDirectUpload,
  deleteVideo as deleteCfVideo,
  getVideo,
} from "@/lib/cloudflare/stream";
import type { Practitioner } from "@/lib/supabase/types";

/**
 * Resolves the current practitioner profile and asserts they own the course.
 * Throws on any auth/ownership failure so callers don't have to repeat checks.
 */
async function requirePractitionerOwnership(
  courseId: string,
): Promise<{ practitioner: Practitioner }> {
  const session = await getCurrentUser();
  if (!session) throw new Error("Not authenticated");

  const supabase = await createClient();
  if (!supabase) throw new Error("Not configured");

  const { data: pData } = await supabase
    .from("practitioners")
    .select("*")
    .eq("user_id", session.user.id)
    .maybeSingle();
  const practitioner = pData as Practitioner | null;
  if (!practitioner) throw new Error("Not a practitioner");

  const { data: course } = await supabase
    .from("courses")
    .select("id, practitioner_id, is_published")
    .eq("id", courseId)
    .maybeSingle();
  if (!course) throw new Error("Course not found");
  if (course.practitioner_id !== practitioner.id) throw new Error("Forbidden");

  return { practitioner };
}

async function requirePractitionerForCreate(): Promise<Practitioner> {
  const session = await getCurrentUser();
  if (!session) throw new Error("Not authenticated");
  const supabase = await createClient();
  if (!supabase) throw new Error("Not configured");
  const { data } = await supabase
    .from("practitioners")
    .select("*")
    .eq("user_id", session.user.id)
    .maybeSingle();
  const p = data as Practitioner | null;
  if (!p) throw new Error("Not a practitioner");
  if (p.tier === "initiate") throw new Error("Guide tier required");
  return p;
}

/** Two-hop lookup: lesson -> module -> course_id. Lets us avoid Supabase's
 * fragile join typing in `select(... !inner(...))` chains. */
async function getCourseIdForLesson(
  supabase: ReturnType<typeof createServiceClient>,
  lessonId: string,
): Promise<{ courseId: string; moduleId: string; streamUid: string | null } | null> {
  const { data: lesson } = await supabase
    .from("course_lessons")
    .select("module_id, stream_uid")
    .eq("id", lessonId)
    .maybeSingle();
  if (!lesson) return null;
  const moduleId = lesson.module_id as string;
  const { data: mod } = await supabase
    .from("course_modules")
    .select("course_id")
    .eq("id", moduleId)
    .maybeSingle();
  if (!mod) return null;
  return {
    courseId: mod.course_id as string,
    moduleId,
    streamUid: (lesson.stream_uid as string | null) ?? null,
  };
}

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------

const courseSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  price: z.coerce.number().min(0).max(10000),
});

export async function createCourse(formData: FormData) {
  const practitioner = await requirePractitionerForCreate();

  const parsed = courseSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? undefined,
    price: formData.get("price") ?? 0,
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const supabase = await createClient();
  if (!supabase) throw new Error("Not configured");

  await supabase.from("courses").insert({
    practitioner_id: practitioner.id,
    slug: `${slugify(parsed.data.title)}-${Math.random().toString(36).slice(2, 6)}`,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    price_cents: Math.round(parsed.data.price * 100),
    is_published: false,
  });

  revalidatePath("/practitioner/courses");
}

const updateCourseSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  price: z.coerce.number().min(0).max(10000),
  cover_url: z.string().url().nullable().optional(),
});

export async function updateCourse(formData: FormData) {
  const courseId = String(formData.get("id") ?? "");
  await requirePractitionerOwnership(courseId);

  const parsed = updateCourseSchema.safeParse({
    id: courseId,
    title: formData.get("title"),
    description: formData.get("description") ?? undefined,
    price: formData.get("price") ?? 0,
    cover_url: formData.get("cover_url") || null,
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const supabase = await createClient();
  if (!supabase) throw new Error("Not configured");

  const { error } = await supabase
    .from("courses")
    .update({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      price_cents: Math.round(parsed.data.price * 100),
      cover_url: parsed.data.cover_url ?? null,
    })
    .eq("id", courseId);
  if (error) throw new Error(error.message);

  revalidatePath("/practitioner/courses");
  revalidatePath(`/practitioner/courses/${courseId}`);
}

export async function publishCourse(courseId: string) {
  await requirePractitionerOwnership(courseId);
  const supabase = createServiceClient();

  // Require at least one module containing at least one lesson before going live.
  const { data: modules } = await supabase
    .from("course_modules")
    .select("id, course_lessons(id)")
    .eq("course_id", courseId);
  const hasLesson = (modules ?? []).some(
    (m) =>
      Array.isArray((m as { course_lessons?: unknown[] }).course_lessons) &&
      ((m as { course_lessons: unknown[] }).course_lessons.length > 0),
  );
  if (!hasLesson) {
    throw new Error("Add at least one module with one lesson before publishing");
  }

  const { error } = await supabase
    .from("courses")
    .update({ is_published: true })
    .eq("id", courseId);
  if (error) throw new Error(error.message);

  revalidatePath("/practitioner/courses");
  revalidatePath(`/practitioner/courses/${courseId}`);
}

export async function unpublishCourse(courseId: string) {
  await requirePractitionerOwnership(courseId);
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("courses")
    .update({ is_published: false })
    .eq("id", courseId);
  if (error) throw new Error(error.message);

  revalidatePath("/practitioner/courses");
  revalidatePath(`/practitioner/courses/${courseId}`);
}

export async function deleteCourse(courseId: string) {
  await requirePractitionerOwnership(courseId);
  const supabase = createServiceClient();

  const { data: course } = await supabase
    .from("courses")
    .select("is_published")
    .eq("id", courseId)
    .maybeSingle();
  if (course?.is_published) {
    throw new Error("Unpublish the course before deleting");
  }

  const { count } = await supabase
    .from("course_enrollments")
    .select("*", { count: "exact", head: true })
    .eq("course_id", courseId);
  if ((count ?? 0) > 0) {
    throw new Error("Cannot delete a course with existing enrollments");
  }

  // Best-effort: clean up any Cloudflare assets attached to lessons.
  // Two-hop fetch keeps us off the fragile nested-select typing.
  const { data: courseModules } = await supabase
    .from("course_modules")
    .select("id")
    .eq("course_id", courseId);
  const moduleIds = (courseModules ?? []).map((m) => m.id as string);
  if (moduleIds.length > 0) {
    const { data: lessons } = await supabase
      .from("course_lessons")
      .select("stream_uid")
      .in("module_id", moduleIds);
    for (const l of lessons ?? []) {
      const uid = (l as { stream_uid?: string | null }).stream_uid;
      if (uid) {
        try {
          await deleteCfVideo(uid);
        } catch (err) {
          console.error("[practitioner-courses] CF delete failed", err);
        }
      }
    }
  }

  const { error } = await supabase.from("courses").delete().eq("id", courseId);
  if (error) throw new Error(error.message);

  revalidatePath("/practitioner/courses");
}

// ---------------------------------------------------------------------------
// Modules
// ---------------------------------------------------------------------------

const addModuleSchema = z.object({
  course_id: z.string().uuid(),
  title: z.string().min(1).max(120),
});

export async function addModule(formData: FormData) {
  const courseId = String(formData.get("course_id") ?? "");
  await requirePractitionerOwnership(courseId);

  const parsed = addModuleSchema.safeParse({
    course_id: courseId,
    title: formData.get("title"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const supabase = createServiceClient();

  const { count } = await supabase
    .from("course_modules")
    .select("*", { count: "exact", head: true })
    .eq("course_id", courseId);

  const { error } = await supabase.from("course_modules").insert({
    course_id: courseId,
    title: parsed.data.title,
    display_order: count ?? 0,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/practitioner/courses/${courseId}`);
}

const renameModuleSchema = z.object({
  module_id: z.string().uuid(),
  title: z.string().min(1).max(120),
});

export async function renameModule(formData: FormData) {
  const parsed = renameModuleSchema.safeParse({
    module_id: formData.get("module_id"),
    title: formData.get("title"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const supabase = createServiceClient();
  const { data: mod } = await supabase
    .from("course_modules")
    .select("course_id")
    .eq("id", parsed.data.module_id)
    .maybeSingle();
  if (!mod) throw new Error("Module not found");
  await requirePractitionerOwnership(mod.course_id as string);

  const { error } = await supabase
    .from("course_modules")
    .update({ title: parsed.data.title })
    .eq("id", parsed.data.module_id);
  if (error) throw new Error(error.message);

  revalidatePath(`/practitioner/courses/${mod.course_id}`);
}

export async function deleteModule(moduleId: string) {
  const supabase = createServiceClient();
  const { data: mod } = await supabase
    .from("course_modules")
    .select("course_id")
    .eq("id", moduleId)
    .maybeSingle();
  if (!mod) throw new Error("Module not found");
  await requirePractitionerOwnership(mod.course_id as string);

  // Clean up Cloudflare assets for any lessons in this module.
  const { data: lessons } = await supabase
    .from("course_lessons")
    .select("stream_uid")
    .eq("module_id", moduleId);
  for (const l of lessons ?? []) {
    const uid = (l as { stream_uid?: string | null }).stream_uid;
    if (uid) {
      try {
        await deleteCfVideo(uid);
      } catch (err) {
        console.error("[practitioner-courses] CF delete failed", err);
      }
    }
  }

  const { error } = await supabase
    .from("course_modules")
    .delete()
    .eq("id", moduleId);
  if (error) throw new Error(error.message);

  revalidatePath(`/practitioner/courses/${mod.course_id}`);
}

/**
 * Move a module up or down in display order by swapping with its neighbour.
 * Simpler than a full reorder action and is all the UI needs for now.
 */
export async function moveModule(moduleId: string, direction: "up" | "down") {
  const supabase = createServiceClient();
  const { data: mod } = await supabase
    .from("course_modules")
    .select("id, course_id, display_order")
    .eq("id", moduleId)
    .maybeSingle();
  if (!mod) throw new Error("Module not found");
  await requirePractitionerOwnership(mod.course_id as string);

  const order = (mod.display_order as number | null) ?? 0;
  const targetOrder = direction === "up" ? order - 1 : order + 1;
  if (targetOrder < 0) return;

  const { data: neighbour } = await supabase
    .from("course_modules")
    .select("id, display_order")
    .eq("course_id", mod.course_id as string)
    .eq("display_order", targetOrder)
    .maybeSingle();
  if (!neighbour) return;

  await supabase
    .from("course_modules")
    .update({ display_order: targetOrder })
    .eq("id", mod.id);
  await supabase
    .from("course_modules")
    .update({ display_order: order })
    .eq("id", neighbour.id);

  revalidatePath(`/practitioner/courses/${mod.course_id}`);
}

// ---------------------------------------------------------------------------
// Lessons
// ---------------------------------------------------------------------------

const addLessonSchema = z.object({
  module_id: z.string().uuid(),
  title: z.string().min(1).max(160),
  body: z.string().max(20000).optional(),
});

export async function addLesson(formData: FormData) {
  const parsed = addLessonSchema.safeParse({
    module_id: formData.get("module_id"),
    title: formData.get("title"),
    body: formData.get("body") ?? undefined,
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const supabase = createServiceClient();
  const { data: mod } = await supabase
    .from("course_modules")
    .select("course_id")
    .eq("id", parsed.data.module_id)
    .maybeSingle();
  if (!mod) throw new Error("Module not found");
  await requirePractitionerOwnership(mod.course_id as string);

  const { count } = await supabase
    .from("course_lessons")
    .select("*", { count: "exact", head: true })
    .eq("module_id", parsed.data.module_id);

  const { error } = await supabase.from("course_lessons").insert({
    module_id: parsed.data.module_id,
    title: parsed.data.title,
    body: parsed.data.body ?? null,
    display_order: count ?? 0,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/practitioner/courses/${mod.course_id}`);
}

const updateLessonSchema = z.object({
  lesson_id: z.string().uuid(),
  title: z.string().min(1).max(160),
  body: z.string().max(20000).optional(),
});

export async function updateLesson(formData: FormData) {
  const parsed = updateLessonSchema.safeParse({
    lesson_id: formData.get("lesson_id"),
    title: formData.get("title"),
    body: formData.get("body") ?? undefined,
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const supabase = createServiceClient();
  const lookup = await getCourseIdForLesson(supabase, parsed.data.lesson_id);
  if (!lookup) throw new Error("Lesson not found");
  await requirePractitionerOwnership(lookup.courseId);

  const { error } = await supabase
    .from("course_lessons")
    .update({
      title: parsed.data.title,
      body: parsed.data.body ?? null,
    })
    .eq("id", parsed.data.lesson_id);
  if (error) throw new Error(error.message);

  revalidatePath(`/practitioner/courses/${lookup.courseId}`);
}

export async function deleteLesson(lessonId: string) {
  const supabase = createServiceClient();
  const lookup = await getCourseIdForLesson(supabase, lessonId);
  if (!lookup) throw new Error("Lesson not found");
  await requirePractitionerOwnership(lookup.courseId);

  if (lookup.streamUid) {
    try {
      await deleteCfVideo(lookup.streamUid);
    } catch (err) {
      console.error("[practitioner-courses] CF delete failed", err);
    }
  }

  const { error } = await supabase
    .from("course_lessons")
    .delete()
    .eq("id", lessonId);
  if (error) throw new Error(error.message);

  revalidatePath(`/practitioner/courses/${lookup.courseId}`);
}

export async function moveLesson(lessonId: string, direction: "up" | "down") {
  const supabase = createServiceClient();
  const lookup = await getCourseIdForLesson(supabase, lessonId);
  if (!lookup) throw new Error("Lesson not found");
  await requirePractitionerOwnership(lookup.courseId);

  const { data: lesson } = await supabase
    .from("course_lessons")
    .select("id, display_order")
    .eq("id", lessonId)
    .maybeSingle();
  if (!lesson) return;

  const order = ((lesson.display_order as number | null) ?? 0) as number;
  const targetOrder = direction === "up" ? order - 1 : order + 1;
  if (targetOrder < 0) return;

  const { data: neighbour } = await supabase
    .from("course_lessons")
    .select("id, display_order")
    .eq("module_id", lookup.moduleId)
    .eq("display_order", targetOrder)
    .maybeSingle();
  if (!neighbour) return;

  await supabase
    .from("course_lessons")
    .update({ display_order: targetOrder })
    .eq("id", lesson.id);
  await supabase
    .from("course_lessons")
    .update({ display_order: order })
    .eq("id", neighbour.id);

  revalidatePath(`/practitioner/courses/${lookup.courseId}`);
}

// ---------------------------------------------------------------------------
// Lesson video upload (Cloudflare Stream direct upload)
// ---------------------------------------------------------------------------

/**
 * Mints a Cloudflare Stream Direct Creator Upload URL and stores the resulting
 * uid on the lesson. The browser POSTs the file directly to Cloudflare via TUS;
 * we never proxy bytes. The lesson row is patched with stream_uid immediately so
 * the editor UI can show "encoding…" while CF finishes processing.
 */
export async function startLessonVideoUpload(lessonId: string): Promise<{
  uploadURL: string;
  streamUid: string;
}> {
  const supabase = createServiceClient();
  const lookup = await getCourseIdForLesson(supabase, lessonId);
  if (!lookup) throw new Error("Lesson not found");
  await requirePractitionerOwnership(lookup.courseId);

  const { data: lesson } = await supabase
    .from("course_lessons")
    .select("title")
    .eq("id", lessonId)
    .maybeSingle();

  // If a previous video exists, schedule it for deletion (best-effort).
  if (lookup.streamUid) {
    try {
      await deleteCfVideo(lookup.streamUid);
    } catch (err) {
      console.error("[practitioner-courses] CF delete (previous) failed", err);
    }
  }

  const cf = await createDirectUpload({
    requireSignedURLs: true,
    meta: { name: String((lesson?.title as string | undefined) ?? "lesson") },
    maxDurationSeconds: 4 * 60 * 60,
  });

  const { error } = await supabase
    .from("course_lessons")
    .update({ stream_uid: cf.uid })
    .eq("id", lessonId);
  if (error) throw new Error(error.message);

  revalidatePath(`/practitioner/courses/${lookup.courseId}`);

  return { uploadURL: cf.uploadURL, streamUid: cf.uid };
}

/**
 * Polled by the editor after upload completes — pulls duration and other
 * metadata from Cloudflare so the lesson row reflects the encoded result.
 */
export async function refreshLessonFromCloudflare(lessonId: string) {
  const supabase = createServiceClient();
  const lookup = await getCourseIdForLesson(supabase, lessonId);
  if (!lookup?.streamUid) return { ready: false };
  await requirePractitionerOwnership(lookup.courseId);

  const cf = await getVideo(lookup.streamUid);
  await supabase
    .from("course_lessons")
    .update({ duration_seconds: Math.round(cf.duration ?? 0) })
    .eq("id", lessonId);

  revalidatePath(`/practitioner/courses/${lookup.courseId}`);
  return { ready: cf.readyToStream };
}
