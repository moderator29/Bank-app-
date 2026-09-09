"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Flag, MapPin, Receipt, Repeat, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Surface, Chip, IconTile } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { ListGroup, ListRow } from "@/components/ui/list";
import { EmptyState } from "@/components/shared/empty-state";
import { CategoryIcon, CATEGORY_LABEL } from "@/components/activity/category-icon";
import { useBank } from "@/lib/store";
import { accountById, txById } from "@/lib/selectors";
import { formatDate, formatTime, money } from "@/lib/utils";

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const tx = useBank((s) => txById(s, id));
  const account = useBank((s) => (tx ? accountById(s, tx.accountId) : undefined));
  const startThread = useBank((s) => s.startSupportThread);

  const [dispute, setDispute] = React.useState(false);
  const [receipt, setReceipt] = React.useState(false);
  const [raised, setRaised] = React.useState(false);

  if (!tx) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title="Transaction" back="/activity" />
        <EmptyState
          icon={Receipt}
          title="We couldn't find that transaction"
          body="It may have been removed, or the link is out of date."
          action={
            <Link href="/activity">
              <Button>Back to activity</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const incoming = tx.amount > 0;

  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-4">
      <PageHeader title="Transaction" back />

      <Surface index={0} className="overflow-hidden">
        <div className="flex flex-col items-center border-b border-line px-6 py-8 text-center">
          <CategoryIcon category={tx.category} incoming={incoming} size="lg" />
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-ink-900">
            {tx.merchant}
          </h1>
          <p className="tnum mt-2 text-4xl font-semibold tracking-tight text-ink-900">
            {incoming ? "+" : "−"}
            {money(Math.abs(tx.amount))}
          </p>
          <div className="mt-3 flex items-center gap-2">
            {tx.status === "pending" ? (
              <Chip tone="warn">Pending</Chip>
            ) : (
              <Chip tone="pos">Completed</Chip>
            )}
            <Chip tone="neutral">{CATEGORY_LABEL[tx.category]}</Chip>
          </div>
        </div>

        <dl className="divide-y divide-line">
          <Row label="Date" value={formatDate(tx.date, "long")} />
          <Row label="Time" value={formatTime(tx.date)} />
          <Row label="Payment method" value={tx.method} />
          <Row
            label="Account"
            value={
              account ? (
                <Link
                  href={`/accounts/${account.id}`}
                  className="font-semibold text-ink-900 underline-offset-4 hover:underline"
                >
                  {account.name} •••• {account.mask}
                </Link>
              ) : (
                "—"
              )
            }
          />
          {tx.city && (
            <Row
              label="Location"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-ink-400" />
                  {tx.city}
                </span>
              }
            />
          )}
          {tx.note && <Row label="Note" value={tx.note} />}
          <Row label="Reference" value={<span className="tnum">{tx.reference}</span>} />
        </dl>
      </Surface>

      {tx.status === "pending" && (
        <Surface variant="sunken" className="px-4 py-3.5 text-sm leading-relaxed text-ink-500">
          This transaction hasn&apos;t settled yet. The final amount can change slightly, and
          it&apos;s already reflected in your available balance.
        </Surface>
      )}

      <ListGroup label="More">
        <ListRow
          icon={<IconTile tone="neutral"><Search /></IconTile>}
          title={`All activity with ${tx.merchant}`}
          detail="See every transaction with this merchant"
          href={`/search?q=${encodeURIComponent(tx.merchant)}`}
        />
        <ListRow
          icon={<IconTile tone="neutral"><Receipt /></IconTile>}
          title="Save receipt"
          detail="Keep a copy in your documents"
          onClick={() => setReceipt(true)}
        />
        {tx.category === "subscriptions" && (
          <ListRow
            icon={<IconTile tone="neutral"><Repeat /></IconTile>}
            title="Manage this subscription"
            detail="See the schedule or stop future charges"
            href="/insights/subscriptions"
          />
        )}
        <ListRow
          icon={<IconTile tone="neg"><Flag /></IconTile>}
          title="Something's wrong with this charge"
          detail="Start a dispute with our team"
          onClick={() => setDispute(true)}
          tone="danger"
        />
      </ListGroup>

      <Sheet
        open={receipt}
        onClose={() => setReceipt(false)}
        title="Receipt saved"
        description="You'll find it under Documents whenever you need it."
      >
        <Button block size="lg" onClick={() => setReceipt(false)}>
          Done
        </Button>
      </Sheet>

      <Sheet
        open={dispute}
        onClose={() => {
          setDispute(false);
          setRaised(false);
        }}
        title={raised ? "Dispute opened" : "Dispute this charge?"}
        description={
          raised
            ? "Our payments team will look into it and come back to you within two business days."
            : `We'll open a case for the ${money(Math.abs(tx.amount))} charge from ${tx.merchant} and follow up in your messages.`
        }
      >
        {raised ? (
          <div className="space-y-3">
            <Link href="/support/chat">
              <Button block size="lg">
                Go to messages
              </Button>
            </Link>
            <Button
              block
              variant="ghost"
              onClick={() => {
                setDispute(false);
                setRaised(false);
              }}
            >
              Close
            </Button>
          </div>
        ) : (
          <div className="flex gap-2.5">
            <Button variant="secondary" size="lg" className="flex-1" onClick={() => setDispute(false)}>
              Cancel
            </Button>
            <Button
              size="lg"
              className="flex-1"
              onClick={() => {
                startThread(
                  `Dispute · ${tx.merchant}`,
                  `I'd like to dispute the ${money(Math.abs(tx.amount))} charge from ${tx.merchant} on ${formatDate(tx.date)} (reference ${tx.reference}).`
                );
                setRaised(true);
              }}
            >
              Open dispute
            </Button>
          </div>
        )}
      </Sheet>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-5 py-3.5">
      <dt className="text-sm text-ink-400">{label}</dt>
      <dd className="min-w-0 text-right text-base font-medium text-ink-900">{value}</dd>
    </div>
  );
}
