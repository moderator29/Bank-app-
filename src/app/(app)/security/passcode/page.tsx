"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, KeyRound, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Surface } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { PasscodeGate } from "@/components/ui/passcode-gate";
import { Keypad, PasscodeDots } from "@/components/auth/keypad";
import { useBank } from "@/lib/store";

type Step = "verify" | "new" | "confirm" | "done";

const COPY: Record<Exclude<Step, "verify" | "done">, { title: string; body: string }> = {
  new: {
    title: "Choose a new passcode",
    body: "Six digits. Avoid a birthday, a repeated digit or anything you use elsewhere.",
  },
  confirm: {
    title: "Enter it once more",
    body: "Re-enter the same six digits to confirm.",
  },
};

export default function ChangePasscodePage() {
  const router = useRouter();
  const checkPasscode = useBank((s) => s.checkPasscode);
  const changePasscode = useBank((s) => s.changePasscode);

  const [step, setStep] = React.useState<Step>("verify");
  const [gateOpen, setGateOpen] = React.useState(true);
  const [chosen, setChosen] = React.useState("");
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [shake, setShake] = React.useState(false);

  const fail = React.useCallback((message: string, back?: Step) => {
    setError(message);
    setShake(true);
    window.setTimeout(() => {
      setCode("");
      setShake(false);
      if (back) setStep(back);
    }, 620);
  }, []);

  const complete = React.useCallback(
    (value: string) => {
      if (step === "new") {
        if (checkPasscode(value)) {
          fail("That's your current passcode. Choose a different one.");
          return;
        }
        if (/^(\d)\1{5}$/.test(value)) {
          fail("Six identical digits is too easy to guess.");
          return;
        }
        setChosen(value);
        setCode("");
        setError(null);
        setStep("confirm");
        return;
      }
      if (value !== chosen) {
        fail("Those didn't match. Enter your new passcode again.");
        return;
      }
      changePasscode(value);
      setError(null);
      setStep("done");
    },
    [changePasscode, checkPasscode, chosen, fail, step]
  );

  const press = (digit: string) => {
    if (shake || code.length >= 6) return;
    const value = code + digit;
    setCode(value);
    setError(null);
    if (value.length === 6) window.setTimeout(() => complete(value), 140);
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader
        title="Change passcode"
        subtitle="The 6-digit code that unlocks the app"
        back="/security"
      />

      {step === "verify" && (
        <Surface index={0} className="p-6 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-ink-50 text-ink-500">
            <KeyRound className="h-5 w-5" />
          </span>
          <h2 className="text-lg font-semibold tracking-tight text-ink-900">
            Confirm your current passcode
          </h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-ink-400">
            For your security we check the code you have now before you set a new one.
          </p>
          <Button className="mt-5" onClick={() => setGateOpen(true)}>
            Confirm passcode
          </Button>
        </Surface>
      )}

      {(step === "new" || step === "confirm") && (
        <Surface index={0} className="p-6">
          <div className="mx-auto max-w-sm">
            <h2 className="text-center text-lg font-semibold tracking-tight text-ink-900">
              {COPY[step].title}
            </h2>
            <p className="mx-auto mt-1.5 max-w-xs text-center text-sm leading-relaxed text-ink-400">
              {COPY[step].body}
            </p>

            <div className="my-6">
              <PasscodeDots length={6} filled={code.length} error={shake} />
            </div>

            <p
              className="mb-4 min-h-4 text-center text-xs font-medium text-neg-500"
              aria-live="polite"
            >
              {error}
            </p>

            <Keypad
              onKey={press}
              onBackspace={() => setCode((c) => c.slice(0, -1))}
              disabled={shake}
            />
          </div>
        </Surface>
      )}

      {step === "done" && (
        <Surface index={0} className="p-6 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-pos-50 text-pos-500">
            <Check className="h-5 w-5" />
          </span>
          <h2 className="text-lg font-semibold tracking-tight text-ink-900">Passcode updated</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-ink-400">
            Use your new code the next time you open Auremont. We&apos;ve added a note to your
            notifications in case it wasn&apos;t you.
          </p>
          <Button
            variant="secondary"
            className="mt-5"
            onClick={() => router.push("/security")}
          >
            Back to Security centre
          </Button>
        </Surface>
      )}

      {(step === "new" || step === "confirm") && (
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-ink-400">
          <ShieldCheck className="h-4 w-4 text-brass-500" />
          Never share this code — we will never ask you for it.
        </div>
      )}

      <PasscodeGate
        open={gateOpen && step === "verify"}
        onClose={() => setGateOpen(false)}
        onVerified={() => {
          setCode("");
          setError(null);
          setStep("new");
        }}
        reason="Confirm your current passcode to set a new one."
      />
    </div>
  );
}
