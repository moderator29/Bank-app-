"use client";

import { useEffect, useState } from "react";

const TOKENS = [
  "--color-ink-900",
  "--color-ink-700",
  "--color-ink-600",
  "--color-ink-400",
  "--color-ink-300",
  "--color-ink-200",
  "--color-ink-100",
  "--color-line",
  "--color-brass-400",
  "--color-brass-300",
  "--color-info-500",
  "--color-pos-500",
  "--color-surface",
] as const;

type Token = (typeof TOKENS)[number];

export interface ChartTheme {
  color: (token: Token) => string;
  /** Muted, ordered ramp for categorical series — never a rainbow. */
  ramp: string[];
  ready: boolean;
}

/**
 * Charts read their colours from the live CSS variables, so switching
 * appearance re-themes every series without a second palette.
 */
export function useChartTheme(): ChartTheme {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const read = () => {
      const css = getComputedStyle(document.documentElement);
      const next: Record<string, string> = {};
      for (const token of TOKENS) next[token] = css.getPropertyValue(token).trim();
      setValues(next);
    };
    read();

    // Re-read when the appearance changes.
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", read);
    return () => {
      observer.disconnect();
      mq.removeEventListener("change", read);
    };
  }, []);

  const color = (token: Token) => values[token] ?? "#0d1a2c";

  return {
    color,
    ready: Object.keys(values).length > 0,
    ramp: [
      color("--color-ink-900"),
      color("--color-ink-600"),
      color("--color-ink-400"),
      color("--color-brass-400"),
      color("--color-ink-300"),
      color("--color-info-500"),
      color("--color-brass-300"),
      color("--color-ink-200"),
    ],
  };
}
