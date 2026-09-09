"use client";

import * as React from "react";
import Link from "next/link";
import {
  Banknote,
  Building2,
  ChevronRight,
  Landmark,
  MapPin,
  ScanLine,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Surface, SectionHeader, Chip, IconTile } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { useBank } from "@/lib/store";

const LOCATIONS = [
  { name: "Dilworth Market", detail: "1420 East Blvd", distance: "0.4 mi" },
  { name: "Southend Pharmacy", detail: "2201 Hawkins St", distance: "1.1 mi" },
  { name: "Elizabeth Grocers", detail: "1733 Seventh St", distance: "2.3 mi" },
];

export default function DepositPage() {
  const external = useBank((s) => s.externalAccounts);
  const [cashOpen, setCashOpen] = React.useState(false);

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-4">
      <PageHeader title="Add money" subtitle="Move money into your Auremont accounts." back="/payments" />

      <div className="space-y-3">
        <Option
          href="/deposit/transfer"
          icon={Building2}
          title="Transfer from a linked bank"
          detail="Pull money in from an account at another bank"
        />
        <Option
          href="/deposit/check"
          icon={ScanLine}
          title="Deposit a check"
          detail="Photograph the front and back — funds usually clear next business day"
        />
        <Option
          href="/deposit/direct"
          icon={Landmark}
          title="Direct deposit"
          detail="Get your account and routing numbers for payroll"
        />
        <button
          onClick={() => setCashOpen(true)}
          className="press flex w-full items-center gap-3.5 edge glass-panel relative rounded-2xl px-5 py-4 text-left hover:brightness-[1.03]"
        >
          <IconTile tone="navy" size="lg">
            <Banknote />
          </IconTile>
          <span className="min-w-0 flex-1">
            <span className="block text-base font-semibold text-ink-900">Add cash</span>
            <span className="mt-0.5 block text-sm leading-snug text-ink-400">
              Deposit cash at a partner location near you
            </span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-ink-300" />
        </button>
      </div>

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
        <Surface className="divide-y divide-line overflow-hidden">
          {external.length === 0 ? (
            <div className="px-5 py-6 text-center">
              <p className="text-sm text-ink-400">
                Link a bank to move money in from an outside account.
              </p>
              <Link href="/accounts/external" className="mt-3 inline-block">
                <Button size="sm" variant="secondary">
                  Link a bank
                </Button>
              </Link>
            </div>
          ) : (
            external.map((x) => (
              <Link
                key={x.id}
                href="/deposit/transfer"
                className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-ink-25"
              >
                <IconTile tone="neutral">
                  <Building2 />
                </IconTile>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-medium text-ink-900">{x.nickname}</p>
                  <p className="mask-dots mt-0.5 text-sm text-ink-400">
                    {x.institution} · •••• {x.mask}
                  </p>
                </div>
                <Chip tone={x.status === "linked" ? "pos" : "warn"}>
                  {x.status === "linked" ? "Linked" : "Verifying"}
                </Chip>
              </Link>
            ))
          )}
        </Surface>
      </section>

      <Sheet
        open={cashOpen}
        onClose={() => setCashOpen(false)}
        title="Add cash nearby"
        description="Take your cash and the barcode in this app to any partner location. Deposits post within minutes."
      >
        <div className="space-y-2">
          {LOCATIONS.map((l) => (
            <div
              key={l.name}
              className="flex items-center gap-3 edge glass-panel relative rounded-xl px-3.5 py-3"
            >
              <IconTile tone="neutral">
                <MapPin />
              </IconTile>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink-900">{l.name}</p>
                <p className="mt-0.5 truncate text-xs text-ink-400">{l.detail}</p>
              </div>
              <span className="tnum shrink-0 text-xs font-semibold text-ink-500">{l.distance}</span>
            </div>
          ))}
          <p className="px-1 pt-1 text-xs leading-relaxed text-ink-400">
            Partner locations may charge their own fee. Auremont doesn&apos;t add one.
          </p>
          <Button block size="lg" onClick={() => setCashOpen(false)}>
            Done
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

function Option({
  href,
  icon: Icon,
  title,
  detail,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  detail: string;
}) {
  return (
    <Link
      href={href}
      className="press flex items-center gap-3.5 edge glass-panel relative rounded-2xl px-5 py-4 hover:border-line-strong"
    >
      <IconTile tone="navy" size="lg">
        <Icon />
      </IconTile>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold text-ink-900">{title}</span>
        <span className="mt-0.5 block text-sm leading-snug text-ink-400">{detail}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-ink-300" />
    </Link>
  );
}
