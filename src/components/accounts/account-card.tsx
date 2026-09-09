"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CreditCard, Landmark, PiggyBank } from "lucide-react";
import type { Account } from "@/lib/types";
import { IconTile } from "@/components/ui/surface";
import { money } from "@/lib/utils";

const ICON = {
  checking: Landmark,
  savings: PiggyBank,
  credit: CreditCard,
} as const;

/** One account row — used on Home and on the Accounts list. */
export function AccountRow({
  account,
  hidden,
}: {
  account: Account;
  hidden?: boolean;
}) {
  const Icon = ICON[account.kind];
  const credit = account.kind === "credit";

  return (
    <Link
      href={`/accounts/${account.id}`}
      className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-ink-25 active:bg-ink-50"
    >
      <IconTile tone={credit ? "brass" : "navy"}>
        <Icon />
      </IconTile>
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-medium text-ink-900">{account.name}</p>
        <p className="mask-dots mt-0.5 text-sm text-ink-400">
          •••• {account.mask}
          {account.apy !== undefined && (
            <span className="tnum"> · {account.apy.toFixed(2)}% APY</span>
          )}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="tnum text-base font-semibold text-ink-900">
          {hidden ? "••••••" : money(account.balance)}
        </p>
        <p className="tnum mt-0.5 text-xs text-ink-400">
          {credit
            ? hidden
              ? "•••"
              : `${money(account.available)} available`
            : "Available"}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-ink-300" />
    </Link>
  );
}
