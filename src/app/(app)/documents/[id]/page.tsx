"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Check, Download, FileText } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Surface } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Skeleton, ListSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Wordmark } from "@/components/brand/logo";
import { TransactionList } from "@/components/activity/transaction-list";
import { useBank } from "@/lib/store";
import type { Statement } from "@/lib/types";
import { formatDate, maskDots, money } from "@/lib/utils";
import { periodLabel, taxDocumentById } from "@/components/settings/documents";

export default function DocumentViewerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const statement = useBank((s) => s.statements.find((st) => st.id === id));
  const accounts = useBank((s) => s.accounts);
  const transactions = useBank((s) => s.transactions);
  const balanceHidden = useBank((s) => s.balanceHidden);

  const taxDoc = React.useMemo(
    () => (id.startsWith("tax-") ? taxDocumentById(transactions, id) : undefined),
    [transactions, id]
  );

  const [ready, setReady] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 260);
    return () => window.clearTimeout(t);
  }, [id]);

  const account = accounts.find((a) => a.id === statement?.accountId);
  const monthTx = React.useMemo(() => {
    if (!statement) return [];
    return transactions
      .filter((t) => t.accountId === statement.accountId && t.date.startsWith(statement.period))
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [transactions, statement]);

  if (!statement && !taxDoc) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <PageHeader title="Document" back="/documents" />
        <EmptyState
          icon={FileText}
          title="We couldn't open that document"
          body="It may have been superseded by a newer version. Everything available is listed under Statements & documents."
          action={
            <Button variant="secondary" onClick={() => router.push("/documents")}>
              Back to documents
            </Button>
          }
        />
      </div>
    );
  }

  const title = statement ? periodLabel(statement.period) : (taxDoc?.title ?? "Document");

  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader
        title={title}
        subtitle={
          statement
            ? `${account?.name ?? "Account"} · issued ${formatDate(statement.issuedAt, "medium")}`
            : `Issued ${taxDoc ? formatDate(taxDoc.issuedAt, "medium") : ""}`
        }
        back="/documents"
        action={
          <Button variant="secondary" size="sm" onClick={() => setSaved(true)}>
            <Download className="h-4 w-4" />
            Download
          </Button>
        }
      />

      {!ready ? (
        <div className="space-y-4">
          <Surface className="space-y-3 p-6">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </Surface>
          <ListSkeleton rows={4} />
        </div>
      ) : statement ? (
        <StatementDocument
          statement={statement}
          accountName={account?.name ?? "Account"}
          mask={account?.mask ?? ""}
          transactionCount={monthTx.length}
        />
      ) : taxDoc ? (
        <Surface index={0} className="p-6 sm:p-8">
          <DocumentHead right="Form 1099-INT" sub={`Tax year ${taxDoc.year}`} />
          <Rule />
          <div className="grid gap-5 sm:grid-cols-2">
            <Block label="Payer">
              <p className="text-base font-semibold text-ink-900">Auremont Bank, N.A.</p>
              <p className="mt-0.5 text-sm text-ink-400">
                200 Trade Street, Charlotte, NC 28202
              </p>
              <p className="mt-0.5 text-sm text-ink-400">Payer&apos;s TIN ••-•••4180</p>
            </Block>
            <Block label="Recipient">
              <RecipientLines />
            </Block>
          </div>
          <Rule />
          <div className="grid gap-2 sm:grid-cols-2">
            <Figure label="Box 1 · Interest income" value={money(taxDoc.interest)} strong />
            <Figure label="Box 4 · Federal tax withheld" value={money(0)} />
          </div>
          <Rule />
          <p className="text-sm leading-relaxed text-ink-400">
            {taxDoc.description}. This copy is furnished to you for your records; the same
            figures have been reported to the Internal Revenue Service. Keep it with your tax
            papers for the {taxDoc.year} filing year.
          </p>
        </Surface>
      ) : null}

      {ready && statement && (
        <section className="mt-6">
          <h2 className="mb-2 px-1 text-[13px] font-semibold uppercase tracking-[0.09em] text-ink-400">
            Transactions in this period
          </h2>
          {monthTx.length > 0 ? (
            <TransactionList transactions={monthTx} hidden={balanceHidden} />
          ) : (
            <Surface className="px-5 py-8 text-center">
              <p className="text-base font-medium text-ink-900">
                No transactions were posted in this period
              </p>
              <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-ink-400">
                The opening and closing balances above are unchanged. Interest and fees, where
                they apply, are shown in the summary.
              </p>
            </Surface>
          )}
        </section>
      )}

      <Sheet
        open={saved}
        onClose={() => setSaved(false)}
        title={statement ? "Statement saved" : "Document saved"}
        description={`${title} has been saved to your device's documents folder.`}
      >
        <div className="pt-1">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pos-50 text-pos-500">
              <Check className="h-[18px] w-[18px]" />
            </span>
            <p className="text-sm leading-relaxed text-ink-500">
              You can reopen it here at any time. Statements and tax documents stay available
              for seven years.
            </p>
          </div>
          <Button block className="mt-4" onClick={() => setSaved(false)}>
            Done
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function StatementDocument({
  statement,
  accountName,
  mask,
  transactionCount,
}: {
  statement: Statement;
  accountName: string;
  mask: string;
  transactionCount: number;
}) {
  const [year, month] = statement.period.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  const net = statement.moneyIn - statement.moneyOut;

  return (
    <Surface index={0} className="p-6 sm:p-8">
      <DocumentHead right="Account statement" sub={periodLabel(statement.period)} />
      <Rule />

      <div className="grid gap-5 sm:grid-cols-2">
        <Block label="Account">
          <p className="text-base font-semibold text-ink-900">{accountName}</p>
          <p className="mask-dots mt-0.5 text-sm text-ink-400">{maskDots(mask)}</p>
        </Block>
        <Block label="Statement period">
          <p className="text-base font-semibold text-ink-900">
            {formatDate(start.toISOString(), "short")} – {formatDate(end.toISOString(), "medium")}
          </p>
          <p className="mt-0.5 text-sm text-ink-400">
            Issued {formatDate(statement.issuedAt, "medium")}
          </p>
        </Block>
      </div>

      <Rule />

      <div className="grid grid-cols-2 gap-2">
        <Figure label="Opening balance" value={money(statement.openingBalance)} />
        <Figure label="Closing balance" value={money(statement.closingBalance)} strong />
        <Figure label="Money in" value={money(statement.moneyIn)} tone="pos" />
        <Figure label="Money out" value={money(statement.moneyOut)} />
      </div>

      <Rule />

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm text-ink-400">
          {transactionCount} transaction{transactionCount === 1 ? "" : "s"} in this period
        </span>
        <span className="text-sm text-ink-500">
          Net movement{" "}
          <span className="tnum font-semibold text-ink-900">
            {net >= 0 ? "+" : "−"}
            {money(Math.abs(net))}
          </span>
        </span>
      </div>

      <p className="mt-4 text-2xs leading-relaxed text-ink-300">
        Auremont Bank, N.A. · Member FDIC · Equal Housing Lender. Please review this statement
        and report anything you do not recognise within 60 days.
      </p>
    </Surface>
  );
}

