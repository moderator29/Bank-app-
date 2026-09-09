"use client";

import { useMemo } from "react";
import { useBank, type BankState } from "./store";
import * as select from "./selectors";
import type { Category } from "./types";

/**
 * Derived values must not be built inside a zustand selector: returning a
 * fresh array or object on every call makes `useSyncExternalStore` re-render
 * forever. Instead subscribe to the raw slices (whose identity only changes
 * when the data actually changes) and memoise the derivation against them.
 */
export function useDerived<T>(compute: (s: BankState) => T, deps: readonly unknown[]): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => compute(useBank.getState()), deps);
}

/* ---- stable slices ------------------------------------------------------ */

export const useTransactions = () => useBank((s) => s.transactions);
export const useAccounts = () => useBank((s) => s.accounts);
export const useBills = () => useBank((s) => s.bills);
export const useCards = () => useBank((s) => s.cards);
export const useSchedules = () => useBank((s) => s.scheduled);
export const useCancelledSubscriptions = () => useBank((s) => s.cancelledSubscriptions);
export const useBalanceHidden = () => useBank((s) => s.balanceHidden);

/* ---- derived views ------------------------------------------------------ */

export function useDepositAccounts() {
  const accounts = useAccounts();
  return useMemo(() => accounts.filter((a) => a.kind !== "credit"), [accounts]);
}

export function useAccountTransactions(accountId: string) {
  const transactions = useTransactions();
  return useMemo(
    () => transactions.filter((t) => t.accountId === accountId),
    [transactions, accountId]
  );
}

export function useCardsForAccount(accountId: string) {
  const cards = useCards();
  return useMemo(() => cards.filter((c) => c.accountId === accountId), [cards, accountId]);
}

export function useRecentTransactions(count: number) {
  const transactions = useTransactions();
  return useMemo(() => transactions.slice(0, count), [transactions, count]);
}

export function useStatements(accountId: string) {
  const statements = useBank((s) => s.statements);
  return useMemo(
    () =>
      statements
        .filter((st) => st.accountId === accountId)
        .sort((a, b) => b.period.localeCompare(a.period)),
    [statements, accountId]
  );
}

export function useMonthSummary(offset = 0, accountId?: string) {
  const transactions = useTransactions();
  return useDerived((s) => select.monthSummary(s, offset, accountId), [
    transactions,
    offset,
    accountId,
  ]);
}

export function useSpendByCategory(days = 30, accountId?: string) {
  const transactions = useTransactions();
  return useDerived((s) => select.spendByCategory(s, days, accountId), [
    transactions,
    days,
    accountId,
  ]);
}

export function useWindowFlow(days = 30, accountId?: string) {
  const transactions = useTransactions();
  return useDerived((s) => select.windowFlow(s, days, accountId), [
    transactions,
    days,
    accountId,
  ]);
}

export function useCashflowSeries(months = 6, accountId?: string) {
  const transactions = useTransactions();
  return useDerived((s) => select.cashflowSeries(s, months, accountId), [
    transactions,
    months,
    accountId,
  ]);
}

export function useBalanceSeries(accountId: string, months = 6) {
  const transactions = useTransactions();
  const accounts = useAccounts();
  return useDerived((s) => select.balanceSeries(s, accountId, months), [
    transactions,
    accounts,
    accountId,
    months,
  ]);
}

export function useUpcomingBills() {
  const bills = useBills();
  return useDerived(select.upcomingBills, [bills]);
}

export function usePaidBills() {
  const bills = useBills();
  return useDerived(select.paidBills, [bills]);
}

export function useActiveSchedules() {
  const scheduled = useSchedules();
  return useDerived(select.activeSchedules, [scheduled]);
}

export function useSubscriptions() {
  const transactions = useTransactions();
  const cancelled = useCancelledSubscriptions();
  return useDerived(select.subscriptions, [transactions, cancelled]);
}

export function useCategoryTransactions(category: Category, accountId?: string) {
  const transactions = useTransactions();
  return useMemo(
    () =>
      transactions.filter(
        (t) => t.category === category && (!accountId || t.accountId === accountId)
      ),
    [transactions, category, accountId]
  );
}

export function useFilteredTransactions(filters: select.TxFilters) {
  const transactions = useTransactions();
  const key = JSON.stringify(filters);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => select.filterTransactions(transactions, filters), [transactions, key]);
}

export function useGlobalSearch(query: string) {
  const transactions = useTransactions();
  const accounts = useAccounts();
  const cards = useCards();
  const bills = useBills();
  const payees = useBank((s) => s.payees);
  return useDerived((s) => select.globalSearch(s, query), [
    query,
    transactions,
    accounts,
    cards,
    bills,
    payees,
  ]);
}
