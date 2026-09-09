"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-[0_8px_20px_-6px_rgb(22_136_96/0.5)] hover:shadow-[0_10px_26px_-6px_rgb(22_136_96/0.6)] hover:brightness-105",
        secondary:
          "glass text-ink-900 shadow-float hover:bg-white/90 hover:shadow-float-lg",
        ghost: "text-ink-600 hover:bg-brand-50 hover:text-brand-700",
        outline:
          "border border-brand-200 bg-white/60 text-brand-700 hover:bg-brand-50",
        danger: "bg-red-50 text-red-600 hover:bg-red-100",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-5",
        lg: "h-13 px-7 text-base",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";
