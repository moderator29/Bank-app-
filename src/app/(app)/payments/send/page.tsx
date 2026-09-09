"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Search, Star, UserRound } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Surface } from "@/components/ui/surface";
import { AmountInput, Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Segmented } from "@/components/ui/segmented";
import { MoneyFlow } from "@/components/ui/money-flow";
import { PickRow } from "@/components/ui/pick-row";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { useBank } from "@/lib/store";
import { useDepositAccounts } from "@/lib/hooks";
import { money, relativeDay } from "@/lib/utils";

const QUICK = [25, 50, 100, 250];

export default function SendMoneyPage() {
  const params = useSearchParams();
  const preselected = params.get("payee");

  const payees = useBank((s) => s.payees);
  const accounts = useDepositAccounts();
  const sendMoney = useBank((s) => s.sendMoney);
  const addPayee = useBank((s) => s.addPayee);

  const [kind, setKind] = React.useState<"person" | "biller">("person");
  const [payeeId, setPayeeId] = React.useState(preselected ?? "");
  const [fromId, setFromId] = React.useState(accounts[0]?.id ?? "");
  const [amount, setAmount] = React.useState("");
  const [note, setNote] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [addOpen, setAddOpen] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newDetail, setNewDetail] = React.useState("");
  const [addError, setAddError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!preselected) return;
    const found = payees.find((p) => p.id === preselected);
    if (found) {
      setPayeeId(found.id);
      setKind(found.kind);
    }
  }, [preselected, payees]);

  const list = payees
    .filter((p) => p.kind === kind)
    .filter((p) =>
      query.trim()
        ? `${p.name} ${p.detail}`.toLowerCase().includes(query.trim().toLowerCase())
        : true
    );

  const payee = payees.find((p) => p.id === payeeId);
  const from = accounts.find((a) => a.id === fromId);
  const value = Number(amount) || 0;

  const reviewRows = [
    { label: "To", value: payee ? `${payee.name}` : "—" },
    { label: "Details", value: payee?.detail ?? "—" },
    { label: "From", value: `${from?.name} •••• ${from?.mask}` },
    { label: "Arrives", value: kind === "person" ? "Usually within minutes" : "In 1–2 business days" },
    ...(note ? [{ label: "Note", value: note }] : []),
  ];

  const saveNewPayee = () => {
    if (newName.trim().length < 2) return setAddError("Enter the recipient's full name.");
    if (newDetail.trim().length < 4)
      return setAddError("Enter a phone number, email or account number.");
    const created = addPayee({ name: newName.trim(), kind, detail: newDetail.trim() });
    setPayeeId(created.id);
    setNewName("");
    setNewDetail("");
    setAddError(null);
    setAddOpen(false);
  };

  return (
    <div className="mx-auto max-w-xl space-y-5 pb-4">
      <PageHeader title="Send money" back="/payments" />

      <MoneyFlow
        amount={value}
        available={from?.available}
        submitLabel="Send"
        reviewRows={reviewRows}
        validate={() => (payee ? null : "Choose who you're sending to.")}
        onConfirm={() => {
          if (payee) sendMoney(payee.id, fromId, value, note || undefined);
        }}
        success={{
          title: "Money sent",
          body: payee
            ? `${payee.name} will see the payment shortly.`
            : "The payment is on its way.",
          rows: reviewRows,
          primary: { label: "Done", href: "/home" },
          secondary: { label: "See activity", href: "/activity" },
        }}
      >
        <Field label="Send to">
          <Segmented
            id="send-kind"
            className="mb-2.5"
            value={kind}
            onChange={(v) => {
              setKind(v);
              setPayeeId("");
            }}
            options={[
              { value: "person", label: "People" },
              { value: "biller", label: "Companies" },
            ]}
          />

          <div className="relative mb-2.5">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search recipients"
              aria-label="Search recipients"
              className="pl-10"
            />
          </div>

          {list.length === 0 ? (
            <EmptyState
              compact
              icon={UserRound}
              title="No recipients found"
              body="Add someone new and they'll be saved for next time."
              action={<Button onClick={() => setAddOpen(true)}>Add a recipient</Button>}
            />
          ) : (
            <div className="space-y-2">
              {list.map((p) => (
                <PickRow
                  key={p.id}
                  active={payeeId === p.id}
                  onClick={() => setPayeeId(p.id)}
                  title={p.name}
                  detail={
                    p.lastSentAt ? `${p.detail} · last sent ${relativeDay(p.lastSentAt)}` : p.detail
                  }
                  icon={
                    payeeId === p.id ? undefined : (
                      <span className="text-xs font-semibold">{p.name.slice(0, 1)}</span>
                    )
                  }
                />
              ))}
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="press flex w-full items-center gap-3 edge glass-sunken relative rounded-xl border-dashed px-3.5 py-3 text-left hover:border-ink-300"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-50 text-ink-500">
                  <Plus className="h-[18px] w-[18px]" />
                </span>
                <span className="text-sm font-semibold text-ink-700">
                  Add a new {kind === "person" ? "person" : "company"}
                </span>
              </button>
            </div>
          )}
        </Field>

        <Field label="From">
          <div className="space-y-2">
            {accounts.map((a) => (
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

        <Field label="Amount">
          <AmountInput value={amount} onChange={setAmount} />
          <div className="mt-2.5 flex gap-1.5">
            {QUICK.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setAmount(String(q))}
                className="press tnum flex-1 rounded-sm border border-line-strong bg-surface/55 py-2 backdrop-blur-sm text-xs font-semibold text-ink-600 hover:border-ink-300"
              >
                {money(q)}
              </button>
            ))}
          </div>
        </Field>

        <Field label="What's it for?" hint="Shown to the recipient.">
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={60}
            placeholder="Dinner on Friday"
          />
        </Field>
      </MoneyFlow>

      {payee && (
        <Surface variant="sunken" className="flex items-center gap-3 px-4 py-3.5">
          <Avatar name={payee.name} size="sm" tone="muted" />
          <p className="min-w-0 flex-1 text-xs leading-snug text-ink-400">
            Sending to <span className="font-semibold text-ink-700">{payee.name}</span> at{" "}
            {payee.detail}. Double-check these details — payments to the wrong recipient can be
            hard to recover.
          </p>
        </Surface>
      )}

      <Sheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title={`Add a ${kind === "person" ? "person" : "company"}`}
        description="We'll save them so you can pay them again in one tap."
      >
        <div className="space-y-4">
          <Field label={kind === "person" ? "Full name" : "Company name"}>
            <Input
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setAddError(null);
              }}
              placeholder={kind === "person" ? "Alex Morgan" : "Ridgeline Residences"}
            />
          </Field>
          <Field
            label={kind === "person" ? "Phone, email or account" : "Account reference"}
            error={addError}
          >
            <Input
              value={newDetail}
              onChange={(e) => {
                setNewDetail(e.target.value);
                setAddError(null);
              }}
              placeholder={kind === "person" ? "(704) 555-0100" : "Acct 44192"}
            />
          </Field>
          <div className="flex items-start gap-2.5 edge glass-sunken relative rounded-md px-3.5 py-3">
            <Star className="mt-0.5 h-4 w-4 shrink-0 text-brass-500" />
            <p className="text-xs leading-relaxed text-ink-400">
              Only add recipients you know. Auremont can&apos;t recover money sent to the wrong
              person.
            </p>
          </div>
          <Button block size="lg" onClick={saveNewPayee}>
            Save recipient
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
