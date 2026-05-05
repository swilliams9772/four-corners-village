"use client";

import { useState, useTransition } from "react";
import { Plus, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleMyList } from "@/app/actions/tv";
import { toast } from "@/components/ui/sonner";

export function ToggleMyListButton({
  videoId,
  initialInList,
}: {
  videoId: string;
  initialInList: boolean;
}) {
  const [inList, setInList] = useState(initialInList);
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="xl"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const r = await toggleMyList(videoId);
          if ("error" in r && r.error) {
            toast.error(r.error);
            return;
          }
          if ("inList" in r && typeof r.inList === "boolean") {
            setInList(r.inList);
            toast.success(r.inList ? "Added to My List" : "Removed from My List");
          }
        })
      }
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : inList ? (
        <Check className="size-4" />
      ) : (
        <Plus className="size-4" />
      )}
      {inList ? "In my list" : "My list"}
    </Button>
  );
}
