"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Account,
  AppNotification,
  AuthStage,
  Bill,
  Card,
  CardLimits,
  Category,
  Device,
  ExternalAccount,
  LoginEvent,
  Payee,
  Preferences,
  ScheduledPayment,
  Statement,
  SupportThread,
  ThemeChoice,
  Transaction,
  TxStatus,
  User,
} from "./types";
import {
  AUTH_EMAIL,
  AUTH_PASSCODE,
  AUTH_PASSWORD,
  CHECKING_ID,
  CREDIT_ID,
  DEFAULT_PREFERENCES,
  DEMO_USER,
  SAVINGS_ID,
  seedAccounts,
  seedBills,
  seedCards,
  seedDevices,
  seedExternalAccounts,
  seedLoginEvents,
  seedNotifications,
  seedPayees,
  seedScheduled,
  seedStatements,
  seedSupportThreads,
  seedTransactions,
} from "./seed";
import { money, round2, uid } from "./utils";

/** Everything a fresh, fully-provisioned account starts with. */
const provision = () => ({
  user: DEMO_USER,
  accounts: seedAccounts(),
  transactions: seedTransactions(),
  cards: seedCards(DEMO_USER.name),
  payees: seedPayees(),
  bills: seedBills(),
  scheduled: seedScheduled(),
  externalAccounts: seedExternalAccounts(),
  notifications: seedNotifications(),
  devices: seedDevices(),
  loginEvents: seedLoginEvents(),
  supportThreads: seedSupportThreads(),
  statements: seedStatements(),
  cancelledSubscriptions: [] as string[],
  passcode: AUTH_PASSCODE,
});

export interface Movement {
  accountId: string;
  merchant: string;
  amount: number;
  category: Category;
  method: string;
  note?: string;
  status?: TxStatus;
}

export interface BankState {
  /* ---------------- session ---------------- */
  authStage: AuthStage;
  rememberDevice: boolean;
  hydrated: boolean;
  passcode: string;
  onboarded: boolean;

  /* ---------------- data ---------------- */
  user: User;
  accounts: Account[];
  transactions: Transaction[];
  cards: Card[];
  payees: Payee[];
  bills: Bill[];
  scheduled: ScheduledPayment[];
  externalAccounts: ExternalAccount[];
  notifications: AppNotification[];
  devices: Device[];
  loginEvents: LoginEvent[];
  supportThreads: SupportThread[];
  statements: Statement[];
  cancelledSubscriptions: string[];

  /* ---------------- preferences ---------------- */
  preferences: Preferences;
  balanceHidden: boolean;

  /* ---------------- session actions ---------------- */
  signIn: (email: string, password: string) => boolean;
  verifyPasscode: (code: string) => boolean;
  /** Confirms identity for a sensitive action without changing session state. */
  checkPasscode: (code: string) => boolean;
  changePasscode: (next: string) => void;
  lock: () => void;
  signOut: () => void;
  setRememberDevice: (v: boolean) => void;
  completeOnboarding: () => void;

  /* ---------------- money ---------------- */
  post: (movements: Movement[]) => Transaction[];
  transfer: (fromId: string, toId: string, amount: number, note?: string) => void;
  transferExternal: (fromId: string, externalId: string, amount: number, note?: string) => void;
  sendMoney: (payeeId: string, fromId: string, amount: number, note?: string) => void;
  payBill: (billId: string, fromId: string) => void;
  depositCheck: (toId: string, amount: number) => void;
  depositFromExternal: (externalId: string, toId: string, amount: number) => void;

  /* ---------------- recipients, bills, schedules ---------------- */
  addPayee: (p: Omit<Payee, "id">) => Payee;
  removePayee: (id: string) => void;
  toggleFavoritePayee: (id: string) => void;
  toggleAutopay: (billId: string) => void;
  setBillAccount: (billId: string, accountId: string) => void;
  addBill: (bill: Omit<Bill, "id" | "status">) => void;
  toggleSchedule: (id: string) => void;
  cancelSchedule: (id: string) => void;
  addExternalAccount: (a: Omit<ExternalAccount, "id" | "linkedAt">) => void;
  removeExternalAccount: (id: string) => void;
  cancelSubscription: (merchant: string) => void;
  resumeSubscription: (merchant: string) => void;

