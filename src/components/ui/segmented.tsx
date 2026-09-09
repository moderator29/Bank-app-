"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Segmented control — account/period switching without a page change. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
  id = "seg",
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
  id?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "no-scrollbar edge glass-sunken relative flex gap-1 overflow-x-auto rounded-md p-1",
        className
      )}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "relative flex-1 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-semibold transition-colors",
              active ? "text-ink-900" : "text-ink-400 hover:text-ink-600"
            )}
          >
            {active && (
              <motion.span
                layoutId={`${id}-seg`}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className="absolute inset-0 rounded-sm border border-brass-400/25 bg-surface/85 shadow-e1"
              />
            )}
            <span className="relative z-10">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
