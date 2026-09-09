"use client";

import * as React from "react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { CATEGORY_LABEL } from "./category-icon";
import type { Category } from "@/lib/types";
import type { TxFilters } from "@/lib/selectors";
import { cn } from "@/lib/utils";

const CATEGORIES: Category[] = [
  "food",
  "groceries",
  "transport",
  "shopping",
  "entertainment",
  "subscriptions",
  "bills",
  "housing",
  "health",
  "travel",
  "income",
  "transfer",
  "deposit",
  "atm",
];

const RANGES = [
  { label: "Any time", days: 0 },
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

/** Mobile-first filter sheet. Every control here actually narrows the data. */
export function FilterSheet({
  open,
  onClose,
  filters,
  onApply,
  accounts,
}: {
  open: boolean;
  onClose: () => void;
  filters: TxFilters;
  onApply: (f: TxFilters) => void;
  accounts: { id: string; name: string; mask: string }[];
}) {
  const [draft, setDraft] = React.useState<TxFilters>(filters);
  const [range, setRange] = React.useState(0);

  React.useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  const toggleCategory = (c: Category) =>
    setDraft((d) => {
      const list = d.categories ?? [];
      return {
        ...d,
        categories: list.includes(c) ? list.filter((x) => x !== c) : [...list, c],
      };
    });

  const applyRange = (days: number) => {
    setRange(days);
    if (!days) {
      setDraft((d) => ({ ...d, from: undefined, to: undefined }));
      return;
    }
    const from = new Date();
    from.setDate(from.getDate() - days);
    setDraft((d) => ({ ...d, from: from.toISOString(), to: undefined }));
  };

  const reset = () => {
    setRange(0);
    setDraft({ query: filters.query, direction: "all" });
  };

  return (
    <Sheet open={open} onClose={onClose} title="Filter activity" description="Narrow the ledger down to what you're looking for.">
      <div className="space-y-5">
        <div>
          <p className="mb-1.5 text-xs font-semibold text-ink-500">Direction</p>
          <Segmented
            id="dir"
            value={draft.direction ?? "all"}
            onChange={(v) => setDraft((d) => ({ ...d, direction: v }))}
            options={[
              { value: "all", label: "All" },
              { value: "in", label: "Money in" },
              { value: "out", label: "Money out" },
            ]}
          />
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold text-ink-500">Method</p>
          <Segmented
            id="method"
            value={draft.method ?? "all"}
            onChange={(v) => setDraft((d) => ({ ...d, method: v }))}
            options={[
              { value: "all", label: "Any" },
              { value: "card", label: "Card" },
              { value: "ach", label: "ACH" },
              { value: "internal", label: "Internal" },
            ]}
          />
        </div>

        {accounts.length > 1 && (
          <div>
            <p className="mb-1.5 text-xs font-semibold text-ink-500">Account</p>
            <div className="flex flex-wrap gap-1.5">
              <FilterChip
                active={!draft.accountId}
                onClick={() => setDraft((d) => ({ ...d, accountId: undefined }))}
              >
                All accounts
              </FilterChip>
              {accounts.map((a) => (
                <FilterChip
                  key={a.id}
                  active={draft.accountId === a.id}
                  onClick={() => setDraft((d) => ({ ...d, accountId: a.id }))}
                >
                  {a.name.replace("Auremont ", "")} ••{a.mask}
                </FilterChip>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="mb-1.5 text-xs font-semibold text-ink-500">Date range</p>
          <div className="flex flex-wrap gap-1.5">
            {RANGES.map((r) => (
              <FilterChip key={r.label} active={range === r.days} onClick={() => applyRange(r.days)}>
                {r.label}
              </FilterChip>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold text-ink-500">Categories</p>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <FilterChip
                key={c}
                active={(draft.categories ?? []).includes(c)}
                onClick={() => toggleCategory(c)}
              >
                {CATEGORY_LABEL[c]}
              </FilterChip>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold text-ink-500">Amount</p>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              inputMode="decimal"
              placeholder="Min"
              aria-label="Minimum amount"
              value={draft.min ?? ""}
              onChange={(e) =>
                setDraft((d) => ({ ...d, min: e.target.value ? Number(e.target.value) : undefined }))
              }
            />
            <span className="text-ink-300">–</span>
            <Input
              type="number"
              inputMode="decimal"
              placeholder="Max"
              aria-label="Maximum amount"
              value={draft.max ?? ""}
              onChange={(e) =>
                setDraft((d) => ({ ...d, max: e.target.value ? Number(e.target.value) : undefined }))
              }
            />
          </div>
        </div>

        <div className="flex gap-2.5 pt-1">
          <Button variant="secondary" size="lg" className="flex-1" onClick={reset}>
            Reset
          </Button>
          <Button
            size="lg"
            className="flex-[1.6]"
            onClick={() => {
              onApply(draft);
              onClose();
            }}
          >
            Show results
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "press rounded-sm border px-2.5 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "border-ink-900 bg-ink-900 text-action-fg"
          : "border-line-strong bg-surface text-ink-500 hover:border-ink-300 hover:text-ink-800"
      )}
    >
      {children}
    </button>
  );
}
