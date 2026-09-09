"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, CreditCard, Landmark, type LucideIcon } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { AnimatedCurrency } from "@/components/ui/animated-number";
import { useEcokripto } from "@/lib/store";
import { cn, formatCurrency } from "@/lib/utils";

const QUICK_AMOUNTS = [50, 100, 250, 500, 1000] as const;

type Method = {
  id: string;
  label: string;
  icon: LucideIcon;
};

const METHODS: Method[] = [
  { id: "checking", label: "Checking ••4821", icon: Landmark },
  { id: "debit", label: "Debit card ••7733", icon: CreditCard },
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function DepositPage() {
  const router = useRouter();
  const balance = useEcokripto((s) => s.balance);
  const addTransaction = useEcokripto((s) => s.addTransaction);

  const [amount, setAmount] = React.useState("");
  const [methodId, setMethodId] = React.useState<string>(METHODS[0].id);
  const [error, setError] = React.useState<string | null>(null);
  const [deposited, setDeposited] = React.useState<number | null>(null);

  const handleQuick = (value: number) => {
    setAmount(String(value));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = Number(amount);
    if (!amount || Number.isNaN(parsed) || parsed <= 0) {
      setError("Enter an amount greater than $0.");
      return;
    }
    if (parsed > 25000) {
      setError("Deposits are limited to $25,000 per transfer.");
      return;
    }
    const method = METHODS.find((m) => m.id === methodId) ?? METHODS[0];
    addTransaction("deposit", `Deposit · ${method.label}`, parsed);
    setError(null);
    setDeposited(parsed);
  };

  const reset = () => {
    setDeposited(null);
    setAmount("");
    setError(null);
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <PageHeader
        title="Deposit"
        subtitle="Add money to your Ecokripto balance — instant"
      />

      <GlassCard className="p-6" delay={0.1}>
        <AnimatePresence mode="wait" initial={false}>
          {deposited === null ? (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="space-y-6"
            >
              <div className="space-y-3">
                <label
                  htmlFor="deposit-amount"
                  className="text-xs font-semibold uppercase tracking-wide text-ink-400"
                >
                  Amount
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl font-extrabold text-ink-400">
                    $
                  </span>
                  <Input
                    id="deposit-amount"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setAmount(e.target.value);
                      setError(null);
                    }}
                    className="h-16 pl-9 text-2xl font-extrabold tracking-tight text-ink-900"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_AMOUNTS.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleQuick(value)}
                      className={cn(
                        "rounded-full border px-4 py-1.5 text-sm font-semibold transition-all",
                        Number(amount) === value
                          ? "border-brand-400 bg-brand-50 text-brand-700"
                          : "border-brand-100 bg-white/60 text-ink-600 hover:border-brand-300 hover:text-ink-900"
                      )}
                    >
                      {formatCurrency(value).replace(/\.00$/, "")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                  From
                </span>
                <div className="grid gap-3 sm:grid-cols-2">
                  {METHODS.map((method) => {
                    const Icon = method.icon;
                    const selected = methodId === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setMethodId(method.id)}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border bg-white/60 p-4 text-left transition-all",
                          selected
                            ? "border-brand-400 ring-4 ring-brand-400/15"
                            : "border-brand-100 hover:border-brand-300"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                            selected
                              ? "bg-brand-500 text-white"
                              : "bg-brand-50 text-brand-600"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-ink-900">
                            {method.label}
                          </span>
                          <span className="block text-xs text-ink-400">
                            Linked account
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <p className="text-sm font-medium text-red-500">{error}</p>
              )}

              <Button type="submit" variant="primary" size="lg" className="w-full">
                Deposit
              </Button>

              <p className="text-center text-xs text-ink-400">
                Instant transfer · no fees.
              </p>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="flex flex-col items-center py-6 text-center"
            >
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500 text-white shadow-float"
              >
                <CheckCircle2 className="h-8 w-8" />
              </motion.span>
              <h2 className="mt-5 text-xl font-extrabold tracking-tight text-ink-900">
                Deposit complete
              </h2>
              <AnimatedCurrency
                value={deposited}
                className="mt-2 text-4xl font-extrabold tracking-tight text-brand-600"
              />
              <p className="mt-3 text-sm text-ink-600">
                New balance: {" "}
                <span className="font-semibold text-ink-900">
                  {formatCurrency(balance)}
                </span>
              </p>
              <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  onClick={reset}
                >
                  Make another
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => router.push("/dashboard")}
                >
                  Go to dashboard
                </Button>
              </div>
              <p className="mt-5 text-xs text-ink-400">
                Instant transfer · no fees.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </div>
  );
}
