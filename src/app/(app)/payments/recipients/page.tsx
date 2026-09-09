"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Send, Star, Trash2, UserRound } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Surface, SectionHeader } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Field, Input } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { useBank } from "@/lib/store";
import { cn, relativeDay } from "@/lib/utils";

export default function RecipientsPage() {
  const payees = useBank((s) => s.payees);
  const addPayee = useBank((s) => s.addPayee);
  const removePayee = useBank((s) => s.removePayee);
  const toggleFavorite = useBank((s) => s.toggleFavoritePayee);

  const [tab, setTab] = React.useState<"person" | "biller">("person");
  const [addOpen, setAddOpen] = React.useState(false);
  const [removing, setRemoving] = React.useState<string | null>(null);
  const [name, setName] = React.useState("");
  const [detail, setDetail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const list = payees.filter((p) => p.kind === tab);
  const favorites = list.filter((p) => p.favorite);
  const rest = list.filter((p) => !p.favorite);
  const target = payees.find((p) => p.id === removing);

  const save = () => {
    if (name.trim().length < 2) return setError("Enter a name.");
    if (detail.trim().length < 4) return setError("Enter a phone number, email or account.");
    addPayee({ name: name.trim(), kind: tab, detail: detail.trim() });
    setName("");
    setDetail("");
    setError(null);
    setAddOpen(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-4">
      <PageHeader
        title="Recipients"
        subtitle="People and companies you can pay in one tap."
        back="/payments"
        action={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        }
      />

      <Segmented
        id="recipients-tab"
        value={tab}
        onChange={setTab}
        options={[
          { value: "person", label: "People" },
          { value: "biller", label: "Companies" },
        ]}
      />

      {list.length === 0 ? (
        <EmptyState
          icon={UserRound}
          title={`No ${tab === "person" ? "people" : "companies"} saved`}
          body="Add a recipient and they'll be here next time you need to pay them."
          action={<Button onClick={() => setAddOpen(true)}>Add a recipient</Button>}
        />
      ) : (
        <>
          {favorites.length > 0 && (
            <section>
              <SectionHeader title="Favourites" />
              <Surface className="divide-y divide-line overflow-hidden">
                {favorites.map((p) => (
                  <RecipientRow
                    key={p.id}
                    payee={p}
                    onFavorite={() => toggleFavorite(p.id)}
                    onRemove={() => setRemoving(p.id)}
                  />
                ))}
              </Surface>
            </section>
          )}
          {rest.length > 0 && (
            <section>
              <SectionHeader title={favorites.length ? "Everyone else" : "All recipients"} />
              <Surface className="divide-y divide-line overflow-hidden">
                {rest.map((p) => (
                  <RecipientRow
                    key={p.id}
                    payee={p}
                    onFavorite={() => toggleFavorite(p.id)}
                    onRemove={() => setRemoving(p.id)}
                  />
                ))}
              </Surface>
            </section>
          )}
        </>
      )}

      <Sheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title={`Add a ${tab === "person" ? "person" : "company"}`}
        description="Details are saved to your account only."
      >
        <div className="space-y-4">
          <Field label={tab === "person" ? "Full name" : "Company name"}>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder={tab === "person" ? "Taylor Reed" : "Xfinity"}
            />
          </Field>
          <Field
            label={tab === "person" ? "Phone, email or account" : "Account reference"}
            error={error}
          >
            <Input
              value={detail}
              onChange={(e) => {
                setDetail(e.target.value);
                setError(null);
              }}
              placeholder={tab === "person" ? "taylor@mailbox.com" : "Acct 5520-11"}
            />
          </Field>
          <Button block size="lg" onClick={save}>
            Save recipient
          </Button>
        </div>
      </Sheet>

      <Sheet
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        title="Remove this recipient?"
        description={
          target
            ? `${target.name} will be removed from your saved recipients. Past payments stay in your activity.`
            : ""
        }
      >
        <div className="flex gap-2.5">
          <Button variant="secondary" size="lg" className="flex-1" onClick={() => setRemoving(null)}>
            Keep
          </Button>
          <Button
            variant="danger"
            size="lg"
            className="flex-1"
            onClick={() => {
              if (removing) removePayee(removing);
              setRemoving(null);
            }}
          >
            Remove
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

function RecipientRow({
  payee,
  onFavorite,
  onRemove,
}: {
  payee: { id: string; name: string; detail: string; favorite?: boolean; lastSentAt?: string };
  onFavorite: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Avatar name={payee.name} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-medium text-ink-900">{payee.name}</p>
        <p className="mt-0.5 truncate text-sm text-ink-400">
          {payee.detail}
          {payee.lastSentAt && ` · last paid ${relativeDay(payee.lastSentAt)}`}
        </p>
      </div>
      <button
        onClick={onFavorite}
        aria-label={payee.favorite ? `Unfavourite ${payee.name}` : `Favourite ${payee.name}`}
        aria-pressed={Boolean(payee.favorite)}
        className="press flex h-9 w-9 items-center justify-center rounded-sm text-ink-300 hover:bg-ink-50"
      >
        <Star
          className={cn("h-4 w-4", payee.favorite && "fill-brass-400 text-brass-500")}
        />
      </button>
      <Link
        href={`/payments/send?payee=${payee.id}`}
        aria-label={`Send money to ${payee.name}`}
        className="press flex h-9 w-9 items-center justify-center rounded-sm text-ink-500 hover:bg-ink-50 hover:text-ink-900"
      >
        <Send className="h-4 w-4" />
      </Link>
      <button
        onClick={onRemove}
        aria-label={`Remove ${payee.name}`}
        className="press flex h-9 w-9 items-center justify-center rounded-sm text-ink-400 hover:bg-neg-50 hover:text-neg-500"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
