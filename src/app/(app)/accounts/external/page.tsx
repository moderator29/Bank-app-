"use client";

import * as React from "react";
import Link from "next/link";
import { Building2, Link2, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Surface, Chip, IconTile, SectionHeader } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Field, Input } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { EmptyState } from "@/components/shared/empty-state";
import { useBank } from "@/lib/store";
import { formatDate } from "@/lib/utils";

const INSTITUTIONS = [
  "Chase",
  "Bank of America",
  "Wells Fargo",
  "Capital One",
  "Citi",
  "US Bank",
];

export default function ExternalAccountsPage() {
  const external = useBank((s) => s.externalAccounts);
  const add = useBank((s) => s.addExternalAccount);
  const remove = useBank((s) => s.removeExternalAccount);

  const [addOpen, setAddOpen] = React.useState(false);
  const [removing, setRemoving] = React.useState<string | null>(null);
  const [institution, setInstitution] = React.useState(INSTITUTIONS[0]);
  const [nickname, setNickname] = React.useState("");
  const [mask, setMask] = React.useState("");
  const [kind, setKind] = React.useState<"checking" | "savings">("checking");
  const [error, setError] = React.useState<string | null>(null);
  const [linked, setLinked] = React.useState(false);

  const target = external.find((x) => x.id === removing);

  const submit = () => {
    if (!/^\d{4}$/.test(mask)) {
      setError("Enter the last four digits of the account.");
      return;
    }
    add({
      institution,
      nickname: nickname.trim() || `${institution} ${kind === "checking" ? "Checking" : "Savings"}`,
      mask,
      kind,
      status: "pending",
    });
    setError(null);
    setLinked(true);
  };

  const closeAdd = () => {
    setAddOpen(false);
    setLinked(false);
    setNickname("");
    setMask("");
    setError(null);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-4">
      <PageHeader
        title="Linked banks"
        subtitle="Move money between Auremont and your accounts elsewhere."
        back="/accounts"
        action={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Link bank
          </Button>
        }
      />

      {external.length === 0 ? (
        <EmptyState
          icon={Link2}
          title="No banks linked yet"
          body="Link an account at another bank to move money in and out of Auremont."
          action={<Button onClick={() => setAddOpen(true)}>Link a bank</Button>}
        />
      ) : (
        <section>
          <SectionHeader title={`${external.length} linked`} />
          <Surface className="divide-y divide-line overflow-hidden">
            {external.map((x) => (
              <div key={x.id} className="flex items-center gap-3 px-4 py-3.5">
                <IconTile tone="neutral">
                  <Building2 />
                </IconTile>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-medium text-ink-900">{x.nickname}</p>
                  <p className="mask-dots mt-0.5 truncate text-sm text-ink-400">
                    {x.institution} · •••• {x.mask} · linked {formatDate(x.linkedAt, "short")}
                  </p>
                </div>
                <Chip tone={x.status === "linked" ? "pos" : "warn"}>
                  {x.status === "linked" ? "Linked" : "Verifying"}
                </Chip>
                <button
                  onClick={() => setRemoving(x.id)}
                  aria-label={`Remove ${x.nickname}`}
                  className="press flex h-9 w-9 items-center justify-center rounded-sm text-ink-400 hover:bg-neg-50 hover:text-neg-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </Surface>
          <p className="mt-3 px-1 text-xs leading-relaxed text-ink-400">
            Newly linked accounts are verified with two small deposits, which usually appear
            within one business day.
          </p>
        </section>
      )}

      <Surface variant="sunken" className="p-5">
        <h2 className="text-base font-semibold tracking-tight text-ink-900">
          What you can do with a linked bank
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-ink-500">
          <li>· Pull money into Auremont from an outside account</li>
          <li>· Send money out to an account in your name</li>
          <li>· Keep a savings buffer elsewhere without leaving the app</li>
        </ul>
        <Link href="/deposit/transfer" className="mt-4 block">
          <Button variant="secondary" block>
            Transfer from a linked bank
          </Button>
        </Link>
      </Surface>

      <Sheet
        open={addOpen}
        onClose={closeAdd}
        title={linked ? "Bank linked" : "Link a bank"}
        description={
          linked
            ? "We'll confirm the account once the verification deposits clear."
            : "Enter the account you'd like to connect."
        }
      >
        {linked ? (
          <div className="space-y-4">
            <Surface variant="sunken" className="p-4 text-sm leading-relaxed text-ink-500">
              Two deposits of less than $1.00 are on their way to {institution} ••••{mask}. Once
              they land, confirm the amounts here to finish verifying the account.
            </Surface>
            <Button block size="lg" onClick={closeAdd}>
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Field label="Institution">
              <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 py-0.5">
                {INSTITUTIONS.map((name) => (
                  <button
                    key={name}
                    onClick={() => setInstitution(name)}
                    aria-pressed={institution === name}
                    className={`press shrink-0 rounded-sm border px-3 py-2 text-xs font-semibold ${
                      institution === name
                        ? "border-ink-900 bg-ink-900 text-action-fg"
                        : "border-line-strong bg-surface text-ink-500 hover:border-ink-300"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Account type">
              <Segmented
                id="ext-kind"
                value={kind}
                onChange={setKind}
                options={[
                  { value: "checking", label: "Checking" },
                  { value: "savings", label: "Savings" },
                ]}
              />
            </Field>

            <Field label="Last four digits" error={error}>
              <Input
                inputMode="numeric"
                maxLength={4}
                placeholder="0000"
                value={mask}
                onChange={(e) => {
                  setMask(e.target.value.replace(/\D/g, "").slice(0, 4));
                  setError(null);
                }}
              />
            </Field>

            <Field label="Nickname" hint="Optional — helps you tell accounts apart.">
              <Input
                placeholder={`${institution} ${kind === "checking" ? "Checking" : "Savings"}`}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </Field>

            <Button block size="lg" onClick={submit}>
              Link account
            </Button>
          </div>
        )}
      </Sheet>

      <Sheet
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        title="Remove this bank?"
        description={
          target
            ? `${target.nickname} (•••• ${target.mask}) will be unlinked. Scheduled transfers using it will stop.`
            : ""
        }
      >
        <div className="flex gap-2.5">
          <Button variant="secondary" size="lg" className="flex-1" onClick={() => setRemoving(null)}>
            Keep it
          </Button>
          <Button
            variant="danger"
            size="lg"
            className="flex-1"
            onClick={() => {
              if (removing) remove(removing);
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
