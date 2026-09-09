"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Check, CreditCard, Globe, Nfc, ShoppingCart } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Surface, IconTile } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { ListGroup, ListRow, Toggle } from "@/components/ui/list";
import { EmptyState } from "@/components/shared/empty-state";
import { PasscodeGate } from "@/components/ui/passcode-gate";
import { useBank } from "@/lib/store";
import { cardById } from "@/lib/selectors";
import { cn, money } from "@/lib/utils";

const DAILY_STEPS = [1_000, 2_500, 5_000, 10_000, 25_000];
const ATM_STEPS = [500, 1_000, 1_500, 2_500];

export default function CardLimitsPage() {
  const { id } = useParams<{ id: string }>();
  const card = useBank((s) => cardById(s, id));
  const setCardLimits = useBank((s) => s.setCardLimits);

  const [daily, setDaily] = React.useState(card?.limits.daily ?? 0);
  const [atm, setAtm] = React.useState(card?.limits.atm ?? 0);
  const [online, setOnline] = React.useState(card?.limits.online ?? true);
  const [intl, setIntl] = React.useState(card?.limits.international ?? true);
  const [contactless, setContactless] = React.useState(card?.limits.contactless ?? true);
  const [gate, setGate] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  if (!card) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title="Spending limits" back="/cards" />
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

  const dirty =
    daily !== card.limits.daily ||
    atm !== card.limits.atm ||
    online !== card.limits.online ||
    intl !== card.limits.international ||
    contactless !== card.limits.contactless;

  const save = () => {
    setCardLimits(card.id, { daily, atm, online, international: intl, contactless });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2600);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-4">
      <PageHeader
        title="Spending limits"
        subtitle={`${card.product} •••• ${card.mask}`}
        back={`/cards/${card.id}`}
      />

      <Surface className="p-5">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.09em] text-ink-400">
              Daily purchase limit
            </p>
            <p className="tnum mt-1.5 text-2xl font-semibold tracking-tight text-ink-900">
              {money(daily)}
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {DAILY_STEPS.map((step) => (
            <Step key={step} active={daily === step} onClick={() => setDaily(step)}>
              {money(step, { compact: true })}
            </Step>
          ))}
        </div>
      </Surface>

      <Surface className="p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.09em] text-ink-400">
          Daily ATM withdrawal limit
        </p>
        <p className="tnum mt-1.5 text-2xl font-semibold tracking-tight text-ink-900">
          {card.virtual ? "Not available" : money(atm)}
        </p>
        {card.virtual ? (
          <p className="mt-2 text-sm text-ink-400">
            Virtual cards can't be used at ATMs.
          </p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {ATM_STEPS.map((step) => (
              <Step key={step} active={atm === step} onClick={() => setAtm(step)}>
                {money(step, { compact: true })}
              </Step>
            ))}
          </div>
        )}
      </Surface>

      <ListGroup label="Where this card works">
        <ListRow
          icon={<IconTile tone="neutral"><ShoppingCart /></IconTile>}
          title="Online purchases"
          detail="Websites and in-app payments"
          value={<Toggle checked={online} onChange={setOnline} label="Online purchases" />}
          chevron={false}
        />
        <ListRow
          icon={<IconTile tone="neutral"><Globe /></IconTile>}
          title="International purchases"
          detail="Merchants outside the United States"
          value={<Toggle checked={intl} onChange={setIntl} label="International purchases" />}
          chevron={false}
        />
        <ListRow
          icon={<IconTile tone="neutral"><Nfc /></IconTile>}
          title="Contactless"
          detail="Tap to pay in person"
          value={
            <Toggle checked={contactless} onChange={setContactless} label="Contactless" />
          }
          chevron={false}
        />
      </ListGroup>

      <div className="sticky bottom-24 lg:bottom-6">
        {saved ? (
          <div className="flex items-center justify-center gap-2 rounded-md bg-pos-50 px-4 py-3.5 text-sm font-semibold text-pos-600">
            <Check className="h-4 w-4" />
            Limits updated
          </div>
        ) : (
          <Button block size="lg" disabled={!dirty} onClick={() => setGate(true)}>
            {dirty ? "Save limits" : "No changes to save"}
          </Button>
        )}
      </div>

      <PasscodeGate
        open={gate}
        onClose={() => setGate(false)}
        onVerified={save}
        reason="Confirm your passcode to change this card's limits."
      />
    </div>
  );
}

function Step({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "press tnum rounded-sm border px-3 py-2 text-sm font-semibold transition-colors",
        active
          ? "border-ink-900 bg-ink-900 text-action-fg"
          : "border-line-strong bg-surface text-ink-600 hover:border-ink-300"
      )}
    >
      {children}
    </button>
  );
}