  /* ---------------- cards ---------------- */
  toggleFreeze: (cardId: string) => void;
  replaceCard: (cardId: string) => void;
  setCardLimits: (cardId: string, limits: Partial<CardLimits>) => void;

  /* ---------------- account surface ---------------- */
  updateProfile: (patch: Partial<User>) => void;
  setPreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  setTheme: (theme: ThemeChoice) => void;
  toggleBalanceHidden: () => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  deleteNotification: (id: string) => void;
  clearNotifications: () => void;
  revokeDevice: (id: string) => void;
  revokeOtherDevices: () => void;
  reportLoginEvent: (id: string) => void;
  sendSupportMessage: (threadId: string, body: string) => void;
  startSupportThread: (subject: string, body: string) => string;
  setHydrated: () => void;
}

/* -------------------------------------------------------------------------- */

/** Applies a signed delta, respecting credit-account semantics. */
const applyDelta = (accounts: Account[], accountId: string, amount: number): Account[] =>
  accounts.map((a) => {
    if (a.id !== accountId) return a;
    if (a.kind === "credit") {
      // A charge (negative) increases what is owed; a payment reduces it.
      const balance = round2(a.balance - amount);
      return { ...a, balance, available: round2((a.creditLimit ?? 0) - balance) };
    }
    const balance = round2(a.balance + amount);
    return { ...a, balance, available: balance };
  });

const pushNotification = (
  list: AppNotification[],
  n: Omit<AppNotification, "id" | "date" | "read">
): AppNotification[] => [
  { ...n, id: uid(), date: new Date().toISOString(), read: false },
  ...list,
];

const AGENTS = ["Nadia K.", "Owen T.", "Marisol P."];

/** Canned but on-brand support replies, chosen by keyword. */
const agentReply = (body: string) => {
  const t = body.toLowerCase();
  if (t.includes("card") || t.includes("freeze"))
    return "I can help with that. You can freeze either card instantly from Cards → Card controls, and unfreeze it the same way. Would you like me to look at a specific card?";
  if (t.includes("transfer") || t.includes("send"))
    return "Transfers between your Auremont accounts post immediately. Transfers to a linked external account settle in one to three business days. Which transfer are you asking about?";
  if (t.includes("statement") || t.includes("document"))
    return "Statements are published on the first of each month under Documents. I can walk you through downloading one if that helps.";
  if (t.includes("deposit"))
    return "Check deposits under $25,000 are usually available the next business day. Direct deposit details are in Add money → Direct deposit.";
  return "Thanks — I have that noted. Let me review your account and come straight back to you with an answer.";
};

/* -------------------------------------------------------------------------- */

