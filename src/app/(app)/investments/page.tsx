"use client";

import { motion } from "framer-motion";
import { Rocket, Scale, Shield, Sparkles, TrendingUp, type LucideIcon } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedCurrency } from "@/components/ui/animated-number";
import { PageHeader } from "@/components/shared/page-header";
import { formatCurrency } from "@/lib/utils";

const PORTFOLIO_VALUE = 3_150_000;

interface Allocation {
  name: string;
  percent: number;
  color: string;
}

const ALLOCATION: Allocation[] = [
  { name: "Savings", percent: 40, color: "#24a878" },
  { name: "Index funds", percent: 22, color: "#4cc294" },
  { name: "Stocks", percent: 16, color: "#168860" },
  { name: "Bonds", percent: 10, color: "#f0c96a" },
  { name: "Real estate", percent: 8, color: "#86dab7" },
  { name: "Cash", percent: 4, color: "#b9ead4" },
];

interface Strategy {
  name: string;
  range: string;
  icon: LucideIcon;
  body: string;
}

const STRATEGIES: Strategy[] = [
  {
    name: "Conservative",
    range: "3–5%",
    icon: Shield,
    body: "Capital preservation first — mostly bonds and high-yield savings.",
  },
  {
    name: "Balanced",
    range: "5–8%",
    icon: Scale,
    body: "A steady mix of index funds and fixed income for smoother growth.",
  },
  {
    name: "Growth",
    range: "8–12%",
    icon: Rocket,
    body: "Equity-heavy allocation aimed at long-term compounding.",
  },
];

export default function InvestmentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Investments"
        subtitle="Your diversified portfolio at a glance"
      />

      {/* Portfolio value hero */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="glass-deep rounded-4xl p-6 text-white shadow-float-lg sm:p-8"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <p className="text-sm font-medium text-brand-200">Portfolio value</p>
          </div>
          <AnimatedCurrency
            value={PORTFOLIO_VALUE}
            className="mt-2 block text-4xl font-extrabold tracking-tight sm:text-5xl"
          />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full bg-brand-400/25 px-3 py-1.5 text-xs font-bold text-brand-100">
              <TrendingUp className="h-3.5 w-3.5" /> +8.2% all time
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-brand-200">
              <Sparkles className="h-3.5 w-3.5" />
              Across all holdings
            </span>
          </div>
        </div>
      </motion.section>

      {/* Allocation donut */}
      <GlassCard delay={0.1} hover={false} className="p-6">
        <div className="mb-4">
          <h3 className="text-base font-extrabold tracking-tight text-ink-900">
            Allocation
          </h3>
          <p className="text-xs text-ink-400">How your portfolio is split</p>
        </div>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-10">
          <div className="h-56 w-full max-w-xs">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    border: "1px solid rgba(36,168,120,0.15)",
                    boxShadow: "0 8px 30px -6px rgb(6 40 30 / 0.12)",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                  formatter={(v: number | string, name: string) => [
                    formatCurrency((Number(v) / 100) * PORTFOLIO_VALUE),
                    name,
                  ]}
                />
                <Pie
                  data={ALLOCATION}
                  dataKey="percent"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                  strokeWidth={0}
                  animationDuration={1200}
                >
                  {ALLOCATION.map((a) => (
                    <Cell key={a.name} fill={a.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="w-full max-w-xs space-y-3 sm:w-auto">
            {ALLOCATION.map((a, i) => (
              <motion.li
                key={a.name}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.4,
                  delay: Math.min(0.2 + i * 0.07, 0.6),
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex items-center gap-3"
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: a.color }}
                />
                <span className="min-w-24 text-sm font-bold text-ink-900">
                  {a.name}
                </span>
                <span className="text-xs font-semibold text-ink-400">
                  {a.percent}%
                </span>
                <span className="ml-auto text-sm font-semibold text-ink-600">
                  {formatCurrency((a.percent / 100) * PORTFOLIO_VALUE)}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </GlassCard>

      {/* Strategies */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-extrabold tracking-tight text-ink-900">
            Strategies
          </h2>
          <p className="text-xs text-ink-400">
            Expected ranges are illustrative — nothing here is real advice
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STRATEGIES.map((s, i) => (
            <GlassCard
              key={s.name}
              delay={Math.min(0.15 + i * 0.07, 0.5)}
              className="flex flex-col p-6"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-b from-brand-500 to-brand-700 text-white">
                  <s.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-extrabold tracking-tight text-ink-900">
                    {s.name}
                  </p>
                  <p className="text-xs font-semibold text-brand-600">
                    {s.range} expected return
                  </p>
                </div>
              </div>
              <p className="mt-4 flex-1 text-sm text-ink-600">{s.body}</p>
            </GlassCard>
          ))}
        </div>
      </section>
    </div>
  );
}
