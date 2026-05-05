"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Eye,
  EyeOff,
  Plus,
  Save,
  Trash,
  Upload,
  Video as VideoIcon,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { formatDuration } from "@/lib/utils";
import {
  addLesson,
  addModule,
  deleteCourse,
  deleteLesson,
  deleteModule,
  moveLesson,
  moveModule,
  publishCourse,
  refreshLessonFromCloudflare,
  renameModule,
  startLessonVideoUpload,
  unpublishCourse,
  updateCourse,
  updateLesson,
} from "@/app/actions/practitioner-courses";
import type { Course, CourseLesson, CourseModule } from "@/lib/supabase/types";

type ModuleWithLessons = CourseModule & { course_lessons: CourseLesson[] };

export function CourseEditor({
  course,
  modules,
}: {
  course: Course;
  modules: ModuleWithLessons[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function refresh() {
    router.refresh();
  }

  function handleAction(fn: () => Promise<unknown>, successMessage?: string) {
    startTransition(async () => {
      try {
        await fn();
        if (successMessage) toast.success(successMessage);
        refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <div className="space-y-6">
      <CourseDetailsCard course={course} disabled={pending} onSaved={refresh} />

      <div className="flex flex-wrap items-center gap-3">
        {course.is_published ? (
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => handleAction(() => unpublishCourse(course.id), "Course unpublished")}
          >
            <EyeOff className="size-4" /> Unpublish
          </Button>
        ) : (
          <Button
            variant="brand"
            disabled={pending}
            onClick={() => handleAction(() => publishCourse(course.id), "Course published")}
          >
            <Eye className="size-4" /> Publish
          </Button>
        )}
        <Button
          variant="ghost"
          className="text-danger hover:bg-danger-soft"
          disabled={pending}
          onClick={() => {
            if (!confirm("Delete this course? This cannot be undone.")) return;
            startTransition(async () => {
              try {
                await deleteCourse(course.id);
                toast.success("Course deleted");
                router.push("/practitioner/courses");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Delete failed");
              }
            });
          }}
        >
          <Trash className="size-4" /> Delete
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="font-display text-h5 text-ink">Modules</h2>
        {modules.map((m, i) => (
          <ModuleCard
            key={m.id}
            module={m}
            position={i}
            total={modules.length}
            disabled={pending}
            onAction={handleAction}
            onRefresh={refresh}
          />
        ))}

        <AddModuleForm courseId={course.id} disabled={pending} onAdded={refresh} />
      </div>
    </div>
  );
}

function CourseDetailsCard({
  course,
  disabled,
  onSaved,
}: {
  course: Course;
  disabled: boolean;
  onSaved: () => void;
}) {
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateCourse(formData);
        toast.success("Course details saved");
        onSaved();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  return (
    <Card variant="default">
      <CardHeader>
        <CardTitle className="text-h6">Course details</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={onSubmit} className="space-y-5">
          <input type="hidden" name="id" value={course.id} />
          <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={course.title} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min={0}
                step="0.01"
                defaultValue={(course.price_cents / 100).toFixed(2)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={course.description ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cover_url">Cover image URL (optional)</Label>
            <Input id="cover_url" name="cover_url" defaultValue={course.cover_url ?? ""} />
          </div>
          <Button type="submit" variant="brand" disabled={disabled || pending}>
            <Save className="size-4" /> Save
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function AddModuleForm({
  courseId,
  disabled,
  onAdded,
}: {
  courseId: string;
  disabled: boolean;
  onAdded: () => void;
}) {
  const [title, setTitle] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!title.trim()) return;
    const fd = new FormData();
    fd.set("course_id", courseId);
    fd.set("title", title.trim());
    startTransition(async () => {
      try {
        await addModule(fd);
        setTitle("");
        toast.success("Module added");
        onAdded();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Add module failed");
      }
    });
  }

  return (
    <Card variant="sunken" className="border-dashed">
      <CardContent className="flex flex-col items-end gap-3 p-4 sm:flex-row">
        <div className="w-full flex-1 space-y-2">
          <Label htmlFor="new-module-title">New module title</Label>
          <Input
            id="new-module-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Foundations"
            disabled={disabled || pending}
          />
        </div>
        <Button onClick={submit} disabled={!title.trim() || disabled || pending} variant="brand">
          <Plus className="size-4" /> Add module
        </Button>
      </CardContent>
    </Card>
  );
}

function ModuleCard({
  module,
  position,
  total,
  disabled,
  onAction,
  onRefresh,
}: {
  module: ModuleWithLessons;
  position: number;
  total: number;
  disabled: boolean;
  onAction: (fn: () => Promise<unknown>, message?: string) => void;
  onRefresh: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(module.title);

  function saveTitle() {
    const fd = new FormData();
    fd.set("module_id", module.id);
    fd.set("title", title.trim());
    onAction(async () => {
      await renameModule(fd);
      setEditing(false);
    }, "Module renamed");
  }

  return (
    <Card variant="default">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="icon"
            disabled={disabled || position === 0}
            onClick={() => onAction(() => moveModule(module.id, "up"))}
            aria-label="Move up"
          >
            <ArrowUp className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={disabled || position === total - 1}
            onClick={() => onAction(() => moveModule(module.id, "down"))}
            aria-label="Move down"
          >
            <ArrowDown className="size-4" />
          </Button>
        </div>
        <div className="flex-1">
          {editing ? (
            <div className="flex items-center gap-2">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} disabled={disabled} />
              <Button size="icon" variant="brand" onClick={saveTitle} disabled={disabled}>
                <Check className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  setTitle(module.title);
                }}
                disabled={disabled}
              >
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <CardTitle
              className="cursor-pointer text-h6"
              onClick={() => setEditing(true)}
              title="Click to rename"
            >
              {module.title}
            </CardTitle>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-danger"
          disabled={disabled}
          aria-label="Delete module"
          onClick={() => {
            if (!confirm("Delete this module and all its lessons?")) return;
            onAction(() => deleteModule(module.id), "Module deleted");
          }}
        >
          <Trash className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {module.course_lessons.length === 0 ? (
          <p className="text-caption text-ink-muted">No lessons yet.</p>
        ) : (
          module.course_lessons.map((l, i) => (
            <LessonRow
              key={l.id}
              lesson={l}
              position={i}
              total={module.course_lessons.length}
              disabled={disabled}
              onAction={onAction}
              onRefresh={onRefresh}
            />
          ))
        )}
        <AddLessonForm
          moduleId={module.id}
          disabled={disabled}
          onAdded={onRefresh}
        />
      </CardContent>
    </Card>
  );
}

function AddLessonForm({
  moduleId,
  disabled,
  onAdded,
}: {
  moduleId: string;
  disabled: boolean;
  onAdded: () => void;
}) {
  const [title, setTitle] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!title.trim()) return;
    const fd = new FormData();
    fd.set("module_id", moduleId);
    fd.set("title", title.trim());
    startTransition(async () => {
      try {
        await addLesson(fd);
        setTitle("");
        toast.success("Lesson added");
        onAdded();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Add lesson failed");
      }
    });
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-dashed border-subtle p-2">
      <Input
        placeholder="New lesson title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={disabled || pending}
        className="h-9 border-0 bg-transparent shadow-none focus-visible:ring-0"
      />
      <Button size="sm" variant="brand" onClick={submit} disabled={!title.trim() || disabled || pending}>
        <Plus className="size-3.5" /> Add
      </Button>
    </div>
  );
}

function LessonRow({
  lesson,
  position,
  total,
  disabled,
  onAction,
  onRefresh,
}: {
  lesson: CourseLesson;
  position: number;
  total: number;
  disabled: boolean;
  onAction: (fn: () => Promise<unknown>, message?: string) => void;
  onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const [body, setBody] = useState(lesson.body ?? "");
  const [uploadPhase, setUploadPhase] = useState<
    "idle" | "starting" | "uploading" | "processing"
  >("idle");
  const [progress, setProgress] = useState(0);
  const [pending, startTransition] = useTransition();

  function saveLesson() {
    const fd = new FormData();
    fd.set("lesson_id", lesson.id);
    fd.set("title", title.trim());
    fd.set("body", body);
    onAction(async () => {
      await updateLesson(fd);
      setExpanded(false);
    }, "Lesson saved");
  }

  async function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadPhase("starting");
      const { uploadURL } = await startLessonVideoUpload(lesson.id);
      setUploadPhase("uploading");
      await uploadWithProgress(uploadURL, file, setProgress);
      setUploadPhase("processing");
      // Give Cloudflare a brief moment to register the upload before we ask for duration.
      await new Promise((r) => setTimeout(r, 2500));
      startTransition(async () => {
        await refreshLessonFromCloudflare(lesson.id);
        setUploadPhase("idle");
        setProgress(0);
        toast.success("Video uploaded — Cloudflare is encoding");
        onRefresh();
      });
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Upload failed");
      setUploadPhase("idle");
      setProgress(0);
    }
  }

  return (
    <div className="rounded-xl border border-subtle bg-canvas-subtle">
      <div className="flex items-center gap-2 p-3">
        <div className="flex flex-col">
          <Button
            variant="ghost"
            size="icon"
            disabled={disabled || position === 0}
            onClick={() => onAction(() => moveLesson(lesson.id, "up"))}
            aria-label="Move lesson up"
          >
            <ArrowUp className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={disabled || position === total - 1}
            onClick={() => onAction(() => moveLesson(lesson.id, "down"))}
            aria-label="Move lesson down"
          >
            <ArrowDown className="size-3" />
          </Button>
        </div>
        <button
          type="button"
          className="flex flex-1 items-center gap-2 text-left"
          onClick={() => setExpanded((v) => !v)}
        >
          <span className="font-medium text-ink">{lesson.title}</span>
          {lesson.stream_uid && (
            <Badge variant="lunar" size="sm">
              <VideoIcon className="size-3" /> Video
            </Badge>
          )}
          {lesson.duration_seconds ? (
            <span className="text-caption text-ink-muted tabular-nums">
              {formatDuration(lesson.duration_seconds)}
            </span>
          ) : null}
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="text-danger"
          disabled={disabled || pending}
          aria-label="Delete lesson"
          onClick={() => {
            if (!confirm("Delete this lesson?")) return;
            onAction(() => deleteLesson(lesson.id), "Lesson deleted");
          }}
        >
          <Trash className="size-3" />
        </Button>
      </div>
      {expanded && (
        <div className="space-y-3 border-t border-subtle p-3">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={disabled || pending}
            />
          </div>
          <div className="space-y-2">
            <Label>Body (markdown)</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              disabled={disabled || pending}
            />
          </div>
          <div className="space-y-2">
            <Label>Video</Label>
            <div className="flex flex-wrap items-center gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleVideoChange}
                  disabled={uploadPhase !== "idle" || pending}
                />
                <span className="inline-flex items-center gap-2 rounded-xl border border-subtle bg-canvas px-3 py-2 text-label transition-colors hover:border-strong">
                  <Upload className="size-4" />
                  {lesson.stream_uid ? "Replace video" : "Upload video"}
                </span>
              </label>
              {uploadPhase !== "idle" && (
                <div className="flex-1 min-w-[200px]">
                  <Progress value={uploadPhase === "uploading" ? progress : 100} />
                  <p className="mt-1.5 text-caption text-ink-muted">
                    {uploadPhase === "starting" && "Requesting upload URL…"}
                    {uploadPhase === "uploading" && `Uploading ${progress.toFixed(0)}%`}
                    {uploadPhase === "processing" && "Cloudflare is encoding…"}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setExpanded(false)} disabled={disabled}>
              Close
            </Button>
            <Button variant="brand" onClick={saveLesson} disabled={disabled || pending}>
              <Save className="size-4" /> Save lesson
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function uploadWithProgress(
  url: string,
  file: File,
  onProgress: (p: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress((e.loaded / e.total) * 100);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    const fd = new FormData();
    fd.append("file", file);
    xhr.send(fd);
  });
}
