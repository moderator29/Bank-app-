"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, Gift, Trophy, Zap, BadgeCheck, type LucideIcon } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { useEcokripto } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/lib/types";

const WEEK_DAYS: { label: string; filled: boolean }[] = [
  { label: "M", filled: true },
  { label: "T", filled: true },
  { label: "W", filled: true },
  { label: "T", filled: true },
  { label: "F", filled: true },
  { label: "S", filled: false },
  { label: "S", filled: false },
];

const LOCKED_REWARDS: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Zap,
    title: "APY Booster",
    description: "Add +0.25% APY to your savings for 30 days.",
  },
  {
    icon: BadgeCheck,
    title: "Premium badge",
    description: "Show off your consistency with a profile badge.",
  },
];

export default function RewardsPage() {
  const transactions = useEcokripto((s) => s.transactions);
  const addTransaction = useEcokripto((s) => s.addTransaction);
  const [claimed, setClaimed] = useState(false);

  const rewardsEarned = transactions
    .filter((tx: Transaction) => tx.type === "reward")
    .reduce((sum: number, tx: Transaction) => sum + tx.amount, 0);

  const handleClaim = () => {
    if (claimed) return;
    addTransaction("reward", "Savings streak reward", 25_000);
    setClaimed(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rewards"
        subtitle="Earn perks for consistent saving"
      />

      {/* Streak hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="glass-deep rounded-4xl text-white shadow-float-lg p-6 sm:p-8"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-3xl">
              <Flame className="h-7 w-7 text-amber-300" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                Current streak
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                45-day savings streak
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 sm:gap-4">
            {WEEK_DAYS.map((day, i: number) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span
                  className={cn(
                    "h-3 w-3 rounded-full",
                    day.filled
                      ? "bg-brand-300 shadow-[0_0_10px_rgb(110_224_179/0.6)]"
                      : "border border-white/40"
                  )}
                />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-white/60">
                  {day.label}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-5 text-sm text-white/70">
            Keep saving weekly to grow your streak.
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Reward points"
          value={1250}
          icon={Gift}
          format="number"
          delay={0.1}
        />
        <StatCard
          label="Rewards earned"
          value={rewardsEarned}
          icon={Trophy}
          format="currency"
          delay={0.15}
        />
      </div>

      {/* Available rewards */}
      <div>
        <h2 className="text-lg font-extrabold tracking-tight text-ink-900">
          Available rewards
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <GlassCard className="flex flex-col p-6" delay={0.2} hover>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-b from-brand-500 to-brand-700 text-white shadow-[0_6px_16px_-4px_rgb(22_136_96/0.45)]">
              <Flame className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-extrabold tracking-tight text-ink-900">
              Streak bonus — $25,000
            </h3>
            <p className="mt-1 flex-1 text-sm text-ink-600">
              A thank-you for 45 straight days of saving. Claim it straight to
              your balance.
            </p>
            {claimed ? (
              <Button variant="secondary" size="sm" className="mt-5" disabled>
                Claimed ✓
              </Button>
            ) : (
              <Button size="sm" className="mt-5" onClick={handleClaim}>
                Claim
              </Button>
            )}
          </GlassCard>

          {LOCKED_REWARDS.map((reward, i: number) => (
            <GlassCard
              key={reward.title}
              className="flex flex-col p-6"
              delay={Math.min(0.25 + i * 0.05, 0.4)}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <reward.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-extrabold tracking-tight text-ink-900">
                {reward.title}
              </h3>
              <p className="mt-1 flex-1 text-sm text-ink-600">
                {reward.description}
              </p>
              <Button variant="outline" size="sm" className="mt-5" disabled>
                Unlocks at 60 days
              </Button>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
