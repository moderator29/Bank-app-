"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check, Loader2 } from "lucide-react";
import { Surface } from "./surface";
import { Button } from "./button";
import { money } from "@/lib/utils";

export interface ReviewRow {
  label: string;
  value: React.ReactNode;
}

type Step = "form" | "review" | "processing" | "success" | "error";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The single engine behind transfer, send, bill pay and deposit:
 * enter → review → processing → success, with one consistent error path.
 */
export function MoneyFlow({
  amount,
  available,
  submitLabel,
  reviewTitle = "Review",
  reviewRows,
  onConfirm,
  success,
  validate,
  children,
  disabled,
}: {
  amount: number;
  /** Balance the amount is checked against; omit to skip the funds check. */
  available?: number;
  submitLabel: string;
  reviewTitle?: string;
  reviewRows: ReviewRow[];
  onConfirm: () => void | Promise<void>;
  success: {
    title: string;
    body: string;
    rows?: ReviewRow[];
    primary: { label: string; href: string };
    secondary?: { label: string; href: string };
  };
  validate?: () => string | null;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const [step, setStep] = React.useState<Step>("form");
  const [error, setError] = React.useState<string | null>(null);
  const [failure, setFailure] = React.useState<string>("");

  const check = () => {
    if (!amount || Number.isNaN(amount) || amount <= 0) return "Enter an amount greater than $0.";
    if (available !== undefined && amount > available)
      return `That's more than the ${money(available)} available in this account.`;
    return validate?.() ?? null;
  };

  const toReview = () => {
    const problem = check();
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setStep("review");
  };

  const confirm = async () => {
    const problem = check();
    if (problem) {
      setFailure(problem);
      setStep("error");
      return;
    }
    setStep("processing");
    try {
      await new Promise((r) => window.setTimeout(r, 900));
      await onConfirm();
      setStep("success");
    } catch {
      setFailure("Something went wrong on our side and the payment wasn't sent. Nothing has left your account.");
      setStep("error");
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {step === "form" && (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.24, ease: EASE }}
          className="space-y-4"
        >
          {children}
          {error && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-md bg-neg-50 px-3.5 py-2.5 text-sm font-medium text-neg-600"
            >
              <AlertTriangle className="mt-px h-4 w-4 shrink-0" />
              {error}
            </p>
          )}
          <Button block size="lg" onClick={toReview} disabled={disabled}>
            Review {submitLabel.toLowerCase()}
          </Button>
        </motion.div>
      )}

      {step === "review" && (
        <motion.div
          key="review"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.24, ease: EASE }}
          className="space-y-4"
        >
          <Surface className="overflow-hidden">
            <div className="border-b border-line px-5 py-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.09em] text-ink-400">
                {reviewTitle}
              </p>
              <p className="tnum mt-2 text-4xl font-semibold tracking-tight text-ink-900">
                {money(amount)}
              </p>
            </div>
            <dl className="divide-y divide-line">
              {reviewRows.map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-4 px-5 py-3.5">
                  <dt className="text-sm text-ink-400">{row.label}</dt>
                  <dd className="min-w-0 text-right text-base font-medium text-ink-900">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Surface>
          <div className="flex gap-2.5">
            <Button variant="secondary" size="lg" className="flex-1" onClick={() => setStep("form")}>
              Edit
            </Button>
            <Button size="lg" className="flex-[1.6]" onClick={confirm}>
              {submitLabel}
            </Button>
          </div>
        </motion.div>
      )}

      {step === "processing" && (
        <motion.div
          key="processing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center gap-4 py-20"
        >
          <Loader2 className="h-7 w-7 animate-spin text-ink-300" />
          <p className="text-sm font-medium text-ink-500">Sending {money(amount)}…</p>
        </motion.div>
      )}

      {step === "success" && (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="space-y-4"
        >
          <Surface className="overflow-hidden">
            <div className="border-b border-line px-6 py-9 text-center">
              <motion.span
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 22, delay: 0.06 }}
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-pos-50 text-pos-500"
              >
                <Check className="h-7 w-7" strokeWidth={2.2} />
              </motion.span>
              <h2 className="text-xl font-semibold tracking-tight text-ink-900">{success.title}</h2>
              <p className="mx-auto mt-1.5 max-w-xs text-sm text-ink-400">{success.body}</p>
              <p className="tnum mt-4 text-3xl font-semibold tracking-tight text-ink-900">
                {money(amount)}
              </p>
            </div>
            {success.rows && (
              <dl className="divide-y divide-line">
                {success.rows.map((row) => (
                  <div key={row.label} className="flex items-baseline justify-between gap-4 px-5 py-3">
                    <dt className="text-sm text-ink-400">{row.label}</dt>
                    <dd className="text-right text-sm font-medium text-ink-900">{row.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </Surface>
          <div className="flex gap-2.5">
            {success.secondary && (
              <Link href={success.secondary.href} className="flex-1">
                <Button block variant="secondary" size="lg">
                  {success.secondary.label}
                </Button>
              </Link>
            )}
            <Link href={success.primary.href} className="flex-[1.6]">
              <Button block size="lg">
                {success.primary.label}
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

      {step === "error" && (
        <motion.div
          key="error"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: EASE }}
          className="space-y-4"
        >
          <Surface className="px-6 py-10 text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-neg-50 text-neg-500">
              <AlertTriangle className="h-6 w-6" />
            </span>
            <h2 className="text-xl font-semibold tracking-tight text-ink-900">
              We couldn&apos;t complete that
            </h2>
            <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-ink-400">{failure}</p>
          </Surface>
          <div className="flex gap-2.5">
            <Button variant="secondary" size="lg" className="flex-1" onClick={() => setStep("form")}>
              Start over
            </Button>
            <Button size="lg" className="flex-[1.6]" onClick={confirm}>
              Try again
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
