"use client";

import Link from "next/link";
import { Building2, ChevronRight, Eye, EyeOff, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Surface, SectionHeader, Chip, IconTile } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { AccountRow } from "@/components/accounts/account-card";
import { useBank } from "@/lib/store";
import { creditOwed, netPosition, totalDeposits } from "@/lib/selectors";
import { money } from "@/lib/utils";

export default function AccountsPage() {
  const accounts = useBank((s) => s.accounts);
  const external = useBank((s) => s.externalAccounts);
  const hidden = useBank((s) => s.balanceHidden);
  const toggle = useBank((s) => s.toggleBalanceHidden);
  const deposits = useBank(totalDeposits);
  const owed = useBank(creditOwed);
  const net = useBank(netPosition);

  const depositAccounts = accounts.filter((a) => a.kind !== "credit");
  const creditAccounts = accounts.filter((a) => a.kind === "credit");

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-4">
      <PageHeader
        title="Accounts"
        subtitle="Everything you hold with Auremont, in one place."
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={toggle}
            aria-label={hidden ? "Show balances" : "Hide balances"}
          >
            {hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {hidden ? "Show" : "Hide"}
          </Button>
        }
      />

      <Surface variant="navy" radius="3xl" index={0} className="p-6">
        <p className="text-sm font-medium text-brass-200">Total position</p>
        <p className="tnum mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {hidden ? "••••••••" : money(net)}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/8 bg-white/6 px-4 py-3">
            <p className="text-2xs font-semibold uppercase tracking-wide text-white/50">
              Deposits
            </p>
            <p className="tnum mt-1 text-lg font-semibold text-white">
              {hidden ? "•••" : money(deposits, { compact: true })}
            </p>
          </div>
          <div className="rounded-xl border border-white/8 bg-white/6 px-4 py-3">
            <p className="text-2xs font-semibold uppercase tracking-wide text-white/50">
              Card balance
            </p>
            <p className="tnum mt-1 text-lg font-semibold text-white">
              {hidden ? "•••" : money(owed, { compact: true })}
            </p>
          </div>
        </div>
      </Surface>

      <section>
        <SectionHeader title="Deposit accounts" />
        <Surface index={1} className="divide-y divide-line overflow-hidden">
          {depositAccounts.map((a) => (
            <AccountRow key={a.id} account={a} hidden={hidden} />
          ))}
        </Surface>
      </section>

      {creditAccounts.length > 0 && (
        <section>
          <SectionHeader title="Credit" />
          <Surface index={2} className="divide-y divide-line overflow-hidden">
            {creditAccounts.map((a) => (
              <AccountRow key={a.id} account={a} hidden={hidden} />
            ))}
          </Surface>
        </section>
      )}

      <section>
        <SectionHeader
          title="Linked banks"
          action={
            <Link
              href="/accounts/external"
              className="text-sm font-semibold text-ink-600 hover:text-ink-900"
            >
              Manage
            </Link>
          }
        />
        <Surface index={3} className="divide-y divide-line overflow-hidden">
          {external.slice(0, 3).map((x) => (
            <Link
              key={x.id}
              href="/accounts/external"
              className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-ink-25"
            >
              <IconTile tone="neutral">
                <Building2 />
              </IconTile>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-medium text-ink-900">{x.institution}</p>
                <p className="mask-dots mt-0.5 text-sm text-ink-400">•••• {x.mask}</p>
              </div>
              <Chip tone={x.status === "linked" ? "pos" : "warn"}>
                {x.status === "linked" ? "Linked" : "Pending"}
              </Chip>
              <ChevronRight className="h-4 w-4 shrink-0 text-ink-300" />
            </Link>
          ))}
          <Link
            href="/accounts/external"
            className="flex items-center gap-3 px-4 py-3.5 text-ink-600 transition-colors hover:bg-ink-25"
          >
            <IconTile tone="neutral">
              <Plus />
            </IconTile>
            <span className="flex-1 text-base font-medium">Link another bank</span>
            <ChevronRight className="h-4 w-4 text-ink-300" />
          </Link>
        </Surface>
      </section>
    </div>
  );
}
