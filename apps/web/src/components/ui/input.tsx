import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-lg bg-elevated px-4 text-body text-ink",
        "border border-border placeholder:text-ink-muted",
        "transition-[border-color,box-shadow,background-color] duration-quick ease-velvet",
        "hover:border-strong",
        "focus-visible:outline-none focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-border-focus/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:border-0 file:bg-transparent file:text-label file:font-medium file:text-ink",
        "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
