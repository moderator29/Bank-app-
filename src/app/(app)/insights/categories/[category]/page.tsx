"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChartPie } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Surface, SectionHeader } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { MiniBars } from "@/components/insights/charts";
import { CategoryIcon, CATEGORY_LABEL } from "@/components/activity/category-icon";
import { TransactionList } from "@/components/activity/transaction-list";
import { useBank } from "@/lib/store";
import { useCategoryTransactions, useSpendByCategory } from "@/lib/hooks";
import { money } from "@/lib/utils";
import type { Category } from "@/lib/types";

const VALID = new Set<string>(Object.keys(CATEGORY_LABEL));

export default function CategoryDetailPage() {
  const { category } = useParams<{ category: string }>();
  const valid = VALID.has(category);
  const key = (valid ? category : "food") as Category;

  const hidden = useBank((s) => s.balanceHidden);
  const all = useCategoryTransactions(key);
  const spend = useSpendByCategory(30);

  const stats = React.useMemo(() => {
    const since = Date.now() - 30 * 86_400_000;
    const recent = all.filter((t) => +new Date(t.date) >= since && t.amount < 0);
    const total = recent.reduce((n, t) => n + -t.amount, 0);
    return {
      total,
      count: recent.length,
      average: recent.length ? total / recent.length : 0,
      share: spend.total ? Math.round((total / spend.total) * 100) : 0,
    };
  }, [all, spend.total]);

  // Six months of this category, derived from the same ledger.
  const trend = React.useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => 5 - i).map((offset) => {
      const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 1);
      const value = all
        .filter((t) => {
          const at = new Date(t.date);
          return at >= start && at < end && t.amount < 0;
        })
        .reduce((n, t) => n + -t.amount, 0);
      return { month: start.toLocaleDateString("en-US", { month: "short" }), value: Math.round(value) };
    });
  }, [all]);

  if (!valid) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title="Category" back="/insights" />
        <EmptyState
          icon={ChartPie}
          title="We don't recognise that category"
          body="Pick a category from your insights to see the detail."
          action={
            <Link href="/insights">
              <Button>Back to insights</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-4">
      <PageHeader title={CATEGORY_LABEL[key]} subtitle="Last 30 days" back="/insights" />

      <Surface variant="navy" radius="3xl" index={0} className="p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-brass-200">
            <CategoryIcon category={key} size="sm" />
          </span>
          <p className="text-sm font-medium text-brass-200">{CATEGORY_LABEL[key]}</p>
        </div>
        <p className="tnum mt-4 text-3xl font-semibold tracking-tight text-white">
          {hidden ? "••••••" : money(stats.total)}
        </p>
        <p className="mt-2 text-sm text-white/50">
          {stats.share}% of your spending · {stats.count}{" "}
          {stats.count === 1 ? "payment" : "payments"}
        </p>
      </Surface>

      <div className="grid grid-cols-2 gap-3">
        <Surface className="px-5 py-4">
          <p className="text-xs font-medium text-ink-400">Average payment</p>
          <p className="tnum mt-1.5 text-xl font-semibold text-ink-900">
            {hidden ? "•••" : money(stats.average)}
          </p>
        </Surface>
        <Surface className="px-5 py-4">
          <p className="text-xs font-medium text-ink-400">Payments</p>
          <p className="tnum mt-1.5 text-xl font-semibold text-ink-900">{stats.count}</p>
        </Surface>
      </div>

      <Surface className="overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-base font-semibold tracking-tight text-ink-900">Six-month trend</h2>
          <p className="text-xs text-ink-400">What you spent here each month</p>
        </div>
        <div className="px-3 py-4">
          <MiniBars data={trend} />
        </div>
      </Surface>

      <section>
        <SectionHeader title="All payments" />
        {all.length === 0 ? (
          <EmptyState
            compact
            icon={ChartPie}
            title="Nothing here yet"
            body={`Payments categorised as ${CATEGORY_LABEL[key].toLowerCase()} will appear here.`}
          />
        ) : (
          <TransactionList transactions={all.slice(0, 40)} hidden={hidden} showDayTotals={false} />
        )}
      </section>
    </div>
  );
}
