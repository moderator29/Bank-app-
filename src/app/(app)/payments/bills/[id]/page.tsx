"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarClock, Landmark, Receipt, Repeat } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Surface, Chip, IconTile } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { ListGroup, ListRow, Toggle } from "@/components/ui/list";
import { PickRow } from "@/components/ui/pick-row";
import { MoneyFlow } from "@/components/ui/money-flow";
import { EmptyState } from "@/components/shared/empty-state";
import { CategoryIcon } from "@/components/activity/category-icon";
import { TransactionRow } from "@/components/activity/transaction-row";
import { useBank } from "@/lib/store";
import { accountById } from "@/lib/selectors";
import { useDepositAccounts, useTransactions } from "@/lib/hooks";
import { dueLabel, formatDate, money } from "@/lib/utils";

export default function BillDetailPage() {
  const { id } = useParams<{ id: string }>();
  const bill = useBank((s) => s.bills.find((b) => b.id === id));
  const account = useBank((s) => (bill ? accountById(s, bill.accountId) : undefined));
  const accounts = useDepositAccounts();
  const payBill = useBank((s) => s.payBill);
  const toggleAutopay = useBank((s) => s.toggleAutopay);
  const setBillAccount = useBank((s) => s.setBillAccount);
  const allTransactions = useTransactions();
  const history = React.useMemo(
    () => (bill ? allTransactions.filter((t) => t.merchant === bill.name).slice(0, 6) : []),
    [allTransactions, bill]
  );

  const [paying, setPaying] = React.useState(false);
  const [methodOpen, setMethodOpen] = React.useState(false);

  if (!bill) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title="Bill" back="/payments/bills" />
        <EmptyState
          icon={Receipt}
          title="We couldn't find that bill"
          body="It may have been removed from your billers."
          action={
            <Link href="/payments/bills">
              <Button>Back to bills</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const settled = bill.status === "paid";
  const reviewRows = [
    { label: "Biller", value: bill.name },
    { label: "For", value: bill.service },
    { label: "From", value: `${account?.name} •••• ${account?.mask}` },
    { label: "Arrives", value: "In 1–2 business days" },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-4">
      <PageHeader title={bill.name} subtitle={bill.service} back="/payments/bills" />

      {paying ? (
        <MoneyFlow
          amount={bill.amount}
          available={account?.available}
          submitLabel="Pay bill"
          reviewTitle="Amount due"
          reviewRows={reviewRows}
          onConfirm={() => payBill(bill.id, bill.accountId)}
          success={{
            title: "Bill paid",
            body: `${bill.name} has been paid from ${account?.name}.`,
            rows: reviewRows,
            primary: { label: "Done", href: "/payments/bills" },
            secondary: { label: "See activity", href: "/activity" },
          }}
        >
          <Surface className="overflow-hidden">
            <div className="flex items-center gap-3.5 px-5 py-5">
              <CategoryIcon category={bill.category} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-ink-900">{bill.name}</p>
                <p className="mt-0.5 text-sm text-ink-400">{dueLabel(bill.dueDate)}</p>
              </div>
              <p className="tnum shrink-0 text-xl font-semibold text-ink-900">
                {money(bill.amount)}
              </p>
            </div>
          </Surface>
          <div className="space-y-2">
            <p className="px-1 text-xs font-semibold text-ink-500">Pay from</p>
            {accounts.map((a) => (
              <PickRow
                key={a.id}
                active={bill.accountId === a.id}
                onClick={() => setBillAccount(bill.id, a.id)}
                title={a.name}
                detail={`•••• ${a.mask}`}
                value={money(a.available)}
              />
            ))}
          </div>
        </MoneyFlow>
      ) : (
        <>
          <Surface variant="navy" radius="3xl" index={0} className="p-6">
            <p className="text-sm font-medium text-brass-200">
              {settled ? "Last payment" : "Amount due"}
            </p>
            <p className="tnum mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {money(settled ? (bill.lastPaidAmount ?? bill.amount) : bill.amount)}
            </p>
            <p className="mt-2 text-sm text-white/50">
              {settled && bill.lastPaidAt
                ? `Paid ${formatDate(bill.lastPaidAt)} · next due ${formatDate(bill.dueDate, "short")}`
                : `${dueLabel(bill.dueDate)} · ${formatDate(bill.dueDate)}`}
            </p>
            {bill.autopay && (
              <span className="mt-4 inline-flex items-center gap-1.5 rounded-xs border border-white/10 bg-white/8 px-2.5 py-1.5 text-2xs font-semibold text-brass-100">
                <Repeat className="h-3 w-3" />
                Autopay is on
              </span>
            )}
          </Surface>

          {settled ? (
            <Surface variant="sunken" className="px-4 py-3.5 text-sm leading-relaxed text-ink-500">
              This bill is settled for the current cycle. We&apos;ll remind you before the next
              one is due on {formatDate(bill.dueDate)}.
            </Surface>
          ) : (
            <Button block size="lg" onClick={() => setPaying(true)}>
              Pay {money(bill.amount)}
            </Button>
          )}

          <ListGroup label="Payment settings">
            <ListRow
              icon={<IconTile tone="neutral"><Repeat /></IconTile>}
              title="Autopay"
              detail={
                bill.autopay
                  ? `We'll pay this automatically on the due date`
                  : "Pay this bill automatically each cycle"
              }
              value={
                <Toggle
                  checked={bill.autopay}
                  onChange={() => toggleAutopay(bill.id)}
                  label="Autopay"
                />
              }
              chevron={false}
            />
            <ListRow
              icon={<IconTile tone="neutral"><Landmark /></IconTile>}
              title="Payment method"
              detail={`${account?.name} •••• ${account?.mask}`}
              onClick={() => setMethodOpen(true)}
            />
            <ListRow
              icon={<IconTile tone="neutral"><CalendarClock /></IconTile>}
              title="Due date"
              detail={formatDate(bill.dueDate, "long")}
              value={<Chip tone={settled ? "pos" : "warn"}>{settled ? "Paid" : "Due"}</Chip>}
              chevron={false}
            />
          </ListGroup>

          {history.length > 0 && (
            <section>
              <p className="mb-2 px-1 text-[13px] font-semibold uppercase tracking-[0.09em] text-ink-400">
                Payment history
              </p>
              <Surface className="divide-y divide-line overflow-hidden">
                {history.map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} />
                ))}
              </Surface>
            </section>
          )}
        </>
      )}

      <Sheet
        open={methodOpen}
        onClose={() => setMethodOpen(false)}
        title="Payment method"
        description="Choose which account this bill is paid from."
      >
        <div className="space-y-2">
          {accounts.map((a) => (
            <PickRow
              key={a.id}
              active={bill.accountId === a.id}
              onClick={() => {
                setBillAccount(bill.id, a.id);
                setMethodOpen(false);
              }}
              title={a.name}
              detail={`•••• ${a.mask}`}
              value={money(a.available)}
            />
          ))}
        </div>
      </Sheet>
    </div>
  );
}
