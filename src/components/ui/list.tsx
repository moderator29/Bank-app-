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
      <div className="edge glass-panel relative overflow-hidden rounded-2xl divide-y divide-line">
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
        {detail && (
          <span className="mt-0.5 block text-sm leading-snug text-ink-400">{detail}</span>
        )}
      </span>
      {value}
      {showChevron && <ChevronRight className="h-4 w-4 shrink-0 text-ink-300" />}
    </>
  );

  const shell = cn(
    "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors",
    interactive && "hover:bg-ink-900/4 active:bg-ink-900/7",
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
 * Settings switch.
 *
 * The knob is positioned with an inline transform rather than a utility
 * class so no class-merge can drop it, and the track uses its own colour
 * token — the action colour is near-white in the dark appearance, which
 * would leave a white knob on a white track.
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
  const TRACK = 50;
  const KNOB = 22;
  const INSET = 3;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        width: TRACK,
        height: KNOB + INSET * 2,
        backgroundColor: checked
          ? "var(--color-switch-on)"
          : "var(--color-switch-off)",
      }}
      className={cn(
        "relative shrink-0 rounded-3xl transition-colors duration-200 ease-out",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        disabled ? "cursor-not-allowed opacity-45" : "hover:brightness-[1.06]"
      )}
    >
      <span
        aria-hidden
        style={{
          width: KNOB,
          height: KNOB,
          top: INSET,
          left: INSET,
          transform: `translateX(${checked ? TRACK - KNOB - INSET * 2 : 0}px)`,
          backgroundColor: "var(--color-switch-knob)",
        }}
        className="absolute rounded-3xl shadow-e1 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
      />
    </button>
  );
}
