"use client";

import type { Transaction } from "@/lib/types";
import { groupByDay } from "@/lib/selectors";
import { TransactionRow } from "./transaction-row";
import { money } from "@/lib/utils";

/** Day-grouped ledger with a net figure per day — how a statement reads. */
export function TransactionList({
  transactions,
  hidden,
  showDayTotals = true,
}: {
  transactions: Transaction[];
  hidden?: boolean;
  showDayTotals?: boolean;
}) {
  const groups = groupByDay(transactions);

  return (
    <div className="space-y-5">
      {groups.map((group) => {
        const net = group.items.reduce((n, t) => n + t.amount, 0);
        return (
          <section key={group.label}>
            <div className="mb-2 flex items-baseline justify-between px-1">
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.09em] text-ink-400">
                {group.label}
              </h3>
              {showDayTotals && !hidden && (
                <span className="tnum text-xs font-medium text-ink-400">
                  {net >= 0 ? "+" : "−"}
                  {money(Math.abs(net))}
                </span>
              )}
            </div>
            <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface shadow-e1">
              {group.items.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} hidden={hidden} showTime />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
