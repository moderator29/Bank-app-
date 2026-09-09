"use client";

import Link from "next/link";
import {
  ArrowLeftRight,
  CalendarClock,
  ChevronRight,
  Plus,
  Receipt,
  Repeat,
  Send,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Surface, SectionHeader, Chip, IconTile } from "@/components/ui/surface";
import { ListGroup, ListRow } from "@/components/ui/list";
import { Avatar } from "@/components/ui/avatar";
import { useBank } from "@/lib/store";
import {
  activeSchedules,
  billTotalDue,
  monthlyRecurringTotal,
  upcomingBills,
} from "@/lib/selectors";
import { dueLabel, formatDate, money } from "@/lib/utils";

const PRIMARY = [
  {
    href: "/payments/transfer",
    icon: ArrowLeftRight,
    title: "Transfer",
    detail: "Move money between your accounts",
  },
  {
    href: "/payments/send",
    icon: Send,
    title: "Send money",
    detail: "Pay a person or a saved recipient",
  },
  {
    href: "/payments/bills",
    icon: Receipt,
    title: "Pay a bill",
    detail: "Billers, autopay and due dates",
  },
  {
    href: "/deposit",
    icon: Plus,
    title: "Add money",
    detail: "Deposit a check or pull from a linked bank",
  },
];

export default function PaymentsPage() {
  const bills = useBank(upcomingBills);
  const schedules = useBank(activeSchedules);
  const recurring = useBank(monthlyRecurringTotal);
  const payees = useBank((s) => s.payees);
  const hidden = useBank((s) => s.balanceHidden);

  const favorites = payees.filter((p) => p.kind === "person").slice(0, 5);
  const nextBill = bills[0];

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-4">
      <PageHeader title="Payments" subtitle="Move money, pay bills and manage what recurs." />

      <div className="grid gap-3 sm:grid-cols-2">
        {PRIMARY.map((item, i) => (
          <Surface key={item.href} index={i} className="overflow-hidden">
            <Link
              href={item.href}
              className="flex items-center gap-3.5 px-5 py-4 transition-colors hover:bg-ink-25"
            >
              <IconTile tone="navy" size="lg">
                <item.icon />
              </IconTile>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-ink-900">{item.title}</span>
                <span className="mt-0.5 block text-sm leading-snug text-ink-400">
                  {item.detail}
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-ink-300" />
            </Link>
          </Surface>
        ))}
      </div>

      {favorites.length > 0 && (
        <section>
          <SectionHeader
            title="Send again"
            action={
              <Link
                href="/payments/recipients"
                className="text-sm font-semibold text-ink-600 hover:text-ink-900"
              >
                All recipients
              </Link>
            }
          />
          <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            {favorites.map((payee) => (
              <Link
                key={payee.id}
                href={`/payments/send?payee=${payee.id}`}
                className="press flex w-[92px] shrink-0 flex-col items-center gap-2 rounded-xl border border-line bg-surface px-2 py-3.5 shadow-e1 hover:border-line-strong"
              >
                <Avatar name={payee.name} />
                <span className="line-clamp-2 text-center text-[11px] font-semibold leading-tight text-ink-700">
                  {payee.name}
                </span>
              </Link>
            ))}
            <Link
              href="/payments/recipients"
              className="press flex w-[92px] shrink-0 flex-col items-center gap-2 rounded-xl border border-dashed border-line-strong bg-surface-sunken px-2 py-3.5 hover:border-ink-300"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-50 text-ink-500">
                <Plus className="h-[18px] w-[18px]" />
              </span>
              <span className="text-center text-[11px] font-semibold leading-tight text-ink-600">
                Add new
              </span>
            </Link>
          </div>
        </section>
      )}

      <ListGroup label="Scheduled & recurring">
        <ListRow
          icon={<IconTile tone="neutral"><CalendarClock /></IconTile>}
          title="Scheduled payments"
          detail={
            schedules.length
              ? `Next: ${schedules[0].target} · ${formatDate(schedules[0].nextDate, "short")}`
              : "Nothing scheduled"
          }
          value={
            schedules.length ? <Chip tone="neutral">{schedules.length}</Chip> : undefined
          }
          href="/payments/scheduled"
        />
        <ListRow
          icon={<IconTile tone="neutral"><Repeat /></IconTile>}
          title="Recurring payments"
          detail={hidden ? "Subscriptions and regular bills" : `${money(recurring)} a month`}
          href="/insights/subscriptions"
        />
        <ListRow
          icon={<IconTile tone="neutral"><Users /></IconTile>}
          title="Recipients"
          detail={`${payees.length} saved`}
          href="/payments/recipients"
        />
      </ListGroup>

      {nextBill && (
        <Surface variant="sunken" className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.09em] text-ink-400">
            Next payment due
          </p>
          <div className="mt-2.5 flex items-baseline justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-ink-900">{nextBill.name}</p>
              <p className="mt-0.5 text-sm text-ink-400">{dueLabel(nextBill.dueDate)}</p>
            </div>
            <p className="tnum shrink-0 text-xl font-semibold text-ink-900">
              {hidden ? "•••" : money(nextBill.amount)}
            </p>
          </div>
          <p className="tnum mt-4 text-xs text-ink-400">
            {hidden ? "" : `${money(billTotalDue(bills))} due across ${bills.length} bills`}
          </p>
          <Link
            href={`/payments/bills/${nextBill.id}`}
            className="press mt-4 flex h-11 items-center justify-center rounded-md bg-action text-base font-semibold text-action-fg hover:bg-action-hover"
          >
            Review and pay
          </Link>
        </Surface>
      )}
    </div>
  );
}
