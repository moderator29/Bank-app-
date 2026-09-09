"use client";

import * as React from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { IconTile } from "@/components/ui/surface";
import { Segmented } from "@/components/ui/segmented";
import { ListGroup, ListRow } from "@/components/ui/list";
import { EmptyState } from "@/components/shared/empty-state";
import { useShallow } from "zustand/react/shallow";
import { useBank } from "@/lib/store";
import { statementsForAccount } from "@/lib/selectors";
import { formatDate, maskDots } from "@/lib/utils";
import { periodLabel, taxDocuments } from "@/components/settings/documents";

export default function DocumentsPage() {
  const accounts = useBank((s) => s.accounts);
  const deposits = React.useMemo(
    () => accounts.filter((a) => a.kind !== "credit"),
    [accounts]
  );

  const [accountId, setAccountId] = React.useState<string>(deposits[0]?.id ?? "");
  const selected = deposits.find((a) => a.id === accountId) ?? deposits[0];
  const statements = useBank(
    useShallow((s) => statementsForAccount(s, selected?.id ?? ""))
  );
  const transactions = useBank((s) => s.transactions);
  const taxDocs = React.useMemo(() => taxDocuments(transactions), [transactions]);

  const years = React.useMemo(() => {
    const out: { year: string; items: typeof statements }[] = [];
    for (const st of statements) {
      const year = st.period.slice(0, 4);
      const last = out[out.length - 1];
      if (last && last.year === year) last.items.push(st);
      else out.push({ year, items: [st] });
    }
    return out;
  }, [statements]);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader
        title="Statements & documents"
        subtitle={
          selected
            ? `${selected.name} ${maskDots(selected.mask)}`
            : "Monthly statements and tax forms"
        }
        back="/profile"
      />

      {deposits.length > 1 && (
        <Segmented
          id="doc-account"
          className="mb-5"
          options={deposits.map((a) => ({ value: a.id, label: a.name.replace("Auremont ", "") }))}
          value={selected?.id ?? ""}
          onChange={setAccountId}
        />
      )}

      <div className="space-y-6">
        {years.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No statements yet"
            body="Your first statement is published on the first of the month after the account opens, and every month after that."
          />
        ) : (
          years.map((group) => (
            <ListGroup key={group.year} label={group.year}>
              {group.items.map((st) => (
                <ListRow
                  key={st.id}
                  icon={
                    <IconTile tone="neutral">
                      <FileText />
                    </IconTile>
                  }
                  title={periodLabel(st.period)}
                  detail={`Statement · issued ${formatDate(st.issuedAt, "medium")}`}
                  href={`/documents/${st.id}`}
                />
              ))}
            </ListGroup>
          ))
        )}

        <ListGroup label="Tax documents">
          {taxDocs.map((doc) => (
            <ListRow
              key={doc.id}
              icon={
                <IconTile tone="brass">
                  <FileSpreadsheet />
                </IconTile>
              }
              title={doc.title}
              detail={`Tax year ${doc.year} · issued ${formatDate(doc.issuedAt, "medium")}`}
              href={`/documents/${doc.id}`}
            />
          ))}
        </ListGroup>
      </div>

      <p className="mt-5 px-1 text-sm leading-relaxed text-ink-400">
        Statements are published on the first of each month and kept for seven years. Turn on
        email statements under Settings → Notifications to get a copy as soon as one is ready.
      </p>
    </div>
  );
}
