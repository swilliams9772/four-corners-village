import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  [
    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill",
    "text-caption font-medium tracking-wide uppercase",
    "border transition-colors duration-quick ease-velvet",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-elevated text-ink border-border",
        soft: "bg-glass text-ink border-subtle backdrop-blur",
        air: "bg-air-soft text-air-foreground border-air/30",
        fire: "bg-fire-soft text-fire-foreground border-fire/30",
        water: "bg-water-soft text-water-foreground border-water/30",
        earth: "bg-earth-soft text-earth-foreground border-earth/30",
        lunar: "bg-lunar-soft text-lunar-foreground border-lunar/30",
        success: "bg-success-soft text-success-foreground border-success/30",
        danger: "bg-danger-soft text-danger-foreground border-danger/30",
        outline: "bg-transparent text-ink border-strong",
        solid: "bg-brand text-brand-foreground border-transparent",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px] gap-1",
        md: "px-2.5 py-1 text-caption",
        lg: "px-3 py-1.5 text-label",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
