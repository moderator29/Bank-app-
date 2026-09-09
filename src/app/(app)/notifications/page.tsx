"use client";

import { Bell, BellDot } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { useEcokripto } from "@/lib/store";
import { formatDate, cn } from "@/lib/utils";
import type { AppNotification } from "@/lib/types";

export default function NotificationsPage() {
  const notifications = useEcokripto((s) => s.notifications);
  const markAllRead = useEcokripto((s) => s.markAllRead);
  const markRead = useEcokripto((s) => s.markRead);

  const hasUnread = notifications.some((n: AppNotification) => !n.read);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle="Everything happening on your account."
        action={
          hasUnread ? (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              Mark all read
            </Button>
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="All caught up"
          body="New activity on your account will show up here."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n: AppNotification, i: number) => (
            <GlassCard
              key={n.id}
              delay={Math.min(i * 0.06, 0.4)}
              onClick={() => {
                if (!n.read) markRead(n.id);
              }}
              className={cn(
                "cursor-pointer p-4",
                !n.read
                  ? "border border-brand-300/60 bg-white/80"
                  : "opacity-80"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  {n.read ? (
                    <Bell className="h-5 w-5" />
                  ) : (
                    <BellDot className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-bold text-ink-900">{n.title}</p>
                    {!n.read && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-ink-600">{n.body}</p>
                  <p className="mt-1.5 text-xs text-ink-400">
                    {formatDate(n.date)}
                  </p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
