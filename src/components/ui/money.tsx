"use client";

import { cn, money } from "@/lib/utils";

/**
 * Money display. Incoming amounts are green and signed; outgoing are ink —
 * the banking convention that keeps a statement calm instead of alarming.
 */
export function Money({
  value,
  signed = true,
  compact,
  hidden,
  className,
}: {
  value: number;
  signed?: boolean;
  compact?: boolean;
  hidden?: boolean;
  className?: string;
}) {
  if (hidden) {
    return <span className={cn("mask-dots text-ink-400", className)}>••••••</span>;
  }
  return (
    <span
      className={cn("tnum", value > 0 && signed ? "text-pos-500" : "text-ink-900", className)}
    >
      {signed ? money(value, { signed: true, compact }) : money(value, { compact })}
    </span>
  );
}
