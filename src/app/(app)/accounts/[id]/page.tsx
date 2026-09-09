"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeftRight,
  CreditCard,
  Eye,
  EyeOff,
  FileText,
  Landmark,
  Plus,
  Receipt,
  Send,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Surface, SectionHeader, Chip, IconTile } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { ListGroup, ListRow } from "@/components/ui/list";
import { PasscodeGate } from "@/components/ui/passcode-gate";
import { EmptyState } from "@/components/shared/empty-state";
import { TransactionRow } from "@/components/activity/transaction-row";
import { useBank } from "@/lib/store";
import { accountById } from "@/lib/selectors";
import {
  useAccountTransactions,
  useCardsForAccount,
  useStatements,
} from "@/lib/hooks";
import { formatDate, money } from "@/lib/utils";

export default function AccountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const user = useBank((s) => s.user);
  const account = useBank((s) => accountById(s, id));
  const transactions = useAccountTransactions(id);
  const cards = useCardsForAccount(id);
  const statements = useStatements(id);
  const hidden = useBank((s) => s.balanceHidden);
  const toggle = useBank((s) => s.toggleBalanceHidden);

  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [gateOpen, setGateOpen] = React.useState(false);
  const [numbersVisible, setNumbersVisible] = React.useState(false);

  if (!account) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title="Account" back="/accounts" />
        <EmptyState
          icon={Landmark}
          title="We couldn't find that account"
          body="It may have been closed or the link is out of date."
          action={
            <Link href="/accounts">
              <Button>Back to accounts</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const credit = account.kind === "credit";
  const recent = transactions.slice(0, 8);
  const fullNumber = `1002 4471 ${account.mask}`;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-4">
      <PageHeader
        title={account.name}
        subtitle={`•••• ${account.mask} · ${
          credit ? "Credit card account" : account.kind === "savings" ? "Savings" : "Checking"
        }`}
        back="/accounts"
      />

      <Surface variant="navy" radius="3xl" index={0} className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-brass-200">
              {credit ? "Current balance" : "Available balance"}
            </p>
            <p className="tnum mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {hidden ? "••••••••" : money(credit ? account.balance : account.available)}
            </p>
          </div>
          <button
            onClick={toggle}
            aria-label={hidden ? "Show balance" : "Hide balance"}
            className="press -mr-1 -mt-1 flex h-9 w-9 items-center justify-center rounded-md text-white/60 hover:bg-white/10 hover:text-white"
          >
            {hidden ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Stat
            label={credit ? "Available credit" : "Current balance"}
            value={hidden ? "•••" : money(credit ? account.available : account.balance)}
          />
          <Stat
            label={credit ? "Credit limit" : account.apy !== undefined ? "Interest rate" : "Status"}
            value={
              credit
                ? hidden
                  ? "•••"
                  : money(account.creditLimit ?? 0, { compact: true })
                : account.apy !== undefined
                  ? `${account.apy.toFixed(2)}% APY`
                  : "Open · Good standing"
            }
          />
        </div>
      </Surface>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
        <Action href="/payments/transfer" icon={ArrowLeftRight} label="Transfer" />
        <Action href="/deposit" icon={Plus} label="Add money" />
        <Action href="/payments/send" icon={Send} label="Send" />
        <Action href="/payments/bills" icon={Receipt} label="Pay bill" />
        <Action href="/documents" icon={FileText} label="Statements" className="hidden sm:flex" />
      </div>

      <ListGroup label="Account information">
        <ListRow
          icon={<IconTile tone="neutral"><ShieldCheck /></IconTile>}
          title="Account & routing numbers"
          detail="Needed for direct deposit and wires"
          onClick={() => setDetailsOpen(true)}
        />
        <ListRow
          icon={<IconTile tone="neutral"><FileText /></IconTile>}
          title="Statements & documents"
          detail={`${statements.length} statements available`}
          href="/documents"
        />
        <ListRow
          icon={<IconTile tone="neutral"><ArrowLeftRight /></IconTile>}
          title="All activity for this account"
          detail={`${transactions.length} transactions`}
          href={`/activity?account=${account.id}`}
        />
      </ListGroup>

      {cards.length > 0 && (
        <section>
          <SectionHeader title="Cards on this account" />
          <Surface index={2} className="divide-y divide-line overflow-hidden">
            {cards.map((card) => (
              <Link
                key={card.id}
                href={`/cards/${card.id}`}
                className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-ink-25"
              >
                <IconTile tone="navy"><CreditCard /></IconTile>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-medium text-ink-900">{card.product}</p>
                  <p className="mask-dots mt-0.5 text-sm text-ink-400">•••• {card.mask}</p>
                </div>
                {card.frozen ? (
                  <Chip tone="warn">Frozen</Chip>
                ) : (
                  <Chip tone="pos">Active</Chip>
                )}
              </Link>
            ))}
          </Surface>
        </section>
      )}

      <section>
        <SectionHeader
          title="Recent activity"
          action={
            <Link
              href={`/activity?account=${account.id}`}
              className="text-sm font-semibold text-ink-600 hover:text-ink-900"
            >
              See all
            </Link>
          }
        />
        {recent.length === 0 ? (
          <EmptyState
            compact
            icon={ArrowLeftRight}
            title="No activity yet"
            body="Transactions on this account will appear here as soon as they post."
          />
        ) : (
          <Surface index={3} className="divide-y divide-line overflow-hidden">
            {recent.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} hidden={hidden} />
            ))}
          </Surface>
        )}
      </section>

      <Sheet
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setNumbersVisible(false);
        }}
        title="Account details"
        description="Share these only with people and companies you trust."
      >
        <div className="space-y-3">
          <DetailRow label="Account holder" value={user.name} />
          <DetailRow label="Account name" value={account.name} />
          <DetailRow
            label="Routing number"
            value={account.routing ?? "—"}
            mono
          />
          <DetailRow
            label="Account number"
            value={numbersVisible ? fullNumber : `•••• •••• ${account.mask}`}
            mono
          />
          <DetailRow label="Opened" value={formatDate(account.openedAt)} />
          {!numbersVisible ? (
            <Button block size="lg" onClick={() => setGateOpen(true)}>
              Reveal account number
            </Button>
          ) : (
            <Button
              block
              size="lg"
              variant="secondary"
              onClick={() => setNumbersVisible(false)}
            >
              Hide account number
            </Button>
          )}
        </div>
      </Sheet>

      <PasscodeGate
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        onVerified={() => setNumbersVisible(true)}
        reason="Confirm your passcode to reveal your full account number."
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/6 px-4 py-3">
      <p className="text-2xs font-semibold uppercase tracking-wide text-white/50">{label}</p>
      <p className="tnum mt-1 text-base font-semibold text-white">{value}</p>
    </div>
  );
}

function Action({
  href,
  icon: Icon,
  label,
  className,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`press flex flex-col items-center gap-2 edge glass-panel relative rounded-xl px-1 py-3 hover:border-line-strong ${className ?? ""}`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-50 text-ink-700">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="text-center text-[11px] font-semibold leading-tight text-ink-700">
        {label}
      </span>
    </Link>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 edge glass-sunken relative rounded-md px-3.5 py-3">
      <span className="text-sm text-ink-400">{label}</span>
      <span className={`text-right text-sm font-semibold text-ink-900 ${mono ? "tnum" : ""}`}>
        {value}
      </span>
    </div>
  );
}
