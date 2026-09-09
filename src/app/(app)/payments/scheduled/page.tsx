"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarClock, Pause, Play, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Surface, SectionHeader, Chip } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { CategoryIcon } from "@/components/activity/category-icon";
import { useBank } from "@/lib/store";
import { accountById } from "@/lib/selectors";
import { formatDate, money } from "@/lib/utils";
import type { ScheduledPayment } from "@/lib/types";

const FREQUENCY: Record<ScheduledPayment["frequency"], string> = {
  once: "One time",
  weekly: "Every week",
  biweekly: "Every two weeks",
  monthly: "Every month",
};

export default function ScheduledPage() {
  const scheduled = useBank((s) => s.scheduled);
  const toggle = useBank((s) => s.toggleSchedule);
  const cancel = useBank((s) => s.cancelSchedule);
  const hidden = useBank((s) => s.balanceHidden);

  const [cancelling, setCancelling] = React.useState<string | null>(null);
  const target = scheduled.find((p) => p.id === cancelling);

  const active = scheduled
    .filter((p) => p.active)
    .sort((a, b) => +new Date(a.nextDate) - +new Date(b.nextDate));
  const paused = scheduled.filter((p) => !p.active);
  const monthlyTotal = active
    .filter((p) => p.frequency === "monthly")
    .reduce((n, p) => n + p.amount, 0);

  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-4">
      <PageHeader
        title="Scheduled payments"
        subtitle="Autopay, standing transfers and anything else set to repeat."
        back="/payments"
      />

      {scheduled.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="Nothing scheduled"
          body="Set up autopay on a bill or a repeating transfer and it will appear here."
          action={
            <Link href="/payments/bills">
              <Button>Go to bills</Button>
            </Link>
          }
        />
      ) : (
        <>
          <Surface variant="sunken" className="flex items-baseline justify-between gap-4 px-5 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.09em] text-ink-400">
                Repeating monthly
              </p>
              <p className="tnum mt-1.5 text-2xl font-semibold tracking-tight text-ink-900">
                {hidden ? "••••••" : money(monthlyTotal)}
              </p>
            </div>
            <p className="text-sm text-ink-400">
              {active.length} active · {paused.length} paused
            </p>
          </Surface>

          {active.length > 0 && (
            <section>
              <SectionHeader title="Active" />
              <Surface className="divide-y divide-line overflow-hidden">
                {active.map((p) => (
                  <ScheduleRow
                    key={p.id}
                    payment={p}
                    hidden={hidden}
                    onToggle={() => toggle(p.id)}
                    onCancel={() => setCancelling(p.id)}
                  />
                ))}
              </Surface>
            </section>
          )}

          {paused.length > 0 && (
            <section>
              <SectionHeader title="Paused" />
              <Surface className="divide-y divide-line overflow-hidden">
                {paused.map((p) => (
                  <ScheduleRow
                    key={p.id}
                    payment={p}
                    hidden={hidden}
                    onToggle={() => toggle(p.id)}
                    onCancel={() => setCancelling(p.id)}
                  />
                ))}
              </Surface>
            </section>
          )}
        </>
      )}

      <Sheet
        open={Boolean(cancelling)}
        onClose={() => setCancelling(null)}
        title="Cancel this payment?"
        description={
          target
            ? `${target.target} will no longer be paid automatically. You can still pay it manually at any time.`
            : ""
        }
      >
        <div className="flex gap-2.5">
          <Button variant="secondary" size="lg" className="flex-1" onClick={() => setCancelling(null)}>
            Keep it
          </Button>
          <Button
            variant="danger"
            size="lg"
            className="flex-1"
            onClick={() => {
              if (cancelling) cancel(cancelling);
              setCancelling(null);
            }}
          >
            Cancel payment
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

function ScheduleRow({
  payment,
  hidden,
  onToggle,
  onCancel,
}: {
  payment: ScheduledPayment;
  hidden: boolean;
  onToggle: () => void;
  onCancel: () => void;
}) {
  const account = useBank((s) => accountById(s, payment.fromAccountId));
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <CategoryIcon
        category={payment.kind === "bill" ? "bills" : "transfer"}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-medium text-ink-900">{payment.target}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-1.5 truncate text-sm text-ink-400">
          {FREQUENCY[payment.frequency]} · next {formatDate(payment.nextDate, "short")}
          {!payment.active && <Chip tone="warn">Paused</Chip>}
        </p>
        <p className="mask-dots mt-0.5 truncate text-xs text-ink-400">
          From {account?.name} •••• {account?.mask}
        </p>
      </div>
      <span className="tnum shrink-0 text-base font-semibold text-ink-900">
        {hidden ? "•••" : money(payment.amount)}
      </span>
      <button
        onClick={onToggle}
        aria-label={payment.active ? `Pause ${payment.target}` : `Resume ${payment.target}`}
        className="press flex h-9 w-9 items-center justify-center rounded-sm text-ink-500 hover:bg-ink-50 hover:text-ink-900"
      >
        {payment.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
      <button
        onClick={onCancel}
        aria-label={`Cancel ${payment.target}`}
        className="press flex h-9 w-9 items-center justify-center rounded-sm text-ink-400 hover:bg-neg-50 hover:text-neg-500"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
