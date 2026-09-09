"use client";

import * as React from "react";
import { Camera, Check, Loader2, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Surface } from "@/components/ui/surface";
import { AmountInput, Field } from "@/components/ui/input";
import { Toggle } from "@/components/ui/list";
import { MoneyFlow } from "@/components/ui/money-flow";
import { PickRow } from "@/components/ui/pick-row";
import { useBank } from "@/lib/store";
import { useDepositAccounts } from "@/lib/hooks";
import { cn, money } from "@/lib/utils";

const MAX_CHECK = 25_000;

type CaptureState = "empty" | "capturing" | "done";

export default function CheckDepositPage() {
  const accounts = useDepositAccounts();
  const depositCheck = useBank((s) => s.depositCheck);

  const [toId, setToId] = React.useState(accounts[0]?.id ?? "");
  const [front, setFront] = React.useState<CaptureState>("empty");
  const [back, setBack] = React.useState<CaptureState>("empty");
  const [endorsed, setEndorsed] = React.useState(false);
  const [amount, setAmount] = React.useState("");

  const to = accounts.find((a) => a.id === toId);
  const value = Number(amount) || 0;
  const captured = front === "done" && back === "done";
  const ready = captured && endorsed;

  const reviewRows = [
    { label: "Deposit to", value: `${to?.name} •••• ${to?.mask}` },
    { label: "Check images", value: "Front and back captured" },
    { label: "Available", value: "Next business day" },
  ];

  return (
    <div className="mx-auto max-w-xl space-y-5 pb-4">
      <PageHeader title="Deposit a check" back="/deposit" />

      <MoneyFlow
        amount={value}
        submitLabel="Submit deposit"
        reviewTitle="Deposit amount"
        reviewRows={reviewRows}
        disabled={!ready}
        validate={() => {
          if (!captured) return "Capture both sides of the check first.";
          if (!endorsed) return "Confirm you've signed the back of the check.";
          if (value > MAX_CHECK)
            return `Single check deposits are limited to ${money(MAX_CHECK)}. Visit a branch for larger checks.`;
          return null;
        }}
        onConfirm={() => depositCheck(toId, value)}
        success={{
          title: "Deposit submitted",
          body: "We're reviewing your check. Funds are usually available the next business day.",
          rows: reviewRows,
          primary: { label: "See activity", href: "/activity" },
          secondary: { label: "Done", href: "/home" },
        }}
      >
        <Field label="Deposit into">
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

        <Field label="Photograph the check">
          <div className="grid gap-3 sm:grid-cols-2">
            <Capture label="Front" state={front} onChange={setFront} />
            <Capture label="Back" state={back} onChange={setBack} />
          </div>
          <p className="mt-2 text-xs leading-relaxed text-ink-400">
            Place the check on a dark, flat surface in good light and fit all four corners inside
            the frame.
          </p>
        </Field>

        <div
          className={cn(
            "flex items-center gap-3 rounded-xl border px-4 py-3.5 transition-colors",
            endorsed ? "border-pos-500/40 bg-pos-50" : "border-line bg-surface"
          )}
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink-900">
              I&apos;ve signed the back of the check
            </p>
            <p className="mt-0.5 text-xs leading-snug text-ink-400">
              Write &ldquo;For mobile deposit at Auremont only&rdquo; under your signature.
            </p>
          </div>
          <Toggle checked={endorsed} onChange={setEndorsed} label="Check is endorsed" />
        </div>

        <Field label="Amount" hint={`Up to ${money(MAX_CHECK)} per check.`}>
          <AmountInput value={amount} onChange={setAmount} />
        </Field>
      </MoneyFlow>
    </div>
  );
}

function Capture({
  label,
  state,
  onChange,
}: {
  label: string;
  state: CaptureState;
  onChange: (s: CaptureState) => void;
}) {
  const capture = () => {
    if (state === "capturing") return;
    if (state === "done") {
      onChange("empty");
      return;
    }
    onChange("capturing");
    window.setTimeout(() => onChange("done"), 1100);
  };

  return (
    <button
      type="button"
      onClick={capture}
      aria-label={state === "done" ? `Retake ${label} of check` : `Capture ${label} of check`}
      className={cn(
        "press relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors",
        state === "done"
          ? "border-pos-500/40 bg-pos-50"
          : "border-line-strong bg-surface-sunken hover:border-ink-300"
      )}
      style={{ aspectRatio: "1.9 / 1" }}
    >
      {/* Corner brackets frame the check the way a scanner would. */}
      {state !== "done" && (
        <>
          <Corner className="left-2 top-2 border-l-2 border-t-2" />
          <Corner className="right-2 top-2 border-r-2 border-t-2" />
          <Corner className="bottom-2 left-2 border-b-2 border-l-2" />
          <Corner className="bottom-2 right-2 border-b-2 border-r-2" />
        </>
      )}

      {state === "capturing" ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin text-ink-400" />
          <span className="text-xs font-semibold text-ink-500">Reading…</span>
        </>
      ) : state === "done" ? (
        <>
          <span className="flex h-9 w-9 items-center justify-center rounded-3xl bg-pos-500 text-white">
            <Check className="h-5 w-5" />
          </span>
          <span className="text-xs font-semibold text-pos-600">{label} captured</span>
          <span className="flex items-center gap-1 text-2xs font-medium text-ink-400">
            <RotateCcw className="h-3 w-3" />
            Retake
          </span>
        </>
      ) : (
        <>
          <Camera className="h-5 w-5 text-ink-400" />
          <span className="text-xs font-semibold text-ink-600">{label} of check</span>
          <span className="text-2xs text-ink-400">Tap to capture</span>
        </>
      )}
    </button>
  );
}

function Corner({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={cn("pointer-events-none absolute h-4 w-4 border-ink-300", className)}
    />
  );
}
