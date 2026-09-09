import type {
  Bill,
  Category,
  Transaction,
} from "./types";
import type { BankState } from "./store";
import { CHECKING_ID } from "./seed";
import { relativeDay, round2 } from "./utils";

/* ==========================================================================
   Derived views. Nothing here is stored — every figure in the UI is
   calculated from the same accounts and transactions, so totals can never
   contradict each other.
   ========================================================================== */

export const accountById = (s: BankState, id: string) =>
  s.accounts.find((a) => a.id === id);

export const primaryAccount = (s: BankState) =>
  s.accounts.find((a) => a.id === CHECKING_ID) ?? s.accounts[0];

export const depositAccounts = (s: BankState) => s.accounts.filter((a) => a.kind !== "credit");

export const cardById = (s: BankState, id: string) => s.cards.find((c) => c.id === id);

export const cardsForAccount = (s: BankState, id: string) =>
  s.cards.filter((c) => c.accountId === id);

export const txForAccount = (s: BankState, id: string) =>
  s.transactions.filter((t) => t.accountId === id);

export const txById = (s: BankState, id: string) => s.transactions.find((t) => t.id === id);

export const unreadCount = (s: BankState) => s.notifications.filter((n) => !n.read).length;

export const totalDeposits = (s: BankState) =>
  round2(s.accounts.filter((a) => a.kind !== "credit").reduce((sum, a) => sum + a.balance, 0));

export const creditOwed = (s: BankState) =>
  round2(s.accounts.filter((a) => a.kind === "credit").reduce((sum, a) => sum + a.balance, 0));

export const netPosition = (s: BankState) => round2(totalDeposits(s) - creditOwed(s));

/* ------------------------------- flows ---------------------------------- */

export function windowFlow(s: BankState, days = 30, accountId?: string) {
  const since = Date.now() - days * 86_400_000;
  let inflow = 0;
  let outflow = 0;
  for (const t of s.transactions) {
    if (accountId && t.accountId !== accountId) continue;
    if (+new Date(t.date) < since) continue;
    if (t.amount > 0) inflow += t.amount;
    else outflow += -t.amount;
  }
  return { inflow: round2(inflow), outflow: round2(outflow), net: round2(inflow - outflow) };
}

export function spendByCategory(s: BankState, days = 30, accountId?: string) {
  const since = Date.now() - days * 86_400_000;
  const totals = new Map<Category, number>();
  for (const t of s.transactions) {
    if (accountId && t.accountId !== accountId) continue;
    if (t.amount >= 0 || t.category === "transfer") continue;
    if (+new Date(t.date) < since) continue;
    totals.set(t.category, round2((totals.get(t.category) ?? 0) + -t.amount));
  }
  const rows = [...totals.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
  const sum = round2(rows.reduce((n, r) => n + r.total, 0));
  return { rows, total: sum };
}

/** Calendar-month summary; offset 0 = this month, 1 = last month. */
export function monthSummary(s: BankState, offset = 0, accountId?: string) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 1);
  let income = 0;
  let spending = 0;
  let transfers = 0;
  let bills = 0;
  let subscriptions = 0;

  for (const t of s.transactions) {
    if (accountId && t.accountId !== accountId) continue;
    const at = new Date(t.date);
    if (at < start || at >= end) continue;
    if (t.category === "transfer") {
      transfers += Math.abs(t.amount);
      continue;
    }
    if (t.amount > 0) income += t.amount;
    else {
      spending += -t.amount;
      if (t.category === "bills" || t.category === "housing") bills += -t.amount;
      if (t.category === "subscriptions") subscriptions += -t.amount;
    }
  }

  return {
    label: start.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    monthShort: start.toLocaleDateString("en-US", { month: "short" }),
    income: round2(income),
    spending: round2(spending),
    transfers: round2(transfers),
    bills: round2(bills),
    subscriptions: round2(subscriptions),
    net: round2(income - spending),
  };
}

/** Rolling months of in/out — the cash-flow chart. */
export function cashflowSeries(s: BankState, months = 6, accountId?: string) {
  return Array.from({ length: months }, (_, i) => months - 1 - i)
    .map((offset) => {
      const m = monthSummary(s, offset, accountId);
      return { month: m.monthShort, inflow: m.income, outflow: m.spending, net: m.net };
    });
}

/**
 * Month-end balances walked backwards from today's real balance, so the
 * chart and the headline balance can never disagree.
 */
