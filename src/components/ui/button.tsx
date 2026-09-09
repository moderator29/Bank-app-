"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Rectangular by default — banking controls, not social-app capsules.
 * Radius comes from the system scale (md for controls, lg for large CTAs).
 */
const button = cva(
  "press inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-semibold disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        primary:
          "btn-primary bg-action text-action-fg hover:bg-action-hover",
        brass:
          "bg-brass-400 text-[#0a1422] shadow-e2 hover:bg-brass-300",
        secondary:
          "border border-line-strong bg-surface text-ink-800 shadow-e1 hover:bg-ink-25 hover:border-ink-200",
        subtle: "bg-ink-50 text-ink-700 hover:bg-ink-100",
        ghost: "text-ink-500 hover:bg-ink-50 hover:text-ink-800",
        onNavy:
          "border border-white/15 bg-white/10 text-white backdrop-blur-sm hover:bg-white/16",
        danger: "bg-neg-50 text-neg-600 hover:bg-neg-500 hover:text-white",
      },
      size: {
        xs: "h-8 rounded-sm px-3 text-xs",
        sm: "h-9 rounded-md px-3.5 text-sm",
        md: "h-11 rounded-md px-4 text-base",
        lg: "h-13 rounded-lg px-6 text-base",
        icon: "h-10 w-10 rounded-md",
        iconSm: "h-8 w-8 rounded-sm",
      },
      block: { true: "w-full" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, ...props }, ref) => (
    <button ref={ref} className={cn(button({ variant, size, block }), className)} {...props} />
  )
);
Button.displayName = "Button";

export { button as buttonStyles };