function DocumentHead({ right, sub }: { right: string; sub: string }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <Wordmark />
      <div className="text-right">
        <p className="text-sm font-semibold text-ink-900">{right}</p>
        <p className="mt-0.5 text-sm text-ink-400">{sub}</p>
      </div>
    </div>
  );
}

function RecipientLines() {
  const user = useBank((s) => s.user);
  return (
    <>
      <p className="text-base font-semibold text-ink-900">{user.name}</p>
      <p className="mt-0.5 text-sm text-ink-400">{user.street}</p>
      <p className="mt-0.5 text-sm text-ink-400">{user.city}</p>
    </>
  );
}

const Rule = () => <div className="my-5 border-t border-line" />;

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-2xs font-semibold uppercase tracking-[0.09em] text-ink-400">
        {label}
      </p>
      {children}
    </div>
  );
}

function Figure({
  label,
  value,
  strong,
  tone,
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: "pos";
}) {
  return (
    <div className="rounded-lg bg-surface-sunken px-3.5 py-3">
      <p className="truncate text-2xs font-semibold uppercase tracking-[0.09em] text-ink-400">
        {label}
      </p>
      <p
        className={
          tone === "pos"
            ? "tnum mt-1 text-lg font-semibold text-pos-500"
            : strong
              ? "tnum mt-1 text-lg font-semibold text-ink-900"
              : "tnum mt-1 text-lg font-medium text-ink-800"
        }
      >
        {value}
      </p>
    </div>
  );
}