export function balanceSeries(s: BankState, accountId: string, months = 6) {
  const account = accountById(s, accountId);
  if (!account) return [];
  const txs = txForAccount(s, accountId);
  const now = new Date();
  const points: { month: string; value: number }[] = [];
  let running = account.balance;
  let cursor = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  for (let i = 0; i < months; i += 1) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    points.unshift({
      month: monthStart.toLocaleDateString("en-US", { month: "short" }),
      value: round2(running),
    });
    // Unwind this month's movements to reach the previous month's close.
    for (const t of txs) {
      const at = new Date(t.date);
      if (at >= monthStart && at < cursor) running -= t.amount;
    }
    cursor = monthStart;
  }
  return points;
}

/* --------------------------- subscriptions ------------------------------- */

export interface Subscription {
  merchant: string;
  amount: number;
  category: Category;
  occurrences: number;
  lastChargedAt: string;
  nextChargeAt: string;
  cancelled: boolean;
}

/**
 * Recurring merchants inferred from the ledger — a merchant that has charged
 * a subscription or bill more than once is treated as recurring.
 */
export function subscriptions(s: BankState): Subscription[] {
  const groups = new Map<string, Transaction[]>();
  for (const t of s.transactions) {
    if (t.amount >= 0) continue;
    if (t.category !== "subscriptions" && t.category !== "bills" && t.category !== "housing")
      continue;
    groups.set(t.merchant, [...(groups.get(t.merchant) ?? []), t]);
  }

  return [...groups.entries()]
    .map(([merchant, txs]) => {
      const sorted = [...txs].sort((a, b) => +new Date(b.date) - +new Date(a.date));
      const last = sorted[0];
      const next = new Date(last.date);
      next.setMonth(next.getMonth() + 1);
      return {
        merchant,
        amount: Math.abs(last.amount),
        category: last.category,
        occurrences: sorted.length,
        lastChargedAt: last.date,
        nextChargeAt: next.toISOString(),
        cancelled: s.cancelledSubscriptions.includes(merchant),
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

export const monthlyRecurringTotal = (s: BankState) =>
  round2(
    subscriptions(s)
      .filter((x) => !x.cancelled)
      .reduce((n, x) => n + x.amount, 0)
  );

/* ------------------------------- bills ---------------------------------- */

export const upcomingBills = (s: BankState) =>
  [...s.bills]
    .filter((b) => b.status !== "paid")
    .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate));

export const paidBills = (s: BankState) => s.bills.filter((b) => b.status === "paid");

export const billTotalDue = (bills: Bill[]) => round2(bills.reduce((n, b) => n + b.amount, 0));

export const activeSchedules = (s: BankState) =>
  [...s.scheduled]
    .filter((p) => p.active)
    .sort((a, b) => +new Date(a.nextDate) - +new Date(b.nextDate));

export const nextPayday = (s: BankState) => {
  const last = s.transactions.find((t) => t.category === "income" && t.amount > 0);
  if (!last) return null;
  const d = new Date(last.date);
  d.setDate(d.getDate() + 7);
  return d.toISOString();
};

export const statementsForAccount = (s: BankState, accountId: string) =>
  s.statements
    .filter((st) => st.accountId === accountId)
    .sort((a, b) => b.period.localeCompare(a.period));

/* ------------------------- activity list helpers ------------------------- */

export interface TxFilters {
  query?: string;
  direction?: "all" | "in" | "out";
  categories?: Category[];
  accountId?: string;
  from?: string;
  to?: string;
  min?: number;
  max?: number;
  method?: "all" | "card" | "ach" | "internal";
}

export function filterTransactions(txs: Transaction[], f: TxFilters) {
  const q = f.query?.trim().toLowerCase();
  return txs.filter((t) => {
    if (f.accountId && t.accountId !== f.accountId) return false;
    if (f.direction === "in" && t.amount <= 0) return false;
    if (f.direction === "out" && t.amount >= 0) return false;
    if (f.categories?.length && !f.categories.includes(t.category)) return false;
    if (f.from && +new Date(t.date) < +new Date(f.from)) return false;
    if (f.to && +new Date(t.date) > +new Date(f.to) + 86_399_000) return false;
    const abs = Math.abs(t.amount);
    if (f.min !== undefined && abs < f.min) return false;
    if (f.max !== undefined && abs > f.max) return false;
    if (f.method && f.method !== "all") {
      const m = t.method.toLowerCase();
      if (f.method === "card" && !m.includes("card")) return false;
      if (f.method === "ach" && !m.includes("ach")) return false;
      if (f.method === "internal" && !m.includes("internal")) return false;
    }
    if (q) {
      const haystack = `${t.merchant} ${t.method} ${t.category} ${t.note ?? ""} ${t.reference}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export function groupByDay(txs: Transaction[]) {
  const groups: { label: string; items: Transaction[] }[] = [];
  for (const t of txs) {
    const label = relativeDay(t.date);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(t);
    else groups.push({ label, items: [t] });
  }
  return groups;
}

/* ------------------------------ search ---------------------------------- */

export interface SearchHit {
  group: "Transactions" | "Accounts" | "Cards" | "Recipients" | "Bills" | "Settings" | "Help";
  title: string;
  detail: string;
  href: string;
  amount?: number;
}

const DESTINATIONS: { title: string; detail: string; href: string; keywords: string }[] = [
  { title: "Card controls", detail: "Freeze, limits and contactless", href: "/cards", keywords: "card freeze limit contactless atm virtual" },
  { title: "Spending insights", detail: "Categories, cash flow and trends", href: "/insights", keywords: "insights spending analytics chart budget category" },
  { title: "Statements & documents", detail: "Monthly statements and tax forms", href: "/documents", keywords: "statement document tax pdf download" },
  { title: "Security centre", detail: "Passcode, devices and sign-in activity", href: "/security", keywords: "security passcode password device two factor biometric face id" },
  { title: "Notification settings", detail: "Choose what we alert you about", href: "/settings/notifications", keywords: "notification alert push email" },
  { title: "Appearance", detail: "Light, dark or system", href: "/settings/appearance", keywords: "appearance theme dark light mode" },
  { title: "Privacy", detail: "Balance visibility and data controls", href: "/settings/privacy", keywords: "privacy hide balance data analytics marketing" },
  { title: "Scheduled payments", detail: "Autopay and recurring transfers", href: "/payments/scheduled", keywords: "scheduled recurring autopay upcoming payment" },
  { title: "Linked accounts", detail: "External banks you've connected", href: "/accounts/external", keywords: "external linked chase bank of america wells fargo capital one" },
  { title: "Add money", detail: "Deposit a check or move money in", href: "/deposit", keywords: "deposit add money check direct deposit" },
];

const HELP: { title: string; detail: string; href: string; keywords: string }[] = [
  { title: "How do I freeze my card?", detail: "Cards & payments", href: "/support/cards", keywords: "freeze card lost stolen" },
  { title: "When do transfers arrive?", detail: "Transfers", href: "/support/transfers", keywords: "transfer arrive time ach external" },
  { title: "Setting up direct deposit", detail: "Deposits", href: "/support/deposits", keywords: "direct deposit payroll employer routing" },
  { title: "Keeping your account secure", detail: "Security", href: "/support/security", keywords: "secure security fraud phishing passcode" },
];

export function globalSearch(s: BankState, raw: string): SearchHit[] {
  const q = raw.trim().toLowerCase();
  if (q.length < 2) return [];
  const hits: SearchHit[] = [];

  for (const a of s.accounts) {
    if (`${a.name} ${a.mask} ${a.kind}`.toLowerCase().includes(q))
      hits.push({
        group: "Accounts",
        title: a.name,
        detail: `•••• ${a.mask}`,
        href: `/accounts/${a.id}`,
        amount: a.balance,
      });
  }

  for (const c of s.cards) {
    if (`${c.product} ${c.mask} ${c.kind} card`.toLowerCase().includes(q))
      hits.push({
        group: "Cards",
        title: c.product,
        detail: `•••• ${c.mask}${c.frozen ? " · Frozen" : ""}`,
        href: `/cards/${c.id}`,
      });
  }

  for (const p of s.payees) {
    if (`${p.name} ${p.detail}`.toLowerCase().includes(q))
      hits.push({
        group: "Recipients",
        title: p.name,
        detail: p.detail,
        href: `/payments/send?payee=${p.id}`,
      });
  }

  for (const b of s.bills) {
    if (`${b.name} ${b.service}`.toLowerCase().includes(q))
      hits.push({
        group: "Bills",
        title: b.name,
        detail: b.service,
        href: `/payments/bills/${b.id}`,
        amount: -b.amount,
      });
  }

  for (const d of DESTINATIONS) {
    if (`${d.title} ${d.keywords}`.toLowerCase().includes(q))
      hits.push({ group: "Settings", title: d.title, detail: d.detail, href: d.href });
  }

  for (const h of HELP) {
    if (`${h.title} ${h.keywords}`.toLowerCase().includes(q))
      hits.push({ group: "Help", title: h.title, detail: h.detail, href: h.href });
  }

  const matches = filterTransactions(s.transactions, { query: q }).slice(0, 24);
  for (const t of matches) {
    hits.push({
      group: "Transactions",
      title: t.merchant,
      detail: `${relativeDay(t.date)} · ${t.method}`,
      href: `/activity/${t.id}`,
      amount: t.amount,
    });
  }

  return hits;
}
