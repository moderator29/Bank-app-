"use client";

import Link from "next/link";
import { ArrowLeftRight, CreditCard, Plus, Receipt, Send } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const ACTIONS = [
  { label: "Transfer", href: "/payments/transfer", icon: ArrowLeftRight },
  { label: "Send", href: "/payments/send", icon: Send },
  { label: "Pay bills", href: "/payments/bills", icon: Receipt },
  { label: "Deposit", href: "/deposit", icon: Plus },
  { label: "Cards", href: "/cards", icon: CreditCard },
];

/** Compact, thumb-reachable row — the five things people actually do. */
export function QuickActions({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-5 gap-2", className)}>
      {ACTIONS.map((action, i) => (
        <motion.div
          key={action.href}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 + i * 0.04, duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            href={action.href}
            className="press edge glass-panel relative flex h-full flex-col items-center gap-2 rounded-xl px-1 py-3 hover:brightness-[1.02]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900/6 text-ink-800">
              <action.icon className="h-[18px] w-[18px]" />
            </span>
            <span className="whitespace-nowrap text-center text-[11px] font-semibold leading-tight text-ink-700">
              {action.label}
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
