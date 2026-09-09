"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarClock, ChevronRight, Plus, Receipt } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Surface, SectionHeader, Chip } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Field, Input } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { EmptyState } from "@/components/shared/empty-state";
import { CategoryIcon } from "@/components/activity/category-icon";
import { useBank } from "@/lib/store";
import { billTotalDue } from "@/lib/selectors";
import { usePaidBills, useUpcomingBills } from "@/lib/hooks";
import { dueLabel, formatDate, money } from "@/lib/utils";
import type { Bill } from "@/lib/types";

export default function BillsPage() {
  const upcoming = useUpcomingBills();
  const paid = usePaidBills();
  const accounts = useBank((s) => s.accounts);
  const addBill = useBank((s) => s.addBill);
  const hidden = useBank((s) => s.balanceHidden);

  const [tab, setTab] = React.useState<"upcoming" | "paid">("upcoming");
  const [addOpen, setAddOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [service, setService] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const total = billTotalDue(upcoming);
  const list = tab === "upcoming" ? upcoming : paid;

  const save = () => {
    if (name.trim().length < 2) return setError("Enter the biller's name.");
    const value = Number(amount);
    if (!value || value <= 0) return setError("Enter the amount due.");
    const due = new Date();
    due.setDate(due.getDate() + 14);
    addBill({
      name: name.trim(),
      service: service.trim() || "Bill",
      amount: value,
      dueDate: due.toISOString(),
      autopay: false,
      category: "bills",
      accountId: accounts[0].id,
    });
    setName("");
    setService("");
    setAmount("");
    setError(null);
    setAddOpen(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-4">
      <PageHeader
        title="Bills"
        subtitle="Everything scheduled to leave your account."
        back="/payments"
        action={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add biller
          </Button>
        }
      />

      <Surface variant="navy" radius="3xl" index={0} className="p-6">
        <p className="text-sm font-medium text-brass-200">Due over the next 30 days</p>
        <p className="tnum mt-2 text-3xl font-semibold tracking-tight text-white">
          {hidden ? "••••••" : money(total)}
        </p>
        <p className="mt-2 text-sm text-white/50">
          {upcoming.length} {upcoming.length === 1 ? "bill" : "bills"} ·{" "}
          {upcoming.filter((b) => b.autopay).length} on autopay
        </p>
      </Surface>

      <Segmented
        id="bills-tab"
        value={tab}
        onChange={setTab}
        options={[
          { value: "upcoming", label: `Upcoming (${upcoming.length})` },
          { value: "paid", label: `Paid (${paid.length})` },
        ]}
      />

      {list.length === 0 ? (
        <EmptyState
          icon={tab === "upcoming" ? CalendarClock : Receipt}
          title={tab === "upcoming" ? "No bills due" : "Nothing paid yet"}
          body={
            tab === "upcoming"
              ? "You're all caught up. New bills will appear here as they're issued."
              : "Bills you've paid will be listed here with the date and amount."
          }
          action={
            tab === "upcoming" ? (
              <Button onClick={() => setAddOpen(true)}>Add a biller</Button>
            ) : undefined
          }
        />
      ) : (
        <section>
          <SectionHeader title={tab === "upcoming" ? "Scheduled and due" : "Recently paid"} />
          <Surface className="divide-y divide-line overflow-hidden">
            {list.map((bill) => (
              <BillRow key={bill.id} bill={bill} hidden={hidden} paid={tab === "paid"} />
            ))}
          </Surface>
        </section>
      )}

      <Sheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add a biller"
        description="We'll track the due date and let you pay in one tap."
      >
        <div className="space-y-4">
          <Field label="Biller name">
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="Xfinity"
            />
          </Field>
          <Field label="What it's for" hint="Electric, internet, insurance…">
            <Input value={service} onChange={(e) => setService(e.target.value)} placeholder="Internet" />
          </Field>
          <Field label="Amount due" error={error}>
            <Input
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value.replace(/[^\d.]/g, ""));
                setError(null);
              }}
              placeholder="0.00"
            />
          </Field>
          <Button block size="lg" onClick={save}>
            Add biller
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

function BillRow({ bill, hidden, paid }: { bill: Bill; hidden: boolean; paid: boolean }) {
  return (
    <Link
      href={`/payments/bills/${bill.id}`}
      className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-ink-25"
    >
      <CategoryIcon category={bill.category} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-medium text-ink-900">{bill.name}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-sm text-ink-400">
          {paid && bill.lastPaidAt
            ? `Paid ${formatDate(bill.lastPaidAt, "short")}`
            : dueLabel(bill.dueDate)}
          {bill.autopay && <Chip tone="pos">Autopay</Chip>}
        </p>
      </div>
      <span className="tnum shrink-0 text-base font-semibold text-ink-900">
        {hidden ? "•••" : money(paid ? (bill.lastPaidAmount ?? bill.amount) : bill.amount)}
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-ink-300" />
    </Link>
  );
}
