"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, ChartPie, ChevronRight, Repeat } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Surface, SectionHeader, Chip } from "@/components/ui/surface";
import { Segmented } from "@/components/ui/segmented";
import { EmptyState } from "@/components/shared/empty-state";
import { CashflowChart, CategoryDonut, TrendChart } from "@/components/insights/charts";
import { CATEGORY_LABEL } from "@/components/activity/category-icon";
import { TransactionRow } from "@/components/activity/transaction-row";
import { useBank } from "@/lib/store";
import { primaryAccount, monthlyRecurringTotal } from "@/lib/selectors";
import {
  useBalanceSeries,
  useCashflowSeries,
  useMonthSummary,
  useSpendByCategory,
  useTransactions,
} from "@/lib/hooks";
import { money } from "@/lib/utils";

type Period = "this" | "last" | "quarter";

const PERIODS: { value: Period; label: string }[] = [
  { value: "this", label: "This month" },
  { value: "last", label: "Last month" },
  { value: "quarter", label: "3 months" },
];

export default function InsightsPage() {
  const [period, setPeriod] = React.useState<Period>("this");
  const account = useBank(primaryAccount);
  const hidden = useBank((s) => s.balanceHidden);
  const recurring = useBank(monthlyRecurringTotal);
  const transactions = useTransactions();

  const days = period === "quarter" ? 92 : period === "last" ? 60 : 30;
  const thisMonth = useMonthSummary(0);
  const lastMonth = useMonthSummary(1);
  const spend = useSpendByCategory(days);
  const cashflow = useCashflowSeries(6);
  const balance = useBalanceSeries(account.id, 6);

  // Three months aggregates the last three calendar months.
  const summary = React.useMemo(() => {
    if (period === "this") return thisMonth;
    if (period === "last") return lastMonth;
    const window = cashflow.slice(-3);
    const income = window.reduce((n, m) => n + m.inflow, 0);
    const spending = window.reduce((n, m) => n + m.outflow, 0);
    return { ...thisMonth, label: "Last 3 months", income, spending, net: income - spending };
  }, [period, thisMonth, lastMonth, cashflow]);

  const largest = React.useMemo(() => {
    const since = Date.now() - days * 86_400_000;
    return transactions
      .filter((t) => t.amount < 0 && t.category !== "transfer" && +new Date(t.date) >= since)
      .sort((a, b) => a.amount - b.amount)
      .slice(0, 5);
  }, [transactions, days]);

  const donut = spend.rows.slice(0, 7).map((r) => ({
    name: CATEGORY_LABEL[r.category],
    value: r.total,
  }));

  const changeVsLast =
    lastMonth.spending > 0
      ? Math.round(((thisMonth.spending - lastMonth.spending) / lastMonth.spending) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-4">
      <PageHeader title="Insights" subtitle="Where your money goes, and what it does next." />

      <Segmented id="insights-period" value={period} onChange={setPeriod} options={PERIODS} />

      <Surface index={0} className="overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-base font-semibold tracking-tight text-ink-900">{summary.label}</h2>
          <p className="text-xs text-ink-400">Money in and out</p>
        </div>
        <div className="grid grid-cols-3 divide-x divide-line border-b border-line">
          <Figure label="In" value={summary.income} hidden={hidden} tone="pos" />
          <Figure label="Out" value={summary.spending} hidden={hidden} tone="ink" />
          <Figure label="Net" value={summary.net} hidden={hidden} tone="net" />
        </div>
        <div className="px-3 py-4">
          <CashflowChart data={cashflow} />
          <div className="mt-2 flex items-center justify-center gap-4">
            <Legend color="bg-pos-500" label="Money in" />
            <Legend color="bg-ink-300" label="Money out" />
          </div>
        </div>
      </Surface>

      {spend.rows.length === 0 ? (
        <EmptyState
          icon={ChartPie}
          title="No spending in this period"
          body="Once card payments and bills post, you'll see exactly where the money went."
        />
      ) : (
        <Surface index={1} className="overflow-hidden">
          <div className="flex items-baseline justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-ink-900">
                Spending by category
              </h2>
              <p className="tnum text-xs text-ink-400">
                {hidden ? "•••" : money(spend.total)} over {days} days
              </p>
            </div>
            {period === "this" && changeVsLast !== 0 && (
              <Chip tone={changeVsLast > 0 ? "warn" : "pos"}>
                {changeVsLast > 0 ? "+" : ""}
                {changeVsLast}% vs last month
              </Chip>
            )}
          </div>

          <div className="px-3 pt-4">
            <CategoryDonut data={donut} />
          </div>

          <div className="divide-y divide-line">
            {spend.rows.map((row, i) => {
              const pct = spend.total ? Math.round((row.total / spend.total) * 100) : 0;
              return (
                <Link
                  key={row.category}
                  href={`/insights/categories/${row.category}`}
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-ink-25"
                >
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 shrink-0 rounded-3xl"
                    style={{ backgroundColor: `var(--ramp-${Math.min(i, 7)})` }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base font-medium text-ink-900">
                      {CATEGORY_LABEL[row.category]}
                    </span>
                    <span className="mt-1.5 block h-1 overflow-hidden rounded-3xl bg-ink-50">
                      <span
                        className="block h-full rounded-3xl bg-ink-700"
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="tnum block text-base font-semibold text-ink-900">
                      {hidden ? "•••" : money(row.total)}
                    </span>
                    <span className="tnum block text-xs text-ink-400">{pct}%</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-ink-300" />
                </Link>
              );
            })}
          </div>
        </Surface>
      )}

      <Surface index={2} className="overflow-hidden">
        <Link
          href="/insights/subscriptions"
          className="flex items-center gap-3.5 px-5 py-4 transition-colors hover:bg-ink-25"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brass-50 text-brass-600">
            <Repeat className="h-[18px] w-[18px]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-base font-semibold text-ink-900">Recurring payments</span>
            <span className="tnum mt-0.5 block text-sm text-ink-400">
              {hidden ? "•••" : `${money(recurring)} a month across your subscriptions and bills`}
            </span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-ink-300" />
        </Link>
      </Surface>

      <Surface index={3} className="overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-base font-semibold tracking-tight text-ink-900">Balance trend</h2>
          <p className="text-xs text-ink-400">
            {account.name} •••• {account.mask} · last 6 months
          </p>
        </div>
        <div className="px-3 py-4">
          <TrendChart data={balance} />
        </div>
      </Surface>

      {largest.length > 0 && (
        <section>
          <SectionHeader title="Largest payments" />
          <Surface index={4} className="divide-y divide-line overflow-hidden">
            {largest.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} hidden={hidden} />
            ))}
          </Surface>
        </section>
      )}
    </div>
  );
}

function Figure({
  label,
  value,
  hidden,
  tone,
}: {
  label: string;
  value: number;
  hidden: boolean;
  tone: "pos" | "ink" | "net";
}) {
  const Icon = tone === "pos" ? ArrowDownLeft : ArrowUpRight;
  return (
    <div className="px-4 py-4">
      <p className="flex items-center gap-1.5 text-xs font-medium text-ink-400">
        {tone !== "net" && <Icon className="h-3.5 w-3.5" />}
        {label}
      </p>
      <p
        className={`tnum mt-1.5 text-lg font-semibold tracking-tight ${
          tone === "pos" ? "text-pos-500" : "text-ink-900"
        }`}
      >
        {hidden ? "•••" : tone === "net" ? money(value, { signed: true, compact: true }) : money(value, { compact: true })}
      </p>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-2xs font-medium text-ink-400">
      <span className={`h-2 w-2 rounded-3xl ${color}`} />
      {label}
    </span>
  );
}
