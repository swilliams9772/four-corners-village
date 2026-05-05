"use client";

import { useTransition } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { approvePractitioner, rejectPractitioner } from "@/app/actions/practitioner";
import { toast } from "@/components/ui/sonner";

export function ApproveButtons({ practitionerId }: { practitionerId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex shrink-0 gap-2">
      <Button
        size="sm"
        variant="brand"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            try {
              await approvePractitioner(practitionerId);
              toast.success("Approved");
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Failed");
            }
          })
        }
      >
        <Check className="size-3.5" /> Approve
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="text-danger hover:bg-danger-soft"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            try {
              await rejectPractitioner(practitionerId);
              toast.success("Archived");
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Failed");
            }
          })
        }
      >
        <X className="size-3.5" /> Reject
      </Button>
    </div>
  );
}
