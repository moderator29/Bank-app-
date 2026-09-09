"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarClock, Lock, Percent, Plus, Vault } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { useEcokripto, selectLockedTotal } from "@/lib/store";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { LockedPlan } from "@/lib/types";

const TERM_OPTIONS = [
  { months: 3, apy: 4.6 },
  { months: 6, apy: 5.1 },
  { months: 12, apy: 5.6 },
] as const;

const MONTH_MS = (365.25 / 12) * 24 * 60 * 60 * 1000;

function unlockDate(plan: LockedPlan): string {
  const d = new Date(plan.startedAt);
  d.setMonth(d.getMonth() + plan.termMonths);
  return d.toISOString();
}

function termProgress(plan: LockedPlan): number {
  const elapsedMonths = (Date.now() - new Date(plan.startedAt).getTime()) / MONTH_MS;
  return Math.min(100, Math.max(0, (elapsedMonths / plan.termMonths) * 100));
}

export default function LockedSavingsPage() {
  const balance = useEcokripto((s) => s.balance);
  const lockedPlans = useEcokripto((s) => s.lockedPlans);
  const addLockedPlan = useEcokripto((s) => s.addLockedPlan);
  const lockedTotal = useEcokripto(selectLockedTotal);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [termIdx, setTermIdx] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const avgApy = useMemo(() => {
    const total = lockedPlans.reduce((sum, p) => sum + p.amount, 0);
    if (total <= 0) return 0;
    return lockedPlans.reduce((sum, p) => sum + p.apy * p.amount, 0) / total;
  }, [lockedPlans]);

  const closeModal = () => {
    setOpen(false);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = name.trim();
    const value = Number(amount);
    if (!trimmed) {
      setError("Give your lock a name.");
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter an amount greater than $0.");
      return;
    }
    if (value > balance) {
      setError(`Amount exceeds your available balance of ${formatCurrency(balance)}.`);
      return;
    }
    const term = TERM_OPTIONS[termIdx];
    addLockedPlan(trimmed, Math.round(value * 100) / 100, term.apy, term.months);
    setName("");
    setAmount("");
    setTermIdx(1);
    closeModal();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Locked Savings"
        subtitle="Lock funds for a fixed term to earn a higher APY"
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> New Lock
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Total Locked" value={lockedTotal} icon={Vault} delay={0.05} />
        <StatCard
          label="Avg APY"
          value={avgApy}
          icon={Percent}
          format="percent"
          delay={0.1}
        />
      </div>

      {lockedPlans.length === 0 ? (
        <EmptyState
          icon={Lock}
          title="No locked plans yet"
          body="Lock a portion of your balance for a fixed term and watch it earn a boosted APY."
          action={<Button onClick={() => setOpen(true)}>Create your first lock</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {lockedPlans.map((plan, i) => {
            const pct = termProgress(plan);
            const delay = 0.1 + Math.min(i * 0.07, 0.4);
            return (
              <GlassCard key={plan.id} delay={delay} className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-brand-500 to-brand-700 text-white shadow-[0_6px_16px_-4px_rgb(22_136_96/0.45)]">
                      <Lock className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink-900">{plan.name}</p>
                      <p className="text-xs text-ink-400">{plan.termMonths}-month term</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
                    {plan.apy}% APY
                  </span>
                </div>

                <p className="mt-5 text-2xl font-extrabold tracking-tight text-ink-900">
                  {formatCurrency(plan.amount)}
                </p>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-brand-100/70">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{
                      duration: 1,
                      delay: delay + 0.2,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400"
                  />
                </div>
                <div className="mt-2.5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-brand-600">
                    {Math.round(pct)}% of term
                  </span>
                  <span className="flex items-center gap-1 font-medium text-ink-400">
                    <CalendarClock className="h-3.5 w-3.5" />
                    Unlocks {formatDate(unlockDate(plan))}
                  </span>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      <Modal open={open} onClose={closeModal} title="New Locked Plan">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Plan name">
            <Input
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              placeholder="e.g. Rainy Day Reserve"
              autoFocus
            />
          </Field>

          <Field label="Amount">
            <Input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </Field>
          <p className="-mt-2 text-xs text-ink-400">
            Available balance: {formatCurrency(balance)}
          </p>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              Term
            </span>
            <div className="grid grid-cols-3 gap-2">
              {TERM_OPTIONS.map((t, i) => (
                <button
                  key={t.months}
                  type="button"
                  onClick={() => setTermIdx(i)}
                  className={cn(
                    "rounded-2xl border px-3 py-3 text-center transition-all cursor-pointer",
                    i === termIdx
                      ? "border-brand-500 bg-brand-50 shadow-[0_4px_14px_-4px_rgb(22_136_96/0.35)]"
                      : "border-brand-100 bg-white/60 hover:border-brand-300"
                  )}
                >
                  <span
                    className={cn(
                      "block text-sm font-extrabold",
                      i === termIdx ? "text-brand-700" : "text-ink-900"
                    )}
                  >
                    {t.months} mo
                  </span>
                  <span
                    className={cn(
                      "block text-xs font-semibold",
                      i === termIdx ? "text-brand-600" : "text-ink-400"
                    )}
                  >
                    {t.apy}% APY
                  </span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="rounded-2xl bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              <Lock className="h-4 w-4" /> Lock Funds
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
