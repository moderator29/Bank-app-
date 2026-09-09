"use client";

import type { LucideIcon } from "lucide-react";
import { TrendingUp } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { formatCurrency, cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel = "this month",
  delay = 0,
  format = "currency",
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  delay?: number;
  format?: "currency" | "number" | "percent";
}) {
  const display =
    format === "currency"
      ? formatCurrency(value)
      : format === "percent"
        ? `${value.toFixed(2)}%`
        : value.toLocaleString("en-US");

  return (
    <GlassCard delay={delay} className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            {label}
          </p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-ink-900">
            {display}
          </p>
          {trend !== undefined && (
            <p
              className={cn(
                "mt-2 flex items-center gap-1 text-xs font-semibold",
                trend >= 0 ? "text-brand-600" : "text-red-500"
              )}
            >
              <TrendingUp className={cn("h-3.5 w-3.5", trend < 0 && "rotate-180")} />
              {trend >= 0 ? "+" : ""}
              {trend}% <span className="font-medium text-ink-400">{trendLabel}</span>
            </p>
          )}
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-brand-500 to-brand-700 text-white shadow-[0_6px_16px_-4px_rgb(22_136_96/0.45)]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </GlassCard>
  );
}
