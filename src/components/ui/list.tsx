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

/**
 * Settings switch. Off is a quiet neutral track; on is the brand's action
 * colour rather than a signal green, so a page of toggles stays calm.
 */
export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-[30px] w-[52px] shrink-0 rounded-3xl border transition-colors duration-200 ease-out",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        disabled && "cursor-not-allowed opacity-45",
        checked
          ? "border-transparent bg-action"
          : "border-line-strong bg-ink-100 hover:bg-ink-200"
      )}
    >
      <span
        className={cn(
          "absolute top-[3px] h-[22px] w-[22px] rounded-3xl bg-white transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "shadow-[0_1px_2px_rgb(13_26_44/0.28),0_0_0_0.5px_rgb(13_26_44/0.06)]",
          checked ? "translate-x-[25px]" : "translate-x-[3px]"
        )}
      />
    </button>
  );
}
