"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { startVideoUpload, refreshVideoFromCloudflare } from "@/app/actions/tv-admin";
import type { VideoCategory } from "@/lib/supabase/types";

export function UploadDialog({ categories }: { categories: VideoCategory[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"idle" | "starting" | "uploading" | "processing" | "done">("idle");
  const [pending, startTransition] = useTransition();

  async function handleUpload() {
    if (!file || !title) return;
    setPhase("starting");
    try {
      const { videoId, uploadURL } = await startVideoUpload({
        title,
        categoryId: categoryId || undefined,
      });

      setPhase("uploading");
      // Plain PUT works for Direct Creator Uploads <200MB; for larger
      // files we'd swap in tus-js-client. Small admin tool, this is fine
      // for ~95% of documentary sources.
      await uploadWithProgress(uploadURL, file, setProgress);

      setPhase("processing");
      // Poll once after a short delay; CF will continue encoding
      // in the background and a future page reload picks up duration/poster.
      await new Promise((r) => setTimeout(r, 2000));
      startTransition(async () => {
        await refreshVideoFromCloudflare(videoId);
        setPhase("done");
        toast.success("Upload complete. Encoding will finish shortly.");
        router.push(`/admin/tv/${videoId}`);
        router.refresh();
        setOpen(false);
        resetState();
      });
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Upload failed");
      setPhase("idle");
    }
  }

  function resetState() {
    setTitle("");
    setCategoryId("");
    setFile(null);
    setProgress(0);
    setPhase("idle");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) resetState();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="brand" size="lg">
          <Plus className="size-4" /> Upload video
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload to Vintage TV</DialogTitle>
          <DialogDescription>
            Bytes upload directly to Cloudflare Stream. Encoding runs in the background.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={phase !== "idle"} />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId} disabled={phase !== "idle"}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">Video file</Label>
            <Input
              id="file"
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              disabled={phase !== "idle"}
            />
          </div>
          {phase !== "idle" && (
            <div className="space-y-2">
              <Progress value={phase === "uploading" ? progress : phase === "processing" ? 100 : 0} />
              <p className="text-caption text-ink-muted">
                {phase === "starting" && "Requesting upload URL…"}
                {phase === "uploading" && `Uploading… ${progress.toFixed(0)}%`}
                {phase === "processing" && "Cloudflare is encoding…"}
                {phase === "done" && "Done."}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={phase === "uploading"}>
            Cancel
          </Button>
          <Button
            variant="brand"
            onClick={handleUpload}
            disabled={!file || !title || phase !== "idle" || pending}
          >
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function uploadWithProgress(url: string, file: File, onProgress: (p: number) => void) {
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
