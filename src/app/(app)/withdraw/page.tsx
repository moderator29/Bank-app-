"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpFromLine,
  CheckCircle2,
  CreditCard,
  Landmark,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { AnimatedCurrency } from "@/components/ui/animated-number";
import { PageHeader } from "@/components/shared/page-header";
import { useEcokripto } from "@/lib/store";
import { formatCurrency, cn } from "@/lib/utils";

interface Destination {
  id: string;
  label: string;
  detail: string;
  icon: LucideIcon;
}

const DESTINATIONS: Destination[] = [
  { id: "checking", label: "Checking ••4821", detail: "Instant transfer", icon: Landmark },
  { id: "debit", label: "Debit card ••7733", detail: "Instant transfer", icon: CreditCard },
];

const QUICK_AMOUNTS = [50, 100, 250] as const;

export default function WithdrawPage() {
  const router = useRouter();
  const balance = useEcokripto((s) => s.balance);
  const addTransaction = useEcokripto((s) => s.addTransaction);

  const [amountInput, setAmountInput] = useState("");
  const [destinationId, setDestinationId] = useState<string>(DESTINATIONS[0].id);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ amount: number } | null>(null);

  const amount = Math.round(parseFloat(amountInput) * 100) / 100;
  const destination = DESTINATIONS.find((d) => d.id === destinationId) ?? DESTINATIONS[0];

  const handleAmountChange = (value: string) => {
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setAmountInput(value);
      setError(null);
    }
  };

  const setQuickAmount = (value: number) => {
    setAmountInput(value % 1 === 0 ? String(value) : value.toFixed(2));
    setError(null);
  };

  const handleSubmit = () => {
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter an amount greater than $0.");
      return;
    }
    if (amount > balance) {
      setError("Amount exceeds your available balance.");
      return;
    }
    addTransaction("withdraw", `Withdrawal · ${destination.label}`, -amount);
    setDone({ amount });
  };

  const reset = () => {
    setDone(null);
    setAmountInput("");
    setError(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Withdraw"
        subtitle="Move money out of your Ecokripto balance — instant"
      />

      <div className="mx-auto w-full max-w-xl">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <GlassCard hover={false} className="p-6 text-center sm:p-8">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50"
                >
                  <CheckCircle2 className="h-9 w-9 text-brand-600" />
                </motion.div>
                <h2 className="text-xl font-extrabold tracking-tight text-ink-900">
                  Withdrawal complete
                </h2>
                <AnimatedCurrency
                  value={done.amount}
                  className="mt-2 block text-4xl font-extrabold tracking-tight text-ink-900"
                />
                <p className="mt-2 text-sm text-ink-600">
                  Sent to {destination.label}
                </p>
                <div className="mt-5 rounded-2xl bg-brand-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                    Remaining balance
                  </p>
                  <p className="mt-0.5 text-lg font-extrabold tracking-tight text-brand-700">
                    {formatCurrency(balance)}
                  </p>
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button variant="secondary" className="flex-1" onClick={reset}>
                    Make another withdrawal
                  </Button>
                  <Button className="flex-1" onClick={() => router.push("/dashboard")}>
                    Back to dashboard
                  </Button>
                </div>
                <p className="mt-5 text-xs text-ink-400">
                  Instant transfer · no fees.
                </p>
              </GlassCard>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <GlassCard hover={false} className="p-6 sm:p-8">
                {/* Available balance */}
                <div className="flex items-center justify-between rounded-2xl bg-brand-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                    Available balance
                  </p>
                  <p className="text-base font-extrabold tracking-tight text-brand-700">
                    {formatCurrency(balance)}
                  </p>
                </div>

                {/* Amount */}
                <div className="mt-6">
                  <label
                    htmlFor="withdraw-amount"
                    className="text-xs font-semibold uppercase tracking-wide text-ink-400"
                  >
                    Amount
                  </label>
                  <div
                    className={cn(
                      "mt-2 flex items-center rounded-2xl border bg-white/60 px-4 transition-colors focus-within:ring-2 focus-within:ring-brand-400",
                      error ? "border-red-300" : "border-brand-100"
                    )}
                  >
                    <span className="text-2xl font-extrabold text-ink-400">$</span>
                    <input
                      id="withdraw-amount"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={amountInput}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleAmountChange(e.target.value)
                      }
                      className="h-14 w-full bg-transparent px-2 text-2xl font-extrabold tracking-tight text-ink-900 placeholder:text-ink-400/50 focus:outline-none"
                    />
                  </div>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm font-medium text-red-600"
                    >
                      {error}
                    </motion.p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {QUICK_AMOUNTS.map((value: number) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setQuickAmount(value)}
                        className="cursor-pointer rounded-full border border-brand-200 bg-white/60 px-4 py-1.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
                      >
                        ${value}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setQuickAmount(balance)}
                      className="cursor-pointer rounded-full border border-brand-200 bg-white/60 px-4 py-1.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
                    >
                      Max
                    </button>
                  </div>
                </div>

                {/* Destination */}
                <div className="mt-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                    To
                  </p>
                  <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {DESTINATIONS.map((dest: Destination) => {
                      const Icon = dest.icon;
                      const selected = dest.id === destinationId;
                      return (
                        <button
                          key={dest.id}
                          type="button"
                          onClick={() => setDestinationId(dest.id)}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-2xl border p-4 text-left transition-all",
                            selected
                              ? "border-brand-400 bg-brand-50 ring-2 ring-brand-400/40"
                              : "border-brand-100 bg-white/60 hover:bg-brand-50/60"
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                              selected ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-600"
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </span>
                          <span>
                            <span className="block text-sm font-bold text-ink-900">
                              {dest.label}
                            </span>
                            <span className="block text-xs text-ink-400">{dest.detail}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Button size="lg" className="mt-7 w-full" onClick={handleSubmit}>
                  <ArrowUpFromLine className="h-4 w-4" />
                  Withdraw{Number.isFinite(amount) && amount > 0 ? ` ${formatCurrency(amount)}` : ""}
                </Button>

                <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Withdrawals are always available, with no fees.
                </p>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
