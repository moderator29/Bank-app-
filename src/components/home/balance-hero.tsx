"use client";

import Link from "next/link";
import { ArrowUpRight, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { Surface } from "@/components/ui/surface";
import { AnimatedMoney } from "@/components/ui/animated-number";
import { useBank } from "@/lib/store";
import { nextPayday, primaryAccount, windowFlow } from "@/lib/selectors";
import { formatDate, money } from "@/lib/utils";

/**
 * The primary account, presented once and clearly: balance, availability and
 * what's arriving next. Everything else on Home is secondary to this.
 */
export function BalanceHero() {
  const account = useBank(primaryAccount);
  const hidden = useBank((s) => s.balanceHidden);
  const toggle = useBank((s) => s.toggleBalanceHidden);
  const payday = useBank(nextPayday);
  const flow = useBank((s) => windowFlow(s, 30, account.id));

  return (
    <Surface variant="navy" radius="3xl" index={0} className="overflow-hidden">
      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-brass-200">{account.name}</p>
            <p className="mask-dots mt-0.5 text-xs text-white/45">•••• {account.mask}</p>
          </div>
          <button
            onClick={toggle}
            aria-label={hidden ? "Show balance" : "Hide balance"}
            className="press -mr-1 -mt-1 flex h-9 w-9 items-center justify-center rounded-md text-white/60 hover:bg-white/10 hover:text-white"
          >
            {hidden ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
          </button>
        </div>

        <div className="mt-5">
          {hidden ? (
            <p className="mask-dots text-4xl font-semibold tracking-tight text-white/70 sm:text-5xl">
              ••••••••
            </p>
          ) : (
            <AnimatedMoney
              value={account.balance}
              className="tnum block text-4xl font-semibold tracking-tight text-white sm:text-5xl"
            />
          )}
          <p className="mt-2 text-sm text-white/50">
            Available balance
            {!hidden && account.available !== account.balance && (
              <span className="tnum"> · {money(account.available)} available now</span>
            )}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {payday && (
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.35 }}
              className="tnum inline-flex items-center gap-1.5 rounded-xs border border-white/10 bg-white/8 px-2.5 py-1.5 text-2xs font-semibold text-brass-100"
            >
              <span className="h-1.5 w-1.5 rounded-3xl bg-pos-500" />
              {money(30_000)} expected {formatDate(payday, "short")}
            </motion.span>
          )}
          {!hidden && (
            <span className="tnum inline-flex items-center gap-1.5 rounded-xs border border-white/10 bg-white/8 px-2.5 py-1.5 text-2xs font-semibold text-white/70">
              {money(flow.net, { signed: true, compact: true })} over 30 days
            </span>
          )}
        </div>
      </div>

      <Link
        href={`/accounts/${account.id}`}
        className="flex items-center justify-between border-t border-white/8 px-6 py-3.5 text-sm font-semibold text-white/80 transition-colors hover:bg-white/5 hover:text-white sm:px-7"
      >
        Account details
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    </Surface>
  );
}
