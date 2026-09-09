"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Page title with an optional back affordance. Every screen below a tab uses
 * this, so there is always a clear way back up the hierarchy.
 */
export function PageHeader({
  title,
  subtitle,
  back,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  /** `true` steps back in history, a string navigates to that route. */
  back?: boolean | string;
  action?: ReactNode;
  className?: string;
}) {
  const router = useRouter();

  return (
    <div className={cn("mb-5", className)}>
      {back &&
        (typeof back === "string" ? (
          <Link
            href={back}
            className="press mb-2.5 -ml-1.5 inline-flex items-center gap-1 rounded-sm py-1 pl-1 pr-2 text-sm font-medium text-ink-500 hover:bg-ink-50 hover:text-ink-900"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
        ) : (
          <button
            onClick={() => router.back()}
            className="press mb-2.5 -ml-1.5 inline-flex items-center gap-1 rounded-sm py-1 pl-1 pr-2 text-sm font-medium text-ink-500 hover:bg-ink-50 hover:text-ink-900"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
        ))}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-ink-400">{subtitle}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}
