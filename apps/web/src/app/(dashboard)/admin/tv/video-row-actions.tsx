"use client";

import { useTransition } from "react";
import { MoreVertical, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/sonner";
import { deleteVideoAction, refreshVideoFromCloudflare } from "@/app/actions/tv-admin";

export function VideoRowActions({ videoId }: { videoId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={pending}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() =>
            startTransition(async () => {
              const r = await refreshVideoFromCloudflare(videoId);
              if ("error" in r && r.error) toast.error(r.error);
              else toast.success("Refreshed.");
            })
          }
        >
          <RefreshCw className="size-4" />
          Refresh from Cloudflare
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-danger focus:text-danger"
          onClick={() => {
            if (!confirm("Delete this video? This cannot be undone.")) return;
            startTransition(async () => {
              const r = await deleteVideoAction(videoId);
              if ("error" in r && r.error) toast.error(r.error);
              else toast.success("Deleted.");
            });
          }}
        >
          <Trash2 className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
