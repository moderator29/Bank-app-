"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Check,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  Globe,
  Nfc,
  RefreshCw,
  ShoppingCart,
  Sliders,
  Snowflake,
  Landmark,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Surface, SectionHeader, Chip, IconTile } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { ListGroup, ListRow, Toggle } from "@/components/ui/list";
import { PasscodeGate } from "@/components/ui/passcode-gate";
import { EmptyState } from "@/components/shared/empty-state";
import { BankCard } from "@/components/cards/bank-card";
import { TransactionList } from "@/components/activity/transaction-list";
import { Segmented } from "@/components/ui/segmented";
import { useBank } from "@/lib/store";
import { accountById, cardById, filterTransactions } from "@/lib/selectors";
import { money } from "@/lib/utils";

type Filter = "all" | "food" | "shopping" | "travel" | "bills" | "entertainment";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "food", label: "Food" },
  { value: "shopping", label: "Shopping" },
  { value: "travel", label: "Travel" },
  { value: "bills", label: "Bills" },
  { value: "entertainment", label: "Fun" },
];

export default function CardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const card = useBank((s) => cardById(s, id));
  const account = useBank((s) => (card ? accountById(s, card.accountId) : undefined));
  const transactions = useBank((s) => s.transactions);
  const toggleFreeze = useBank((s) => s.toggleFreeze);
  const replaceCard = useBank((s) => s.replaceCard);
  const setCardLimits = useBank((s) => s.setCardLimits);
  const hidden = useBank((s) => s.balanceHidden);

  const [revealed, setRevealed] = React.useState(false);
  const [gate, setGate] = React.useState<null | "reveal" | "freeze" | "replace">(null);
  const [confirm, setConfirm] = React.useState<null | "freeze" | "replace" | "wallet">(null);
  const [copied, setCopied] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<Filter>("all");

  // Never leave a revealed number on screen when leaving the page.
  React.useEffect(() => () => setRevealed(false), []);

  if (!card) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title="Card" back="/cards" />
        <EmptyState
          icon={CreditCard}
          title="We couldn't find that card"
          body="It may have been replaced or closed."
          action={
            <Link href="/cards">
              <Button>Back to cards</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const cardTx = React.useMemo(() => {
    const mine = transactions.filter((t) => t.method.includes(card.mask));
    if (filter === "all") return mine;
    return filterTransactions(mine, { categories: [filter] });
  }, [transactions, card.mask, filter]);

  const monthSpend = cardTx
    .filter((t) => t.amount < 0 && +new Date(t.date) > Date.now() - 30 * 86_400_000)
    .reduce((n, t) => n + -t.amount, 0);

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value.replace(/\s/g, ""));
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      setCopied(null);
    }
  };

  const limitPct = Math.min(100, Math.round((monthSpend / card.limits.daily) * 100));

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-4">
      <PageHeader
        title={card.product}
        subtitle={`•••• ${card.mask} · ${account?.name ?? ""}`}
        back="/cards"
      />

      <BankCard card={card} revealed={revealed} />

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => (revealed ? setRevealed(false) : setGate("reveal"))}
          className="press flex flex-col items-center gap-2 rounded-xl border border-line bg-surface px-1 py-3 shadow-e1 hover:border-line-strong"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-50 text-ink-700">
            {revealed ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
          </span>
          <span className="text-[11px] font-semibold text-ink-700">
            {revealed ? "Hide details" : "Show details"}
          </span>
        </button>
        <button
          onClick={() => setConfirm("freeze")}
          className="press flex flex-col items-center gap-2 rounded-xl border border-line bg-surface px-1 py-3 shadow-e1 hover:border-line-strong"
        >
          <span
            className={
              card.frozen
                ? "flex h-9 w-9 items-center justify-center rounded-lg bg-warn-50 text-warn-500"
                : "flex h-9 w-9 items-center justify-center rounded-lg bg-ink-50 text-ink-700"
            }
          >
            <Snowflake className="h-[18px] w-[18px]" />
          </span>
          <span className="text-[11px] font-semibold text-ink-700">
            {card.frozen ? "Unfreeze" : "Freeze card"}
          </span>
        </button>
        <button
          onClick={() => setConfirm("wallet")}
          className="press flex flex-col items-center gap-2 rounded-xl border border-line bg-surface px-1 py-3 shadow-e1 hover:border-line-strong"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-50 text-ink-700">
            <Wallet className="h-[18px] w-[18px]" />
          </span>
          <span className="text-[11px] font-semibold text-ink-700">Add to wallet</span>
        </button>
      </div>

      {revealed && (
        <Surface className="divide-y divide-line overflow-hidden">
          <CopyRow
            label="Card number"
            value={card.number}
            copied={copied === "Card number"}
            onCopy={() => copy("Card number", card.number)}
          />
          <CopyRow
            label="Expires"
            value={card.expiry}
            copied={copied === "Expires"}
            onCopy={() => copy("Expires", card.expiry)}
          />
          <CopyRow
            label="Security code"
            value={card.cvv}
            copied={copied === "Security code"}
            onCopy={() => copy("Security code", card.cvv)}
          />
        </Surface>
      )}

      <Surface className="p-5">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.09em] text-ink-400">
              Spent in the last 30 days
            </p>
            <p className="tnum mt-1.5 text-2xl font-semibold tracking-tight text-ink-900">
              {hidden ? "••••••" : money(monthSpend)}
            </p>
          </div>
          <p className="tnum text-sm text-ink-400">
            of {money(card.limits.daily, { compact: true })} daily limit
          </p>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-3xl bg-ink-50">
          <div
            className="h-full rounded-3xl bg-ink-800 transition-[width] duration-700"
            style={{ width: `${Math.max(limitPct, 2)}%` }}
          />
        </div>
      </Surface>

      <ListGroup label="Card controls">
        <ListRow
          icon={<IconTile tone="neutral"><Sliders /></IconTile>}
          title="Spending limits"
          detail={`Daily ${money(card.limits.daily, { compact: true })} · ATM ${money(card.limits.atm, { compact: true })}`}
          href={`/cards/${card.id}/limits`}
        />
        <ListRow
          icon={<IconTile tone="neutral"><ShoppingCart /></IconTile>}
          title="Online purchases"
          value={
            <Toggle
              checked={card.limits.online}
              onChange={(v) => setCardLimits(card.id, { online: v })}
              label="Online purchases"
            />
          }
          chevron={false}
        />
        <ListRow
          icon={<IconTile tone="neutral"><Globe /></IconTile>}
          title="International purchases"
          value={
            <Toggle
              checked={card.limits.international}
              onChange={(v) => setCardLimits(card.id, { international: v })}
              label="International purchases"
            />
          }
          chevron={false}
        />
        <ListRow
          icon={<IconTile tone="neutral"><Nfc /></IconTile>}
          title="Contactless"
          value={
            <Toggle
              checked={card.limits.contactless}
              onChange={(v) => setCardLimits(card.id, { contactless: v })}
              label="Contactless"
            />
          }
          chevron={false}
        />
      </ListGroup>

      <ListGroup label="Manage">
        <ListRow
          icon={<IconTile tone="neutral"><Landmark /></IconTile>}
          title="Linked account"
          detail={`${account?.name} •••• ${account?.mask}`}
          href={`/accounts/${card.accountId}`}
        />
        <ListRow
          icon={<IconTile tone="neutral"><RefreshCw /></IconTile>}
          title={card.status === "replacing" ? "Replacement on the way" : "Replace this card"}
          detail={
            card.status === "replacing"
              ? "Arriving in 3–5 business days"
              : "If it's lost, damaged or you suspect fraud"
          }
          onClick={card.status === "replacing" ? undefined : () => setConfirm("replace")}
          chevron={card.status !== "replacing"}
        />
      </ListGroup>

      <section>
        <SectionHeader title="Card activity" />
        <Segmented
          id="card-cat"
          className="mb-3"
          value={filter}
          onChange={setFilter}
          options={FILTERS}
        />
        {cardTx.length === 0 ? (
          <EmptyState
            compact
            icon={CreditCard}
            title="Nothing here yet"
            body={
              filter === "all"
                ? "Purchases made with this card will appear here."
                : "No purchases in this category yet."
            }
          />
        ) : (
          <TransactionList
            transactions={cardTx.slice(0, 30)}
            hidden={hidden}
            showDayTotals={false}
          />
        )}
      </section>

      {/* ---- confirmations ---- */}

      <Sheet
        open={confirm === "freeze"}
        onClose={() => setConfirm(null)}
        title={card.frozen ? "Unfreeze this card?" : "Freeze this card?"}
        description={
          card.frozen
            ? "Purchases, withdrawals and recurring payments will work again straight away."
            : "New purchases and withdrawals will be declined immediately. Recurring payments already set up will also stop."
        }
      >
        <div className="flex gap-2.5">
          <Button variant="secondary" size="lg" className="flex-1" onClick={() => setConfirm(null)}>
            Cancel
          </Button>
          <Button
            size="lg"
            className="flex-1"
            onClick={() => {
              setConfirm(null);
              setGate("freeze");
            }}
          >
            {card.frozen ? "Unfreeze" : "Freeze card"}
          </Button>
        </div>
      </Sheet>

      <Sheet
        open={confirm === "replace"}
        onClose={() => setConfirm(null)}
        title="Replace this card?"
        description="We'll freeze this card now and post a new one to the address on your account. It arrives in 3–5 business days."
      >
        <div className="flex gap-2.5">
          <Button variant="secondary" size="lg" className="flex-1" onClick={() => setConfirm(null)}>
            Not now
          </Button>
          <Button
            size="lg"
            className="flex-1"
            onClick={() => {
              setConfirm(null);
              setGate("replace");
            }}
          >
            Replace card
          </Button>
        </div>
      </Sheet>

      <Sheet
        open={confirm === "wallet"}
        onClose={() => setConfirm(null)}
        title="Add to your wallet"
        description="Open your phone's wallet app to finish adding this card for contactless payments."
      >
        <div className="space-y-4">
          <Surface variant="sunken" className="p-4 text-sm leading-relaxed text-ink-500">
            Once added, you can pay with your phone anywhere contactless is accepted. The card
            number your phone uses is different from the one printed on your card.
          </Surface>
          <Button block size="lg" onClick={() => setConfirm(null)}>
            Got it
          </Button>
        </div>
      </Sheet>

      <PasscodeGate
        open={gate !== null}
        onClose={() => setGate(null)}
        onVerified={() => {
          if (gate === "reveal") setRevealed(true);
          if (gate === "freeze") toggleFreeze(card.id);
          if (gate === "replace") replaceCard(card.id);
        }}
        reason={
          gate === "reveal"
            ? "Confirm your passcode to show your full card details."
            : gate === "freeze"
              ? "Confirm your passcode to change your card's status."
              : "Confirm your passcode to order a replacement card."
        }
      />
    </div>
  );
}

function CopyRow({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-ink-400">{label}</p>
        <p className="tnum mt-0.5 truncate text-base font-semibold text-ink-900">{value}</p>
      </div>
      <button
        onClick={onCopy}
        aria-label={`Copy ${label}`}
        className="press flex h-9 items-center gap-1.5 rounded-md border border-line-strong bg-surface px-3 text-xs font-semibold text-ink-600 hover:bg-ink-25"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-pos-500" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
