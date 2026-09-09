"use client";

import * as React from "react";
import { ArrowDown, Building2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Surface } from "@/components/ui/surface";
import { AmountInput, Field, Input } from "@/components/ui/input";
import { MoneyFlow } from "@/components/ui/money-flow";
import { Segmented } from "@/components/ui/segmented";
import { useBank } from "@/lib/store";
import { PickRow } from "@/components/ui/pick-row";
import { money } from "@/lib/utils";

const QUICK = [100, 500, 1_000, 5_000];

export default function TransferPage() {
  const accounts = useBank((s) => s.accounts);
  const external = useBank((s) => s.externalAccounts.filter((x) => x.status === "linked"));
  const transfer = useBank((s) => s.transfer);
  const transferExternal = useBank((s) => s.transferExternal);

  const [destinationKind, setDestinationKind] = React.useState<"own" | "external">("own");
  const [fromId, setFromId] = React.useState(accounts[0]?.id ?? "");
  const [toId, setToId] = React.useState(accounts[1]?.id ?? "");
  const [extId, setExtId] = React.useState(external[0]?.id ?? "");
  const [amount, setAmount] = React.useState("");
  const [note, setNote] = React.useState("");

  const from = accounts.find((a) => a.id === fromId);
  const to = accounts.find((a) => a.id === toId);
  const ext = external.find((x) => x.id === extId);
  const value = Number(amount) || 0;

  // Source accounts you can pull from; a credit line isn't one of them.
  const sources = accounts.filter((a) => a.kind !== "credit");
  const destinations = accounts.filter((a) => a.id !== fromId);

  React.useEffect(() => {
    if (toId === fromId) {
      const next = accounts.find((a) => a.id !== fromId);
      if (next) setToId(next.id);
    }
  }, [fromId, toId, accounts]);

  const reviewRows = [
    { label: "From", value: `${from?.name} •••• ${from?.mask}` },
    {
      label: "To",
      value:
        destinationKind === "own"
          ? `${to?.name} •••• ${to?.mask}`
          : `${ext?.institution} •••• ${ext?.mask}`,
    },
    {
      label: "Arrives",
      value: destinationKind === "own" ? "Immediately" : "In 1–3 business days",
    },
    ...(note ? [{ label: "Note", value: note }] : []),
  ];

  return (
    <div className="mx-auto max-w-xl space-y-5 pb-4">
      <PageHeader title="Transfer money" back="/payments" />

      <MoneyFlow
        amount={value}
        available={from?.available}
        submitLabel="Transfer"
        reviewRows={reviewRows}
        validate={() => {
          if (destinationKind === "external" && !ext) return "Choose an account to transfer to.";
          if (destinationKind === "own" && !to) return "Choose an account to transfer to.";
          return null;
        }}
        onConfirm={() => {
          if (destinationKind === "own" && to) transfer(fromId, to.id, value, note || undefined);
          else if (ext) transferExternal(fromId, ext.id, value, note || undefined);
        }}
        success={{
          title: "Transfer complete",
          body:
            destinationKind === "own"
              ? "The money has already landed in the destination account."
              : "We've sent the money on its way. It should arrive within three business days.",
          rows: reviewRows,
          primary: { label: "Done", href: "/home" },
          secondary: { label: "See activity", href: "/activity" },
        }}
      >
        <Field label="From">
          <div className="space-y-2">
            {sources.map((a) => (
              <PickRow
                key={a.id}
                active={fromId === a.id}
                onClick={() => setFromId(a.id)}
                title={a.name}
                detail={`•••• ${a.mask}`}
                value={money(a.available)}
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
          <Segmented
            id="dest"
            className="mb-2.5"
            value={destinationKind}
            onChange={setDestinationKind}
            options={[
              { value: "own", label: "My accounts" },
              { value: "external", label: "Linked bank" },
            ]}
          />
          {destinationKind === "own" ? (
            <div className="space-y-2">
              {destinations.map((a) => (
                <PickRow
                  key={a.id}
                  active={toId === a.id}
                  onClick={() => setToId(a.id)}
                  title={a.name}
                  detail={`•••• ${a.mask}`}
                  value={a.kind === "credit" ? `${money(a.balance)} owed` : money(a.balance)}
                />
              ))}
            </div>
          ) : external.length === 0 ? (
            <Surface variant="sunken" className="px-4 py-5 text-center">
              <p className="text-sm text-ink-500">
                You don&apos;t have a linked bank yet. Add one to transfer money out.
              </p>
            </Surface>
          ) : (
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
          )}
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
            placeholder="Monthly savings top-up"
          />
        </Field>
      </MoneyFlow>
    </div>
  );
}
