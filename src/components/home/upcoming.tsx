"use client";

import Link from "next/link";
import { CalendarClock, ChevronRight } from "lucide-react";
import { Surface, Chip } from "@/components/ui/surface";
import { CategoryIcon } from "@/components/activity/category-icon";
import { useBank } from "@/lib/store";
import { billTotalDue, upcomingBills } from "@/lib/selectors";
import { dueLabel, money } from "@/lib/utils";

/** What's leaving the account next — the question people open a bank app to ask. */
export function Upcoming() {
  const bills = useBank(upcomingBills);
  const hidden = useBank((s) => s.balanceHidden);
  const next = bills.slice(0, 3);
  const total = billTotalDue(bills);

  if (bills.length === 0) return null;

  return (
    <Surface index={3} className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div className="flex items-center gap-2.5">
          <CalendarClock className="h-[18px] w-[18px] text-ink-400" />
          <div>
            <h2 className="text-base font-semibold tracking-tight text-ink-900">Coming up</h2>
            <p className="tnum text-xs text-ink-400">
              {hidden ? "•••" : money(total)} across {bills.length}{" "}
              {bills.length === 1 ? "bill" : "bills"}
            </p>
          </div>
        </div>
        <Link
          href="/payments/bills"
          className="press rounded-md px-2.5 py-1.5 text-sm font-semibold text-ink-600 hover:bg-ink-50 hover:text-ink-900"
        >
          All bills
        </Link>
      </div>

      <div className="divide-y divide-line">
        {next.map((bill) => (
          <Link
            key={bill.id}
            href={`/payments/bills/${bill.id}`}
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-ink-25"
          >
            <CategoryIcon category={bill.category} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-medium text-ink-900">{bill.name}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-400">
                {dueLabel(bill.dueDate)}
                {bill.autopay && <Chip tone="pos">Autopay</Chip>}
              </p>
            </div>
            <span className="tnum shrink-0 text-base font-semibold text-ink-900">
              {hidden ? "•••" : money(bill.amount)}
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-ink-300" />
          </Link>
        ))}
      </div>
    </Surface>
  );
}
