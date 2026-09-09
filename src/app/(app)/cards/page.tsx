"use client";

import Link from "next/link";
import { ChevronRight, CreditCard, Snowflake } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Surface, Chip } from "@/components/ui/surface";
import { BankCard } from "@/components/cards/bank-card";
import { useBank } from "@/lib/store";
import { money } from "@/lib/utils";

export default function CardsPage() {
  const cards = useBank((s) => s.cards);
  const accounts = useBank((s) => s.accounts);
  const hidden = useBank((s) => s.balanceHidden);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-4">
      <PageHeader title="Cards" subtitle="Your Auremont cards and their controls." />

      <div className="grid gap-5 sm:grid-cols-2">
        {cards.map((card) => {
          const account = accounts.find((a) => a.id === card.accountId);
          return (
            <Link key={card.id} href={`/cards/${card.id}`} className="press block">
              <BankCard card={card} />
              <div className="mt-3 flex items-center gap-2.5 px-0.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-medium text-ink-900">
                    {card.product}
                    {card.virtual && (
                      <span className="ml-2 align-middle">
                        <Chip tone="brass">Virtual</Chip>
                      </span>
                    )}
                  </p>
                  <p className="truncate text-sm text-ink-400">
                    {account?.name} ·{" "}
                    <span className="tnum">
                      {hidden
                        ? "•••"
                        : money(
                            account?.kind === "credit"
                              ? account.available
                              : (account?.available ?? 0),
                            { compact: true }
                          )}{" "}
                      available
                    </span>
                  </p>
                </div>
                {card.frozen ? (
                  <Chip tone="warn">
                    <Snowflake className="h-3 w-3" />
                    Frozen
                  </Chip>
                ) : (
                  <Chip tone="pos">Active</Chip>
                )}
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-300" />
              </div>
            </Link>
          );
        })}
      </div>

      <Surface variant="sunken" className="flex items-start gap-3.5 p-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-600">
          <CreditCard className="h-[18px] w-[18px]" />
        </span>
        <div>
          <h2 className="text-base font-semibold tracking-tight text-ink-900">
            Need a card for one purchase?
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-400">
            Your virtual card has its own number and limits, so you can use it online without
            exposing your physical card.
          </p>
        </div>
      </Surface>
    </div>
  );
}
