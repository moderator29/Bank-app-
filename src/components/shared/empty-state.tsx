"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Surface } from "@/components/ui/surface";

/** Composed, product-quality empty states — never a developer placeholder. */
export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  compact,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <Surface
      variant="solid"
      className={compact ? "px-6 py-9 text-center" : "px-6 py-14 text-center"}
    >
      <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-ink-50 text-ink-400">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="text-lg font-semibold tracking-tight text-ink-900">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-ink-400">{body}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </Surface>
  );
}
