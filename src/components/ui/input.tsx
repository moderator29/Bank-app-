"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-12 w-full rounded-2xl border border-brand-100 bg-white/70 px-4 text-sm text-ink-900 placeholder:text-ink-400 shadow-[inset_0_1px_2px_rgb(6_40_30/0.03)] transition-all focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-400/15",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
        {label}
      </span>
      {children}
    </label>
  );
}
