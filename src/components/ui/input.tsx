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
      "h-12 w-full rounded-md border border-line-strong bg-surface/55 px-3.5 text-base text-ink-900 backdrop-blur-sm",
      "placeholder:text-ink-300 transition-[border-color,box-shadow] duration-150",
      "focus:border-ink-700 focus:outline-none focus:ring-4 focus:ring-ink-900/8",
      "disabled:bg-surface-sunken disabled:text-ink-400",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-semibold text-ink-500">{label}</span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-xs font-medium text-neg-500">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-ink-400">{hint}</span>
      ) : null}
    </label>
  );
}

/** Large amount entry — the hero control on every money form. */
export function AmountInput({
  value,
  onChange,
  autoFocus,
  id = "amount",
}: {
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
  id?: string;
}) {
  return (
    <div className="edge glass-sunken relative flex items-center justify-center rounded-xl px-4 py-6">
      <span className="mr-1 text-2xl font-medium text-ink-300">$</span>
      <input
        id={id}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ""))}
        inputMode="decimal"
        placeholder="0.00"
        aria-label="Amount"
        className="tnum w-full max-w-[14ch] bg-transparent text-center text-4xl font-semibold tracking-tight text-ink-900 placeholder:text-ink-200 focus:outline-none"
      />
    </div>
  );
}
