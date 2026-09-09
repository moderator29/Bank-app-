import type { Transaction } from "@/lib/types";
import { round2 } from "@/lib/utils";

/** "2026-09" → "September 2026". */
export function periodLabel(period: string) {
  const [year, month] = period.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export interface TaxDocument {
  id: string;
  year: number;
  title: string;
  form: string;
  description: string;
  issuedAt: string;
  /** Box 1 — interest income reported for the year. */
  interest: number;
}

/**
 * Year-end interest reporting, annualised from the interest credits on the
 * ledger so the forms and the account history never disagree.
 */
export function taxDocuments(transactions: Transaction[]): TaxDocument[] {
  const credits = transactions
    .filter((t) => t.amount > 0 && /interest/i.test(t.merchant))
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));

  const latest = credits[0]?.amount ?? 0;
  const prior = credits[1]?.amount ?? latest;
  const thisYear = new Date().getFullYear();

  return [
    { year: thisYear - 1, monthly: latest },
    { year: thisYear - 2, monthly: prior },
  ].map(({ year, monthly }) => ({
    id: `tax-1099int-${year}`,
    year,
    title: `Form 1099-INT · ${year}`,
    form: "Form 1099-INT",
    description: "Interest income reported to the IRS",
    issuedAt: new Date(year + 1, 0, 31).toISOString(),
    interest: round2(monthly * 12),
  }));
}

export const taxDocumentById = (transactions: Transaction[], id: string) =>
  taxDocuments(transactions).find((d) => d.id === id);
