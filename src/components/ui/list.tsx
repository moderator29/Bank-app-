"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Grouped settings-style list: one bordered card, hairline-separated rows. */
export function ListGroup({
  label,
  children,
  className,
}: {
  label?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      {label && (
        <h3 className="mb-2 px-1 text-[13px] font-semibold uppercase tracking-[0.09em] text-ink-400">
          {label}
        </h3>
      )}
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-e1 divide-y divide-line">
        {children}
      </div>
    </section>
  );
}

interface RowProps {
  icon?: React.ReactNode;
  title: string;
  detail?: string;
  value?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  chevron?: boolean;
  tone?: "default" | "danger";
  className?: string;
}

export function ListRow({
  icon,
  title,
  detail,
  value,
  href,
  onClick,
  chevron,
  tone = "default",
  className,
}: RowProps) {
  const interactive = Boolean(href || onClick);
  const showChevron = chevron ?? interactive;

  const body = (
    <>
      {icon}
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block truncate text-base font-medium",
            tone === "danger" ? "text-neg-500" : "text-ink-900"
          )}
        >
          {title}
        </span>
        {detail && <span className="mt-0.5 block truncate text-sm text-ink-400">{detail}</span>}
      </span>
      {value}
      {showChevron && <ChevronRight className="h-4 w-4 shrink-0 text-ink-300" />}
    </>
  );

  const shell = cn(
    "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors",
    interactive && "hover:bg-ink-25 active:bg-ink-50",
    className
  );

  if (href) {
    return (
      <Link href={href} className={shell}>
        {body}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={shell}>
        {body}
      </button>
    );
  }
  return <div className={shell}>{body}</div>;
}

/** iOS-style switch used throughout settings and security. */
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-[26px] w-[44px] shrink-0 rounded-3xl transition-colors duration-200",
        checked ? "bg-pos-500" : "bg-ink-200"
      )}
    >
      <span
        className={cn(
          "absolute top-[3px] h-5 w-5 rounded-3xl bg-white shadow-e1 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
          checked ? "translate-x-[21px]" : "translate-x-[3px]"
        )}
      />
    </button>
  );
}
