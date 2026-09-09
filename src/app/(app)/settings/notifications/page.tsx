"use client";

import { ArrowLeftRight, Mail, Megaphone, Receipt, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { IconTile } from "@/components/ui/surface";
import { ListGroup, ListRow, Toggle } from "@/components/ui/list";
import { useBank } from "@/lib/store";
import type { Preferences } from "@/lib/types";

type PrefKey = keyof Pick<
  Preferences,
  "pushTransactions" | "pushPayments" | "pushSecurity" | "pushMarketing" | "emailStatements"
>;

const PUSH: { key: PrefKey; title: string; detail: string; icon: LucideIcon }[] = [
  {
    key: "pushTransactions",
    title: "Card & transactions",
    detail: "Every purchase, refund and ATM withdrawal as it happens.",
    icon: ArrowLeftRight,
  },
  {
    key: "pushPayments",
    title: "Payments & transfers",
    detail: "Bills paid, transfers sent and money arriving in your accounts.",
    icon: Receipt,
  },
  {
    key: "pushSecurity",
    title: "Security alerts",
    detail: "New sign-ins, device changes and anything unusual we spot.",
    icon: ShieldCheck,
  },
  {
    key: "pushMarketing",
    title: "Offers & rates",
    detail: "Occasional rate changes and products we think suit you.",
    icon: Megaphone,
  },
];

export default function NotificationSettingsPage() {
  const preferences = useBank((s) => s.preferences);
  const setPreference = useBank((s) => s.setPreference);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader
        title="Notifications"
        subtitle="Choose what reaches you, and where"
        back="/settings"
      />

      <div className="space-y-6">
        <ListGroup label="Push">
          {PUSH.map((row) => (
            <ListRow
              key={row.key}
              icon={
                <IconTile tone="neutral">
                  <row.icon />
                </IconTile>
              }
              title={row.title}
              detail={row.detail}
              value={
                <Toggle
                  checked={preferences[row.key]}
                  onChange={(v) => setPreference(row.key, v)}
                  label={row.title}
                />
              }
            />
          ))}
        </ListGroup>

        <ListGroup label="Email">
          <ListRow
            icon={
              <IconTile tone="neutral">
                <Mail />
              </IconTile>
            }
            title="Monthly statements"
            detail="A copy of each statement, emailed the day it's published."
            value={
              <Toggle
                checked={preferences.emailStatements}
                onChange={(v) => setPreference("emailStatements", v)}
                label="Monthly statements by email"
              />
            }
          />
        </ListGroup>
      </div>

      <p className="mt-5 px-1 text-sm leading-relaxed text-ink-400">
        Security alerts about sign-ins and card changes are always recorded in your
        notification centre, even when push is switched off. Fraud warnings may still reach
        you by text.
      </p>
    </div>
  );
}
