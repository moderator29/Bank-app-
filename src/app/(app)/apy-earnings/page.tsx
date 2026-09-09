"use client";

import { motion } from "framer-motion";
import { Percent, TrendingUp, CalendarClock } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedCurrency } from "@/components/ui/animated-number";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { TransactionRow } from "@/components/shared/transaction-row";
import { useEcokripto, selectApyEarned } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { SEED_APY } from "@/lib/seed";
import type { Transaction } from "@/lib/types";

const MONTHLY_EARNINGS = [
  { month: "Feb", value: 61 },
  { month: "Mar", value: 68 },
  { month: "Apr", value: 72 },
  { month: "May", value: 79 },
  { month: "Jun", value: 84 },
  { month: "Jul", value: 88 },
];

export default function ApyEarningsPage() {
  const apyEarned = useEcokripto(selectApyEarned);
  const transactions = useEcokripto((s) => s.transactions);
  const payouts = transactions.filter((tx: Transaction) => tx.type === "apy");

  return (
    <div className="space-y-6">
      <PageHeader
        title="APY Earnings"
        subtitle="Watch your money quietly grow"
      />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="glass-deep rounded-4xl text-white shadow-float-lg p-6 sm:p-8"
      >
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
            Current APY
          </p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-5xl sm:text-6xl font-extrabold tracking-tight">
              {SEED_APY}%
            </span>
            <TrendingUp className="mb-2 h-6 w-6 text-emerald-300" />
          </div>
          <p className="mt-2 text-sm text-white/70">
            Annual Percentage Yield · compounds daily
          </p>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-10 border-t border-white/10 pt-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                Earned YTD
              </p>
              <AnimatedCurrency
                value={apyEarned}
                className="text-2xl font-extrabold tracking-tight"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <CalendarClock className="h-4 w-4 text-emerald-300" />
              <span>
                Next payout <span className="font-semibold text-white">$150,000</span> · in 3 days
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Monthly earnings chart */}
      <GlassCard className="p-6" delay={0.1}>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
          Monthly earnings
        </p>
        <h2 className="mt-1 text-lg font-extrabold tracking-tight text-ink-900">
          Last 6 months
        </h2>
        <div className="mt-4 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MONTHLY_EARNINGS} barSize={28}>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9aa6a0" }}
              />
              <Tooltip
                cursor={{ fill: "rgba(36, 168, 120, 0.08)" }}
                formatter={(value) => [formatCurrency(Number(value)), "Earned"]}
                contentStyle={{
                  borderRadius: 16,
                  border: "1px solid rgba(36, 168, 120, 0.15)",
                  boxShadow: "0 8px 24px rgba(16, 60, 43, 0.12)",
                  fontSize: 13,
                }}
              />
              <Bar dataKey="value" fill="#24a878" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Payout history */}
      <GlassCard className="p-6" delay={0.2}>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
          Payout history
        </p>
        {payouts.length === 0 ? (
          <div className="mt-2">
            <EmptyState
              icon={Percent}
              title="No payouts yet"
              body="Your daily interest accrues and pays out automatically. Your first payout will show up here."
            />
          </div>
        ) : (
          <div className="mt-2 divide-y divide-black/[0.04]">
            {payouts.map((tx: Transaction, i: number) => (
              <TransactionRow key={tx.id} tx={tx} index={Math.min(i, 8)} />
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
