"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { ChartPie, ListFilter, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Surface, Chip } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { EmptyState } from "@/components/shared/empty-state";
import { TransactionList } from "@/components/activity/transaction-list";
import { FilterSheet } from "@/components/activity/filter-sheet";
import { CATEGORY_LABEL } from "@/components/activity/category-icon";
import { useBank } from "@/lib/store";
import { filterTransactions, type TxFilters } from "@/lib/selectors";
import { money } from "@/lib/utils";

type Tab = "all" | "in" | "out" | "pending";

const TABS: { value: Tab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "in", label: "Money in" },
  { value: "out", label: "Money out" },
  { value: "pending", label: "Pending" },
];

const PAGE = 40;

export default function ActivityPage() {
  const params = useSearchParams();
  const accountParam = params.get("account") ?? undefined;

  const transactions = useBank((s) => s.transactions);
  const accounts = useBank((s) => s.accounts);
  const hidden = useBank((s) => s.balanceHidden);

  const [tab, setTab] = React.useState<Tab>("all");
  const [query, setQuery] = React.useState("");
  const [filters, setFilters] = React.useState<TxFilters>({ accountId: accountParam });
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [limit, setLimit] = React.useState(PAGE);

  React.useEffect(() => {
    setFilters((f) => ({ ...f, accountId: accountParam }));
  }, [accountParam]);

  const results = React.useMemo(() => {
    const base = filterTransactions(transactions, {
      ...filters,
      query,
      direction: tab === "in" ? "in" : tab === "out" ? "out" : filters.direction,
    });
    return tab === "pending" ? base.filter((t) => t.status === "pending") : base;
  }, [transactions, filters, query, tab]);

  const shown = results.slice(0, limit);
  const totals = React.useMemo(() => {
    let inflow = 0;
    let outflow = 0;
    for (const t of results) {
      if (t.amount > 0) inflow += t.amount;
      else outflow += -t.amount;
    }
    return { inflow, outflow };
  }, [results]);

  const activeChips = [
    filters.accountId && {
      key: "account",
      label:
        accounts.find((a) => a.id === filters.accountId)?.name.replace("Auremont ", "") ??
        "Account",
      clear: () => setFilters((f) => ({ ...f, accountId: undefined })),
    },
    filters.method &&
      filters.method !== "all" && {
        key: "method",
        label: filters.method === "ach" ? "ACH" : filters.method === "card" ? "Card" : "Internal",
        clear: () => setFilters((f) => ({ ...f, method: "all" })),
      },
    filters.from && {
      key: "from",
      label: "Date range",
      clear: () => setFilters((f) => ({ ...f, from: undefined, to: undefined })),
    },
    (filters.min !== undefined || filters.max !== undefined) && {
      key: "amount",
      label: "Amount",
      clear: () => setFilters((f) => ({ ...f, min: undefined, max: undefined })),
    },
    ...(filters.categories ?? []).map((c) => ({
      key: `cat-${c}`,
      label: CATEGORY_LABEL[c],
      clear: () =>
        setFilters((f) => ({
          ...f,
          categories: (f.categories ?? []).filter((x) => x !== c),
        })),
    })),
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-4">
      <PageHeader
        title="Activity"
        subtitle="Every transaction across your accounts."
        action={
          <Link href="/insights">
            <Button variant="secondary" size="sm">
              <ChartPie className="h-4 w-4" />
              Insights
            </Button>
          </Link>
        }
      />

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(PAGE);
            }}
            placeholder="Search merchants, notes, references"
            aria-label="Search activity"
            className="pl-10 pr-10"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="press absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-sm text-ink-400 hover:bg-ink-50 hover:text-ink-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          variant="secondary"
          size="md"
          onClick={() => setSheetOpen(true)}
          aria-label="Filter activity"
          className="shrink-0"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filter</span>
          {activeChips.length > 0 && (
            <span className="tnum ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-3xl bg-ink-900 px-1 text-2xs font-bold text-action-fg">
              {activeChips.length}
            </span>
          )}
        </Button>
      </div>

      <Segmented
        id="activity-tab"
        value={tab}
        onChange={(v) => {
          setTab(v);
          setLimit(PAGE);
        }}
        options={TABS}
      />

      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              onClick={chip.clear}
              className="press inline-flex items-center gap-1.5 rounded-xs border border-line-strong bg-surface/55 px-2.5 py-1.5 backdrop-blur-sm text-2xs font-semibold text-ink-600 hover:border-ink-300"
            >
              {chip.label}
              <X className="h-3 w-3" />
            </button>
          ))}
          <button
            onClick={() => setFilters({ direction: "all" })}
            className="press rounded-xs px-2 py-1.5 text-2xs font-semibold text-ink-400 hover:text-ink-800"
          >
            Clear all
          </button>
        </div>
      )}

      {results.length > 0 && (
        <Surface variant="sunken" className="flex items-center justify-between gap-4 px-4 py-3">
          <p className="text-sm text-ink-400">
            <span className="tnum font-semibold text-ink-900">{results.length}</span>{" "}
            {results.length === 1 ? "transaction" : "transactions"}
          </p>
          {!hidden && (
            <p className="tnum text-sm text-ink-400">
              <span className="font-semibold text-pos-500">+{money(totals.inflow, { compact: true })}</span>
              {"  "}
              <span className="mx-1.5 text-ink-200">/</span>
              <span className="font-semibold text-ink-900">−{money(totals.outflow, { compact: true })}</span>
            </p>
          )}
        </Surface>
      )}

      {results.length === 0 ? (
        <EmptyState
          icon={ListFilter}
          title={query ? `No results for "${query}"` : "Nothing matches those filters"}
          body="Try a different search term, widen the date range, or clear a filter or two."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setQuery("");
                setFilters({ direction: "all" });
                setTab("all");
              }}
            >
              Clear search and filters
            </Button>
          }
        />
      ) : (
        <>
          <TransactionList transactions={shown} hidden={hidden} />
          {results.length > shown.length && (
            <Button
              variant="secondary"
              block
              onClick={() => setLimit((l) => l + PAGE)}
            >
              Show more ({results.length - shown.length} remaining)
            </Button>
          )}
        </>
      )}

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        filters={filters}
        onApply={(f) => {
          setFilters(f);
          setLimit(PAGE);
        }}
        accounts={accounts.map((a) => ({ id: a.id, name: a.name, mask: a.mask }))}
      />
    </div>
  );
}
