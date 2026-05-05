import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[100px] w-full rounded-lg bg-elevated px-4 py-3 text-body text-ink",
      "border border-border placeholder:text-ink-muted resize-y",
      "transition-[border-color,box-shadow,background-color] duration-quick ease-velvet",
      "hover:border-strong",
      "focus-visible:outline-none focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-border-focus/30",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
