import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button — primary actionable element.
 *
 * Visual language:
 *   - Default brand button uses `--brand` (theme-resolved: gold on dark, fire on light).
 *   - Elemental variants (`air`, `fire`, `water`, `earth`, `lunar`) tag actions with a
 *     direction. Use `lunar` for sacred actions (Oracle, Altars, ritual triggers).
 *   - Outline / ghost are neutral. `link` is for in-prose anchors that act as buttons.
 *
 * Sizes follow a clear ladder. xl is for hero CTAs, sm/icon for chrome.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium",
    "rounded-lg select-none [-webkit-tap-highlight-color:transparent]",
    "transition-[background-color,color,box-shadow,transform,border-color] duration-gentle ease-velvet",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:ring-border-focus",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-[1.05em] [&_svg]:shrink-0",
    "active:scale-[0.98]",
  ].join(" "),
  {
    variants: {
      variant: {
        brand:
          "bg-brand text-brand-foreground shadow-rest hover:bg-brand-hover hover:shadow-raised active:bg-brand-active",
        secondary:
          "bg-elevated text-ink border border-border hover:border-strong hover:bg-glass",
        outline:
          "bg-transparent text-ink border border-strong hover:bg-glass hover:border-focus",
        ghost: "bg-transparent text-ink hover:bg-glass",
        link: "bg-transparent text-ink-accent underline-offset-4 hover:underline rounded-none",
        destructive:
          "bg-danger text-danger-foreground hover:bg-danger/90 shadow-rest",
        air: "bg-air text-ink-inverse shadow-glow-air hover:opacity-95",
        fire: "bg-fire text-fire-foreground shadow-glow-fire hover:opacity-95",
        water: "bg-water text-water-foreground shadow-glow-water hover:opacity-95",
        earth: "bg-earth text-earth-foreground shadow-glow-earth hover:opacity-95",
        lunar:
          "bg-lunar text-ink-inverse shadow-glow-lunar hover:bg-lunar-soft hover:text-lunar-foreground",
      },
      size: {
        xs: "h-7 px-2.5 text-caption gap-1.5 rounded-md",
        sm: "h-8 px-3.5 text-label gap-1.5 rounded-md",
        md: "h-10 px-5 text-body",
        lg: "h-12 px-7 text-body-lg gap-3",
        xl: "h-14 px-9 text-body-lg font-semibold gap-3 rounded-xl",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8 rounded-md",
        "icon-lg": "h-12 w-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "brand",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
