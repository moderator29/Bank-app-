"use client";

import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Selectable row used by every money flow to choose an account or payee. */
export function PickRow({
  active,
  onClick,
  title,
  detail,
  value,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  detail: string;
  value?: string;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "press flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors",
        active
          ? "border-ink-900 bg-ink-25 shadow-e1"
          : "border-line bg-surface hover:border-line-strong"
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          active ? "bg-ink-900 text-brass-200" : "bg-ink-50 text-ink-500"
        )}
      >
        {icon ?? (active ? <Check className="h-[18px] w-[18px]" /> : <span className="text-xs font-semibold">{title.slice(0, 1)}</span>)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-ink-900">{title}</span>
        <span className="mask-dots mt-0.5 block truncate text-xs text-ink-400">{detail}</span>
      </span>
      {value && (
        <span className="tnum shrink-0 text-sm font-semibold text-ink-700">{value}</span>
      )}
    </button>
  );
}
