"use client";

import * as React from "react";
import { Play, Repeat, X } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Surface, SectionHeader, Chip } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { CategoryIcon } from "@/components/activity/category-icon";
import { useBank } from "@/lib/store";
import { useSubscriptions } from "@/lib/hooks";
import { formatDate, money } from "@/lib/utils";

export default function SubscriptionsPage() {
  const subs = useSubscriptions();
  const cancel = useBank((s) => s.cancelSubscription);
  const resume = useBank((s) => s.resumeSubscription);
  const hidden = useBank((s) => s.balanceHidden);
  const [cancelling, setCancelling] = React.useState<string | null>(null);

  const active = subs.filter((s) => !s.cancelled);
  const cancelled = subs.filter((s) => s.cancelled);
  const monthly = active.reduce((n, s) => n + s.amount, 0);

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-4">
      <PageHeader
        title="Recurring payments"
        subtitle="Subscriptions and bills that repeat automatically."
        back="/insights"
      />

      <Surface variant="navy" radius="3xl" index={0} className="p-6">
        <p className="text-sm font-medium text-brass-200">Repeating each month</p>
        <p className="tnum mt-2 text-3xl font-semibold tracking-tight text-white">
          {hidden ? "••••••" : money(monthly)}
        </p>
        <p className="mt-2 text-sm text-white/50">
          {active.length} active · {cancelled.length} cancelled
        </p>
      </Surface>

      {subs.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="Nothing recurring yet"
          body="When a merchant charges you more than once, we'll track it here so you can see what repeats."
        />
      ) : (
        <>
          {active.length > 0 && (
            <section>
              <SectionHeader title="Active" />
              <Surface className="divide-y divide-line overflow-hidden">
                {active.map((sub) => (
                  <div key={sub.merchant} className="flex items-center gap-3 px-4 py-3.5">
                    <CategoryIcon category={sub.category} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-medium text-ink-900">{sub.merchant}</p>
                      <p className="mt-0.5 truncate text-sm text-ink-400">
                        Next {formatDate(sub.nextChargeAt, "short")} · charged {sub.occurrences}{" "}
                        {sub.occurrences === 1 ? "time" : "times"}
                      </p>
                    </div>
                    <span className="tnum shrink-0 text-base font-semibold text-ink-900">
                      {hidden ? "•••" : money(sub.amount)}
                    </span>
                    <button
                      onClick={() => setCancelling(sub.merchant)}
                      aria-label={`Cancel ${sub.merchant}`}
                      className="press flex h-9 w-9 items-center justify-center rounded-sm text-ink-400 hover:bg-neg-50 hover:text-neg-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </Surface>
            </section>
          )}

          {cancelled.length > 0 && (
            <section>
              <SectionHeader title="Cancelled" />
              <Surface className="divide-y divide-line overflow-hidden">
                {cancelled.map((sub) => (
                  <div key={sub.merchant} className="flex items-center gap-3 px-4 py-3.5 opacity-70">
                    <CategoryIcon category={sub.category} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-medium text-ink-900">{sub.merchant}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-400">
                        <Chip tone="neutral">Cancelled</Chip>
                        Future charges declined
                      </p>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => resume(sub.merchant)}>
                      <Play className="h-3.5 w-3.5" />
                      Resume
                    </Button>
                  </div>
                ))}
              </Surface>
            </section>
          )}
        </>
      )}

      <Sheet
        open={Boolean(cancelling)}
        onClose={() => setCancelling(null)}
        title="Stop future charges?"
        description={
          cancelling
            ? `We'll decline new charges from ${cancelling}. You should also cancel directly with them so they stop billing you.`
            : ""
        }
      >
        <div className="flex gap-2.5">
          <Button variant="secondary" size="lg" className="flex-1" onClick={() => setCancelling(null)}>
            Keep it
          </Button>
          <Button
            variant="danger"
            size="lg"
            className="flex-1"
            onClick={() => {
              if (cancelling) cancel(cancelling);
              setCancelling(null);
            }}
          >
            Stop charges
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
