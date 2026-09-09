"use client";

import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, ChartPie } from "lucide-react";
import { Surface } from "@/components/ui/surface";
import { useBank } from "@/lib/store";
import { useMonthSummary, useSpendByCategory } from "@/lib/hooks";
import { CATEGORY_LABEL } from "@/components/activity/category-icon";
import { money } from "@/lib/utils";

/**
 * A restrained month summary: what came in, what went out, and where the
 * outgoings actually went. Two figures and three bars — nothing more.
 */
export function Snapshot() {
  const summary = useMonthSummary(0);
  const spend = useSpendByCategory(30);
  const hidden = useBank((s) => s.balanceHidden);
  const top = spend.rows.slice(0, 3);

  return (
    <Surface index={2} className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink-900">
            {summary.label}
          </h2>
          <p className="text-xs text-ink-400">Money in and out this month</p>
        </div>
        <Link
          href="/insights"
          className="press flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50 hover:text-ink-900"
        >
          <ChartPie className="h-4 w-4" />
          Insights
        </Link>
      </div>

      <div className="grid grid-cols-2 divide-x divide-line border-b border-line">
        <Figure
          label="Money in"
          value={summary.income}
          hidden={hidden}
          tone="pos"
          icon={<ArrowDownLeft className="h-3.5 w-3.5" />}
        />
        <Figure
          label="Money out"
          value={summary.spending}
          hidden={hidden}
          tone="neutral"
          icon={<ArrowUpRight className="h-3.5 w-3.5" />}
        />
      </div>

      <div className="space-y-3 px-5 py-4">
        {top.length === 0 ? (
          <p className="py-2 text-sm text-ink-400">
            No spending recorded in the last 30 days.
          </p>
        ) : (
          top.map((row) => {
            const pct = spend.total ? Math.round((row.total / spend.total) * 100) : 0;
            return (
              <Link
                key={row.category}
                href={`/insights/categories/${row.category}`}
                className="block"
              >
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium text-ink-700">
                    {CATEGORY_LABEL[row.category]}
                  </span>
                  <span className="tnum text-sm font-semibold text-ink-900">
                    {hidden ? "•••" : money(row.total)}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-3xl bg-ink-50">
                  <div
                    className="h-full rounded-3xl bg-ink-800 transition-[width] duration-500"
                    style={{ width: `${Math.max(pct, 3)}%` }}
                  />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </Surface>
  );
}

function Figure({
  label,
  value,
  hidden,
  tone,
  icon,
}: {
  label: string;
  value: number;
  hidden: boolean;
  tone: "pos" | "neutral";
  icon: React.ReactNode;
}) {
  return (
    <div className="px-5 py-4">
      <p className="flex items-center gap-1.5 text-xs font-medium text-ink-400">
        <span
          className={
            tone === "pos"
              ? "flex h-5 w-5 items-center justify-center rounded-xs bg-pos-50 text-pos-500"
              : "flex h-5 w-5 items-center justify-center rounded-xs bg-ink-50 text-ink-500"
          }
        >
          {icon}
        </span>
        {label}
      </p>
      <p className="tnum mt-2 text-xl font-semibold tracking-tight text-ink-900">
        {hidden ? "••••••" : money(value)}
      </p>
    </div>
  );
}
