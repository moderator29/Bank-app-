"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowDown, Building2, Link2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { AmountInput, Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MoneyFlow } from "@/components/ui/money-flow";
import { PickRow } from "@/components/ui/pick-row";
import { EmptyState } from "@/components/shared/empty-state";
import { useBank } from "@/lib/store";
import { useDepositAccounts } from "@/lib/hooks";
import { money } from "@/lib/utils";

const QUICK = [100, 500, 1_000, 5_000];

export default function DepositTransferPage() {
  const accounts = useDepositAccounts();
  const externalAll = useBank((s) => s.externalAccounts);
  const depositFromExternal = useBank((s) => s.depositFromExternal);

  const external = React.useMemo(
    () => externalAll.filter((x) => x.status === "linked"),
    [externalAll]
  );

  const [extId, setExtId] = React.useState(external[0]?.id ?? "");
  const [toId, setToId] = React.useState(accounts[0]?.id ?? "");
  const [amount, setAmount] = React.useState("");
  const [note, setNote] = React.useState("");

  const ext = external.find((x) => x.id === extId);
  const to = accounts.find((a) => a.id === toId);
  const value = Number(amount) || 0;

  if (external.length === 0) {
    return (
      <div className="mx-auto max-w-xl space-y-5">
        <PageHeader title="Transfer from a bank" back="/deposit" />
        <EmptyState
          icon={Link2}
          title="No linked banks yet"
          body="Link an account at another bank and you can move money into Auremont in a couple of taps."
          action={
            <Link href="/accounts/external">
              <Button>Link a bank</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const reviewRows = [
    { label: "From", value: ext ? `${ext.institution} •••• ${ext.mask}` : "—" },
    { label: "To", value: `${to?.name} •••• ${to?.mask}` },
    { label: "Arrives", value: "In 1–3 business days" },
    ...(note ? [{ label: "Note", value: note }] : []),
  ];

  return (
    <div className="mx-auto max-w-xl space-y-5 pb-4">
      <PageHeader title="Transfer from a bank" back="/deposit" />

      <MoneyFlow
        amount={value}
        submitLabel="Transfer in"
        reviewRows={reviewRows}
        validate={() => (ext && to ? null : "Choose both accounts to continue.")}
        onConfirm={() => {
          if (ext && to) depositFromExternal(ext.id, to.id, value);
        }}
        success={{
          title: "Transfer started",
          body: "The money is on its way. We'll let you know as soon as it lands.",
          rows: reviewRows,
          primary: { label: "Done", href: "/home" },
          secondary: { label: "See activity", href: "/activity" },
        }}
      >
        <Field label="From">
          <div className="space-y-2">
            {external.map((x) => (
              <PickRow
                key={x.id}
                active={extId === x.id}
                onClick={() => setExtId(x.id)}
                title={x.nickname}
                detail={`${x.institution} · •••• ${x.mask}`}
                icon={<Building2 className="h-[18px] w-[18px]" />}
              />
            ))}
          </div>
        </Field>

        <div className="flex justify-center py-1">
          <span className="flex h-8 w-8 items-center justify-center rounded-3xl border border-line bg-surface text-ink-400 shadow-e1">
            <ArrowDown className="h-4 w-4" />
          </span>
        </div>

        <Field label="To">
          <div className="space-y-2">
            {accounts.map((a) => (
              <PickRow
                key={a.id}
                active={toId === a.id}
                onClick={() => setToId(a.id)}
                title={a.name}
                detail={`•••• ${a.mask}`}
                value={money(a.available, { compact: true })}
              />
            ))}
          </div>
        </Field>

        <Field label="Amount">
          <AmountInput value={amount} onChange={setAmount} />
          <div className="mt-2.5 flex gap-1.5">
            {QUICK.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setAmount(String(q))}
                className="press tnum flex-1 rounded-sm border border-line-strong bg-surface py-2 text-xs font-semibold text-ink-600 hover:border-ink-300"
              >
                {money(q, { compact: true })}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Note" hint="Only you can see this.">
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={60}
            placeholder="Monthly top-up"
          />
        </Field>
      </MoneyFlow>
    </div>
  );
}
