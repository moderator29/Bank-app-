"use client";

import Link from "next/link";
import type { Transaction } from "@/lib/types";
import { CategoryIcon, CATEGORY_LABEL } from "./category-icon";
import { Money } from "@/components/ui/money";
import { cn, formatTime } from "@/lib/utils";

/** One ledger line. Tapping it always opens the full transaction detail. */
export function TransactionRow({
  tx,
  showTime,
  hidden,
  className,
}: {
  tx: Transaction;
  showTime?: boolean;
  hidden?: boolean;
  className?: string;
}) {
  const incoming = tx.amount > 0;

  return (
    <Link
      href={`/activity/${tx.id}`}
      className={cn(
        "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-ink-25 active:bg-ink-50",
        className
      )}
    >
      <CategoryIcon category={tx.category} incoming={incoming} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-medium text-ink-900">{tx.merchant}</p>
        <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-ink-400">
          <span className="truncate">{CATEGORY_LABEL[tx.category]}</span>
          {showTime && (
            <>
              <span aria-hidden className="text-ink-200">·</span>
              <span className="tnum shrink-0">{formatTime(tx.date)}</span>
            </>
          )}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <Money value={tx.amount} hidden={hidden} className="text-base font-semibold" />
        {tx.status === "pending" && (
          <p className="mt-0.5 text-2xs font-semibold uppercase tracking-wide text-warn-500">
            Pending
          </p>
        )}
      </div>
    </Link>
  );
}
