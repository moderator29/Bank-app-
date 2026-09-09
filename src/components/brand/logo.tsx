"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * The Auremont emblem.
 *
 * Auremont is aurum + mont — gold mountain. The mark is exactly that, drawn
 * as struck metal: two faceted peaks catching light from different angles,
 * a thin brass arc rising behind them, and a level ledger line at the base.
 * No letterforms. Gradient ids are per-instance so many marks share a page.
 */
export function LogoMark({
  className,
  tone = "navy",
}: {
  className?: string;
  tone?: "navy" | "light" | "mono";
}) {
  const uid = useId().replace(/:/g, "");
  const field = `f${uid}`;
  const lit = `l${uid}`;
  const shade = `s${uid}`;
  const arc = `a${uid}`;
  const gloss = `g${uid}`;

  const fieldFill =
    tone === "navy" ? `url(#${field})` : tone === "light" ? "#ffffff" : "transparent";
  const litFill = tone === "light" ? "#b8862c" : `url(#${lit})`;
  const shadeFill = tone === "light" ? "#8a6420" : `url(#${shade})`;

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={cn("h-9 w-9 shrink-0", className)}
      role="img"
      aria-label="Auremont"
    >
      <defs>
        <linearGradient id={field} x1="6" y1="0" x2="42" y2="48">
          <stop offset="0%" stopColor="#2e5079" />
          <stop offset="42%" stopColor="#122139" />
          <stop offset="100%" stopColor="#050b15" />
        </linearGradient>
        {/* The sunlit face */}
        <linearGradient id={lit} x1="16" y1="12" x2="30" y2="36">
          <stop offset="0%" stopColor="#fff6e2" />
          <stop offset="34%" stopColor="#f0d9a6" />
          <stop offset="100%" stopColor="#d4a94f" />
        </linearGradient>
        {/* The face turned away from the light */}
        <linearGradient id={shade} x1="26" y1="16" x2="38" y2="38">
          <stop offset="0%" stopColor="#c9962f" />
          <stop offset="60%" stopColor="#a2761f" />
          <stop offset="100%" stopColor="#6f4e17" />
        </linearGradient>
        <linearGradient id={arc} x1="10" y1="10" x2="38" y2="24">
          <stop offset="0%" stopColor="#f8e7be" stopOpacity="0.15" />
          <stop offset="50%" stopColor="#f0d9a6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#d4a94f" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id={gloss} x1="2" y1="0" x2="28" y2="28">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="62%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="48" height="48" rx="13.5" fill={fieldFill} />
      {tone === "navy" && (
        <rect x="0" y="0" width="48" height="48" rx="13.5" fill={`url(#${gloss})`} />
      )}

      {/* The rising arc behind the range */}
      <path
        d="M9.4 22.6 A15.4 15.4 0 0 1 38.6 22.6"
        stroke={`url(#${arc})`}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Back peak — the shaded facet */}
      <path d="M27.2 15.6 L39.4 33.2 H23.1 Z" fill={shadeFill} />
      {/* Front peak — the lit facet, overlapping the back one */}
      <path d="M18.4 19.4 L30.1 33.2 H8.6 Z" fill={litFill} />
      {/* Snowline notch, cut from the front face */}
      <path d="M18.4 19.4 L22.6 24.4 L20.4 26.1 L18.4 23.7 L16.4 26.1 L14.2 24.4 Z" fill="#fffaf0" opacity="0.85" />

      {/* Ledger line */}
      <rect x="8.6" y="35.4" width="30.8" height="1.9" rx="0.95" fill={litFill} opacity="0.9" />
    </svg>
  );
}

export function Wordmark({
  className,
  tone = "navy",
  size = "md",
}: {
  className?: string;
  tone?: "navy" | "light";
  size?: "sm" | "md" | "lg";
}) {
  const type = size === "lg" ? "text-[19px]" : size === "sm" ? "text-[13px]" : "text-[15px]";
  const sub = size === "lg" ? "text-[9px]" : "text-[8px]";
  return (
    <span className={cn("block leading-none", className)}>
      <span
        className={cn(
          "font-display block font-semibold tracking-[0.22em]",
          type,
          tone === "light" ? "text-white" : "text-ink-900"
        )}
      >
        AUREMONT
      </span>
      <span
        className={cn(
          "mt-[3px] block font-medium tracking-[0.44em]",
          sub,
          tone === "light" ? "text-brass-200/85" : "text-brass-500"
        )}
      >
        BANK
      </span>
    </span>
  );
}

export function Logo({
  className,
  tone = "navy",
  size = "md",
}: {
  className?: string;
  tone?: "navy" | "light";
  size?: "sm" | "md" | "lg";
}) {
  const mark = size === "lg" ? "h-11 w-11" : size === "sm" ? "h-8 w-8" : "h-9 w-9";
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={mark} tone={tone === "light" ? "light" : "navy"} />
      <Wordmark tone={tone} size={size} />
    </span>
  );
}