export const useBank = create<BankState>()(
  persist(
    (set, get) => ({
      authStage: "signed-out",
      rememberDevice: true,
      hydrated: false,
      onboarded: false,
      preferences: DEFAULT_PREFERENCES,
      balanceHidden: false,
      ...provision(),

      /* ------------------------------ session ------------------------------ */

      signIn: (email, password) => {
        const ok = email.trim().toLowerCase() === AUTH_EMAIL && password === AUTH_PASSWORD;
        if (ok) set({ authStage: "passcode" });
        return ok;
      },

      verifyPasscode: (code) => {
        if (code !== get().passcode) return false;
        set((s) => ({
          authStage: "authenticated",
          balanceHidden: s.preferences.hideBalancesOnOpen,
          loginEvents: [
            {
              id: uid(),
              device: "This device",
              location: s.user.city.split(",").slice(0, 2).join(",").trim(),
              date: new Date().toISOString(),
              status: "success" as const,
              method: "Passcode",
            },
            ...s.loginEvents,
          ].slice(0, 25),
        }));
        return true;
      },

      checkPasscode: (code) => code === get().passcode,

      changePasscode: (next) =>
        set((s) => ({
          passcode: next,
          notifications: pushNotification(s.notifications, {
            kind: "security",
            title: "Passcode updated",
            body: "Your 6-digit passcode was changed. If this wasn't you, contact us right away.",
            href: "/security",
          }),
        })),

      lock: () => set({ authStage: "passcode" }),

      signOut: () => set({ authStage: "signed-out" }),

      setRememberDevice: (v) => set({ rememberDevice: v }),

      completeOnboarding: () => set({ onboarded: true }),

      /* ------------------------------- money ------------------------------- */

      post: (movements) => {
        const now = new Date().toISOString();
        const added: Transaction[] = movements.map((m) => ({
          id: uid(),
          accountId: m.accountId,
          merchant: m.merchant,
          amount: round2(m.amount),
          date: now,
          category: m.category,
          status: m.status ?? "posted",
          method: m.method,
          reference: `AUR${uid().toUpperCase()}`,
          note: m.note,
        }));

        set((s) => {
          let accounts = s.accounts;
          for (const m of movements) accounts = applyDelta(accounts, m.accountId, m.amount);
          return { accounts, transactions: [...added, ...s.transactions] };
        });

        return added;
      },

      transfer: (fromId, toId, amount, note) => {
        const { accounts, post } = get();
        const from = accounts.find((a) => a.id === fromId);
        const to = accounts.find((a) => a.id === toId);
        if (!from || !to) return;
        const toCredit = to.kind === "credit";
        post([
          {
            accountId: fromId,
            merchant: toCredit ? `${to.name} payment` : `Transfer to ${to.name}`,
            amount: -amount,
            category: "transfer",
            method: "Internal transfer",
            note,
          },
          {
            accountId: toId,
            merchant: toCredit ? "Payment received" : `Transfer from ${from.name}`,
            amount,
            category: "transfer",
            method: "Internal transfer",
            note,
          },
        ]);
        set((s) => ({
          notifications: pushNotification(s.notifications, {
            kind: "payment",
            title: "Transfer complete",
            body: `${money(amount)} moved from ${from.name} ••${from.mask} to ${to.name} ••${to.mask}.`,
            href: `/accounts/${toId}`,
          }),
        }));
      },

      transferExternal: (fromId, externalId, amount, note) => {
        const ext = get().externalAccounts.find((x) => x.id === externalId);
        if (!ext) return;
        get().post([
          {
            accountId: fromId,
            merchant: `${ext.institution} ••${ext.mask}`,
            amount: -amount,
            category: "transfer",
            method: "ACH transfer",
            note,
            status: "pending",
          },
        ]);
        set((s) => ({
          notifications: pushNotification(s.notifications, {
            kind: "payment",
            title: "Transfer submitted",
            body: `${money(amount)} to ${ext.institution} ••${ext.mask} is on its way. External transfers settle in 1–3 business days.`,
            href: "/activity",
          }),
        }));
      },

      sendMoney: (payeeId, fromId, amount, note) => {
        const payee = get().payees.find((p) => p.id === payeeId);
        if (!payee) return;
        get().post([
          {
            accountId: fromId,
            merchant: payee.name,
            amount: -amount,
            category: payee.kind === "biller" ? "bills" : "transfer",
            method: payee.kind === "biller" ? "ACH debit" : "Auremont Send",
            note,
          },
        ]);
        set((s) => ({
          payees: s.payees.map((p) =>
            p.id === payeeId ? { ...p, lastSentAt: new Date().toISOString() } : p
          ),
          notifications: pushNotification(s.notifications, {
            kind: "payment",
            title: "Payment sent",
            body: `${money(amount)} was sent to ${payee.name}.`,
            href: "/activity",
          }),
        }));
      },

      payBill: (billId, fromId) => {
        const bill = get().bills.find((b) => b.id === billId);
        if (!bill) return;
        get().post([
          {
            accountId: fromId,
            merchant: bill.name,
            amount: -bill.amount,
            category: bill.category,
            method: "ACH debit",
            note: `${bill.service} bill`,
          },
        ]);
        // Paying rolls the bill to next month rather than deleting it.
        const next = new Date(bill.dueDate);
        next.setMonth(next.getMonth() + 1);
        set((s) => ({
          bills: s.bills.map((b) =>
            b.id === billId
              ? {
                  ...b,
                  status: "paid" as const,
                  lastPaidAt: new Date().toISOString(),
                  lastPaidAmount: b.amount,
                  dueDate: next.toISOString(),
                }
              : b
          ),
          notifications: pushNotification(s.notifications, {
            kind: "payment",
            title: "Bill paid",
            body: `${money(bill.amount)} was paid to ${bill.name}.`,
            href: `/payments/bills/${billId}`,
          }),
        }));
      },

      depositCheck: (toId, amount) => {
        get().post([
          {
            accountId: toId,
            merchant: "Check deposit",
            amount,
            category: "deposit",
            method: "Mobile check deposit",
            status: "pending",
          },
        ]);
        set((s) => ({
          notifications: pushNotification(s.notifications, {
            kind: "deposit",
            title: "Check deposit submitted",
            body: `${money(amount)} is being reviewed. Funds are usually available the next business day.`,
            href: "/activity",
          }),
        }));
      },

      depositFromExternal: (externalId, toId, amount) => {
        const ext = get().externalAccounts.find((x) => x.id === externalId);
        if (!ext) return;
        get().post([
          {
            accountId: toId,
            merchant: `Deposit · ${ext.institution} ••${ext.mask}`,
            amount,
            category: "deposit",
            method: "ACH transfer",
          },
        ]);
        set((s) => ({
          notifications: pushNotification(s.notifications, {
            kind: "deposit",
            title: "Money added",
            body: `${money(amount)} was added from ${ext.institution} ••${ext.mask}.`,
            href: "/activity",
          }),
        }));
      },

      /* ------------------- recipients, bills, schedules ------------------- */

      addPayee: (p) => {
        const payee: Payee = { ...p, id: uid() };
        set((s) => ({ payees: [payee, ...s.payees] }));
        return payee;
      },

      removePayee: (id) => set((s) => ({ payees: s.payees.filter((p) => p.id !== id) })),

      toggleFavoritePayee: (id) =>
        set((s) => ({
          payees: s.payees.map((p) => (p.id === id ? { ...p, favorite: !p.favorite } : p)),
        })),

      toggleAutopay: (billId) =>
        set((s) => ({
          bills: s.bills.map((b) =>
            b.id === billId
              ? {
                  ...b,
                  autopay: !b.autopay,
                  status: !b.autopay ? ("scheduled" as const) : ("due" as const),
                }
              : b
          ),
        })),

      setBillAccount: (billId, accountId) =>
        set((s) => ({
          bills: s.bills.map((b) => (b.id === billId ? { ...b, accountId } : b)),
        })),

      addBill: (bill) =>
        set((s) => ({
          bills: [{ ...bill, id: uid(), status: "due" as const }, ...s.bills],
        })),

      toggleSchedule: (id) =>
        set((s) => ({
          scheduled: s.scheduled.map((p) => (p.id === id ? { ...p, active: !p.active } : p)),
        })),

      cancelSchedule: (id) =>
        set((s) => ({ scheduled: s.scheduled.filter((p) => p.id !== id) })),

      addExternalAccount: (a) =>
        set((s) => ({
          externalAccounts: [
            { ...a, id: uid(), linkedAt: new Date().toISOString() },
            ...s.externalAccounts,
          ],
        })),

      removeExternalAccount: (id) =>
        set((s) => ({ externalAccounts: s.externalAccounts.filter((x) => x.id !== id) })),

      cancelSubscription: (merchant) =>
        set((s) => ({
          cancelledSubscriptions: [...new Set([...s.cancelledSubscriptions, merchant])],
        })),

      resumeSubscription: (merchant) =>
        set((s) => ({
          cancelledSubscriptions: s.cancelledSubscriptions.filter((m) => m !== merchant),
        })),

      /* ------------------------------- cards ------------------------------- */

      toggleFreeze: (cardId) =>
        set((s) => {
          const card = s.cards.find((c) => c.id === cardId);
          if (!card) return s;
          const frozen = !card.frozen;
          return {
            cards: s.cards.map((c) =>
              c.id === cardId
                ? { ...c, frozen, status: frozen ? ("frozen" as const) : ("active" as const) }
                : c
            ),
            notifications: pushNotification(s.notifications, {
              kind: "security",
              title: frozen ? "Card frozen" : "Card unfrozen",
              body: `${card.product} ••${card.mask} ${
                frozen ? "is frozen. New charges will be declined." : "can be used again."
              }`,
              href: `/cards/${cardId}`,
            }),
          };
        }),

      replaceCard: (cardId) =>
        set((s) => {
          const card = s.cards.find((c) => c.id === cardId);
          if (!card) return s;
          return {
            cards: s.cards.map((c) =>
              c.id === cardId ? { ...c, status: "replacing" as const, frozen: true } : c
            ),
            notifications: pushNotification(s.notifications, {
              kind: "security",
              title: "Replacement card ordered",
              body: `A new ${card.product} is on its way and arrives in 3–5 business days. Your current card is now frozen.`,
              href: `/cards/${cardId}`,
            }),
          };
        }),

      setCardLimits: (cardId, limits) =>
        set((s) => ({
          cards: s.cards.map((c) =>
            c.id === cardId ? { ...c, limits: { ...c.limits, ...limits } } : c
          ),
        })),

      /* --------------------------- account surface --------------------------- */

      updateProfile: (patch) => set((s) => ({ user: { ...s.user, ...patch } })),

      setPreference: (key, value) =>
        set((s) => ({ preferences: { ...s.preferences, [key]: value } })),

      setTheme: (theme) => set((s) => ({ preferences: { ...s.preferences, theme } })),

      toggleBalanceHidden: () => set((s) => ({ balanceHidden: !s.balanceHidden })),

      markRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),

      markAllRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

      deleteNotification: (id) =>
        set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

      clearNotifications: () => set({ notifications: [] }),

      revokeDevice: (id) =>
        set((s) => ({ devices: s.devices.filter((d) => d.id !== id || d.current) })),

      revokeOtherDevices: () =>
        set((s) => ({
          devices: s.devices.filter((d) => d.current),
          notifications: pushNotification(s.notifications, {
            kind: "security",
            title: "Other devices signed out",
            body: "Every device except this one has been signed out of your account.",
            href: "/security/devices",
          }),
        })),

      reportLoginEvent: (id) =>
        set((s) => ({
          loginEvents: s.loginEvents.map((e) =>
            e.id === id ? { ...e, status: "blocked" as const } : e
          ),
          notifications: pushNotification(s.notifications, {
            kind: "security",
            title: "Security review started",
            body: "We're reviewing that sign-in and have locked it out of your account. Our team will follow up within 24 hours.",
            href: "/security/activity",
          }),
        })),

      sendSupportMessage: (threadId, body) => {
        const at = new Date().toISOString();
        set((s) => ({
          supportThreads: s.supportThreads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  status: "open" as const,
                  updatedAt: at,
                  messages: [
                    ...t.messages,
                    { id: uid(), from: "customer" as const, body, at },
                  ],
                }
              : t
          ),
        }));
        // The agent answers a beat later, as a person would.
        setTimeout(() => {
          set((s) => ({
            supportThreads: s.supportThreads.map((t) =>
              t.id === threadId
                ? {
                    ...t,
                    updatedAt: new Date().toISOString(),
                    messages: [
                      ...t.messages,
                      {
                        id: uid(),
                        from: "agent" as const,
                        body: agentReply(body),
                        at: new Date().toISOString(),
                      },
                    ],
                  }
                : t
            ),
          }));
        }, 2200);
      },

      startSupportThread: (subject, body) => {
        const id = uid();
        const at = new Date().toISOString();
        set((s) => ({
          supportThreads: [
            {
              id,
              subject,
              agent: AGENTS[s.supportThreads.length % AGENTS.length],
              status: "open" as const,
              updatedAt: at,
              messages: [{ id: uid(), from: "customer" as const, body, at }],
            },
            ...s.supportThreads,
          ],
        }));
        setTimeout(() => get().sendSupportMessage(id, ""), 0);
        return id;
      },

      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "auremont-bank",
      version: 5,
      // Bumping the version re-seeds security material on existing sessions.
      migrate: (persisted, from) => {
        const state = persisted as Partial<BankState> | undefined;
        if (state && from < 5) {
          // Security material, account identity and appearance are re-seeded.
          return {
            ...state,
            passcode: AUTH_PASSCODE,
            user: DEMO_USER,
            cards: seedCards(DEMO_USER.name),
            preferences: {
              ...DEFAULT_PREFERENCES,
              ...(state.preferences ?? {}),
              theme: DEFAULT_PREFERENCES.theme,
            },
          } as unknown as BankState;
        }
        return persisted as BankState;
      },
      partialize: (s) => {
        const { hydrated: _h, ...rest } = s;
        return rest;
      },
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    }
  )
);

export { CHECKING_ID, SAVINGS_ID, CREDIT_ID };
