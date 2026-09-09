"use client";

import { motion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  Lock,
  Percent,
  Target,
} from "lucide-react";
import type { Transaction } from "@/lib/types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

const typeConfig = {
  deposit: { icon: ArrowDownLeft, bg: "bg-brand-50", fg: "text-brand-600" },
  withdraw: { icon: ArrowUpRight, bg: "bg-red-50", fg: "text-red-500" },
  apy: { icon: Percent, bg: "bg-sky-50", fg: "text-sky-600" },
  reward: { icon: Gift, bg: "bg-amber-50", fg: "text-amber-600" },
  goal: { icon: Target, bg: "bg-violet-50", fg: "text-violet-600" },
  lock: { icon: Lock, bg: "bg-emerald-50", fg: "text-emerald-700" },
} as const;

export function TransactionRow({
  tx,
  index = 0,
}: {
  tx: Transaction;
  index?: number;
}) {
  const { icon: Icon, bg, fg } = typeConfig[tx.type];
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
      className="flex items-center gap-3.5 rounded-2xl px-3 py-3 transition-colors hover:bg-white/70"
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          bg,
          fg
        )}
      >
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink-900">{tx.label}</p>
        <p className="text-xs text-ink-400">
          {formatDate(tx.date)}
          {tx.status === "pending" && (
            <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
              Pending
            </span>
          )}
        </p>
      </div>
      <p
        className={cn(
          "text-sm font-bold tabular-nums",
          tx.amount >= 0 ? "text-brand-600" : "text-ink-900"
        )}
      >
        {tx.amount >= 0 ? "+" : ""}
        {formatCurrency(tx.amount)}
      </p>
    </motion.div>
  );
}
