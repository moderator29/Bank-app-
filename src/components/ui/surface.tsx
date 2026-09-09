"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "solid" | "sunken" | "navy" | "glass";

const VARIANTS: Record<Variant, string> = {
  solid: "bg-surface border border-line shadow-e1",
  sunken: "bg-surface-sunken border border-line",
  navy: "surface-navy keyline-brass text-white shadow-e3",
  glass: "glass border border-white/70 shadow-e2",
};

interface SurfaceProps extends Omit<HTMLMotionProps<"div">, "children"> {
  variant?: Variant;
  radius?: "xl" | "2xl" | "3xl";
  /** Stagger index for the entrance animation; omit to render statically. */
  index?: number;
  children?: React.ReactNode;
}

/** The one container primitive. Every card, panel and hero uses it. */
export function Surface({
  variant = "solid",
  radius = "2xl",
  index,
  className,
  children,
  ...props
}: SurfaceProps) {
  const shape = radius === "3xl" ? "rounded-3xl" : radius === "xl" ? "rounded-xl" : "rounded-2xl";
  const entrance =
    index === undefined
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.45,
            delay: Math.min(index * 0.06, 0.36),
            ease: [0.22, 1, 0.36, 1] as const,
          },
        };

  return (
    <motion.div
      {...entrance}
      className={cn("relative", shape, VARIANTS[variant], className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeader({
  title,
  action,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-2.5 flex items-baseline justify-between gap-3 px-1", className)}>
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.09em] text-ink-400">
        {title}
      </h2>
      {action}
    </div>
  );
}

/** Rounded icon tile used across quick actions, list rows and empty states. */
export function IconTile({
  children,
  tone = "neutral",
  size = "md",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "navy" | "brass" | "pos" | "neg" | "info";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const tones = {
    neutral: "bg-ink-50 text-ink-600",
    navy: "bg-ink-900 text-brass-200",
    brass: "bg-brass-50 text-brass-600",
    pos: "bg-pos-50 text-pos-500",
    neg: "bg-neg-50 text-neg-500",
    info: "bg-info-50 text-info-500",
  } as const;
  const sizes = {
    sm: "h-8 w-8 rounded-sm [&_svg]:h-4 [&_svg]:w-4",
    md: "h-10 w-10 rounded-lg [&_svg]:h-[18px] [&_svg]:w-[18px]",
    lg: "h-12 w-12 rounded-lg [&_svg]:h-5 [&_svg]:w-5",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        tones[tone],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Chip({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "pos" | "neg" | "warn" | "brass" | "onNavy";
  className?: string;
}) {
  const tones = {
    neutral: "bg-ink-50 text-ink-600",
    pos: "bg-pos-50 text-pos-600",
    neg: "bg-neg-50 text-neg-600",
    warn: "bg-warn-50 text-warn-500",
    brass: "bg-brass-50 text-brass-600",
    onNavy: "bg-white/10 text-brass-100 border border-white/10",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-xs px-2 py-[3px] text-2xs font-semibold",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
