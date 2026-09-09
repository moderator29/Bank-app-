"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * The Auremont seal.
 *
 * Auremont takes its name from aurum — gold. The mark is that idea struck as
 * a coin: a brass ring holding an apex "A" whose crossbar sweeps into the
 * curve of a "U", so the monogram reads AU as one continuous stroke. A single
 * specular sweep gives the metal its shine; nothing is striped or repeated.
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
  const metal = `m${uid}`;
  const gloss = `g${uid}`;
  const ring = `r${uid}`;

  const fieldFill =
    tone === "navy" ? `url(#${field})` : tone === "light" ? "#ffffff" : "transparent";
  const strokeFill = tone === "light" ? "#966a20" : `url(#${metal})`;
  const ringStroke = tone === "light" ? "rgba(150,106,32,0.35)" : `url(#${ring})`;

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={cn("h-9 w-9 shrink-0", className)}
      role="img"
      aria-label="Auremont"
    >
      <defs>
        <linearGradient id={field} x1="8" y1="0" x2="40" y2="48">
          <stop offset="0%" stopColor="#2c4b70" />
          <stop offset="44%" stopColor="#122139" />
          <stop offset="100%" stopColor="#050c17" />
        </linearGradient>
        <linearGradient id={metal} x1="14" y1="10" x2="34" y2="38">
          <stop offset="0%" stopColor="#fdf3dc" />
          <stop offset="26%" stopColor="#eed19a" />
          <stop offset="55%" stopColor="#d4a94f" />
          <stop offset="78%" stopColor="#b8862c" />
          <stop offset="100%" stopColor="#f0dcae" />
        </linearGradient>
        <linearGradient id={ring} x1="10" y1="8" x2="38" y2="42">
          <stop offset="0%" stopColor="#f8e7be" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#c9962f" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#f0dcae" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id={gloss} x1="4" y1="0" x2="30" y2="30">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="58%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Field */}
      <rect x="0" y="0" width="48" height="48" rx="13.5" fill={fieldFill} />
      {tone === "navy" && (
        <rect x="0" y="0" width="48" height="48" rx="13.5" fill={`url(#${gloss})`} />
      )}

      {/* The seal ring */}
      <circle cx="24" cy="24" r="17.1" stroke={ringStroke} strokeWidth="1.15" fill="none" />

      {/* AU as one stroke: the apex, its crossbar, and the cup of the U. */}
      <g fill={strokeFill}>
        <path d="M17.35 32.9 H13.5 L20.2 14.2 h3.5 l6.7 18.7 h-3.85 l-1.62 -4.72 h-5.44 l1.02 -3.02 h3.39 L21.95 19.6 Z" />
        <path d="M30.05 14.2 h3.4 v11.42 c0 2.34 -1.02 4.06 -2.86 5.06 l-1.4 -3.06 c0.57 -0.47 0.86 -1.17 0.86 -2.1 Z" />
        <path d="M24.35 33.2 c3.36 0 6.02 -1.36 7.62 -3.72 l-2.7 -1.94 c-1.02 1.5 -2.66 2.32 -4.92 2.32 z" />
      </g>
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
