"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownToLine,
  ArrowLeftRight,
  Bell,
  BellOff,
  FileText,
  Receipt,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Surface, IconTile } from "@/components/ui/surface";
import { Segmented } from "@/components/ui/segmented";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { useBank } from "@/lib/store";
import { unreadCount } from "@/lib/selectors";
import type { AppNotification, NotificationKind } from "@/lib/types";
import { cn, formatTime, relativeDay } from "@/lib/utils";

type FilterId = "all" | "transactions" | "payments" | "security" | "account";

const FILTERS: { value: FilterId; label: string; kinds?: NotificationKind[] }[] = [
  { value: "all", label: "All" },
  { value: "transactions", label: "Transactions", kinds: ["transaction", "deposit"] },
  { value: "payments", label: "Payments", kinds: ["payment"] },
  { value: "security", label: "Security", kinds: ["security"] },
  { value: "account", label: "Account", kinds: ["account", "promotion"] },
];

const META: Record<
  NotificationKind,
  { icon: LucideIcon; tone: "neutral" | "pos" | "info" | "brass" }
> = {
  transaction: { icon: ArrowLeftRight, tone: "neutral" },
  deposit: { icon: ArrowDownToLine, tone: "pos" },
  payment: { icon: Receipt, tone: "info" },
  security: { icon: ShieldCheck, tone: "brass" },
  account: { icon: FileText, tone: "neutral" },
  promotion: { icon: Sparkles, tone: "brass" },
};

const EMPTY_FILTER: Record<Exclude<FilterId, "all">, string> = {
  transactions: "No card or deposit alerts in your notifications yet.",
  payments: "Nothing about bills or transfers right now.",
  security: "No security alerts — your account has been quiet.",
  account: "Nothing about your accounts or rates at the moment.",
};

export default function NotificationsPage() {
  const router = useRouter();
  const notifications = useBank((s) => s.notifications);
  const unread = useBank(unreadCount);
  const markRead = useBank((s) => s.markRead);
  const markAllRead = useBank((s) => s.markAllRead);
  const deleteNotification = useBank((s) => s.deleteNotification);
  const clearNotifications = useBank((s) => s.clearNotifications);

  const [filter, setFilter] = React.useState<FilterId>("all");
  const [confirmClear, setConfirmClear] = React.useState(false);

  const active = FILTERS.find((f) => f.value === filter);
  const list = React.useMemo(() => {
    const kinds = active?.kinds;
    const rows = kinds ? notifications.filter((n) => kinds.includes(n.kind)) : notifications;
    return [...rows].sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [notifications, active]);

  const groups = React.useMemo(() => {
    const out: { label: string; items: AppNotification[] }[] = [];
    for (const n of list) {
      const label = relativeDay(n.date);
      const last = out[out.length - 1];
      if (last && last.label === label) last.items.push(n);
      else out.push({ label, items: [n] });
    }
    return out;
  }, [list]);

  const open = (n: AppNotification) => {
    markRead(n.id);
    if (n.href) router.push(n.href);
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader
        title="Notifications"
        subtitle={unread > 0 ? `${unread} unread` : "You're all caught up"}
        back
        action={
          notifications.length > 0 ? (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={unread === 0}
                onClick={markAllRead}
              >
                Mark all read
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmClear(true)}>
                Clear all
              </Button>
            </div>
          ) : undefined
        }
      />

      {notifications.length > 0 && (
        <Segmented
          id="notif"
          className="mb-5"
          options={FILTERS.map((f) => ({ value: f.value, label: f.label }))}
          value={filter}
          onChange={setFilter}
        />
      )}

      {notifications.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="Nothing to catch up on"
          body="Alerts about deposits, card payments and sign-ins land here the moment they happen. You can choose exactly what we send you."
          action={
            <Button variant="secondary" onClick={() => router.push("/settings/notifications")}>
              Notification settings
            </Button>
          }
        />
      ) : list.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Nothing here"
          body={EMPTY_FILTER[filter as Exclude<FilterId, "all">]}
          action={
            <Button variant="secondary" onClick={() => setFilter("all")}>
              Show all notifications
            </Button>
          }
          compact
        />
      ) : (
        <div className="space-y-5">
          {groups.map((group, gi) => (
            <section key={group.label}>
              <h2 className="mb-2 px-1 text-[13px] font-semibold uppercase tracking-[0.09em] text-ink-400">
                {group.label}
              </h2>
              <Surface index={gi} className="divide-y divide-line overflow-hidden">
                {group.items.map((n) => {
                  const meta = META[n.kind];
                  return (
                    <div
                      key={n.id}
                      className={cn(
                        "flex items-start gap-3 px-4 py-3.5 transition-colors",
                        !n.read && "bg-surface-sunken"
                      )}
                    >
                      <IconTile tone={meta.tone}>
                        <meta.icon />
                      </IconTile>

                      <button
                        type="button"
                        onClick={() => open(n)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <span className="flex items-center gap-2">
                          {!n.read && (
                            <span
                              aria-hidden
                              className="h-1.5 w-1.5 shrink-0 rounded-3xl bg-brass-400"
                            />
                          )}
                          <span
                            className={cn(
                              "truncate text-base",
                              n.read ? "font-medium text-ink-700" : "font-semibold text-ink-900"
                            )}
                          >
                            {n.title}
                          </span>
                        </span>
                        <span className="mt-0.5 block line-clamp-2 text-sm leading-relaxed text-ink-400">
                          {n.body}
                        </span>
                        <span className="mt-1 block text-2xs text-ink-300">
                          {formatTime(n.date)}
                          {n.href ? " · Tap to open" : ""}
                        </span>
                      </button>

                      <button
                        type="button"
                        aria-label={`Delete notification: ${n.title}`}
                        onClick={() => deleteNotification(n.id)}
                        className="press -mr-1 shrink-0 rounded-sm p-2 text-ink-300 hover:bg-ink-50 hover:text-ink-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </Surface>
            </section>
          ))}
        </div>
      )}

      <Sheet
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Clear all notifications?"
        description="This removes every notification from this list. Your transactions, statements and security records are unaffected."
      >
        <div className="flex flex-col gap-2 pt-1">
          <Button
            variant="danger"
            block
            onClick={() => {
              clearNotifications();
              setConfirmClear(false);
            }}
          >
            Clear all
          </Button>
          <Button variant="ghost" block onClick={() => setConfirmClear(false)}>
            Keep them
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
