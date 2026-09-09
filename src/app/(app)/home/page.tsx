"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { BalanceHero } from "@/components/home/balance-hero";
import { QuickActions } from "@/components/home/quick-actions";
import { Snapshot } from "@/components/home/snapshot";
import { Upcoming } from "@/components/home/upcoming";
import { WelcomeSheet } from "@/components/home/welcome-sheet";
import { AccountRow } from "@/components/accounts/account-card";
import { TransactionRow } from "@/components/activity/transaction-row";
import { Surface, SectionHeader } from "@/components/ui/surface";
import { useBank } from "@/lib/store";
import { primaryAccount } from "@/lib/selectors";
import { firstName, formatDate, greeting } from "@/lib/utils";

export default function HomePage() {
  const user = useBank((s) => s.user);
  const accounts = useBank((s) => s.accounts);
  const primary = useBank(primaryAccount);
  const hidden = useBank((s) => s.balanceHidden);
  const recent = useBank((s) => s.transactions.slice(0, 6));
  const others = accounts.filter((a) => a.id !== primary.id);

  return (
    <>
      <div className="space-y-6 pb-4">
        {/* Greeting stays modest — the balance is the headline, not this. */}
        <div className="lg:hidden">
          <p className="text-sm font-medium text-ink-400">
            {greeting()}, {firstName(user.name)}
          </p>
          <p className="mt-0.5 text-xs text-ink-400">
            {formatDate(new Date().toISOString(), "long")}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:items-start">
          <div className="space-y-6">
            <BalanceHero />
            <QuickActions />
            <Snapshot />
          </div>

          <div className="space-y-6">
            <Upcoming />

            {others.length > 0 && (
              <section>
                <SectionHeader
                  title="Your accounts"
                  action={
                    <Link
                      href="/accounts"
                      className="text-sm font-semibold text-ink-600 hover:text-ink-900"
                    >
                      View all
                    </Link>
                  }
                />
                <Surface index={4} className="divide-y divide-line overflow-hidden">
                  {others.map((account) => (
                    <AccountRow key={account.id} account={account} hidden={hidden} />
                  ))}
                </Surface>
              </section>
            )}

            <Surface index={5} variant="sunken" className="overflow-hidden">
              <Link
                href="/insights"
                className="flex items-center gap-3.5 px-5 py-4 transition-colors hover:bg-ink-50"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brass-50 text-brass-600">
                  <Sparkles className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-ink-900">
                    Your spending, explained
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-ink-400">
                    See where money went this month and what recurs next.
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-ink-400" />
              </Link>
            </Surface>
          </div>
        </div>

        <section>
          <SectionHeader
            title="Recent activity"
            action={
              <Link
                href="/activity"
                className="text-sm font-semibold text-ink-600 hover:text-ink-900"
              >
                See all
              </Link>
            }
          />
          <Surface index={6} className="divide-y divide-line overflow-hidden">
            {recent.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} hidden={hidden} />
            ))}
          </Surface>
        </section>
      </div>

      <WelcomeSheet />
    </>
  );
}
