"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AppNotification,
  Goal,
  LockedPlan,
  Transaction,
  TransactionType,
  User,
} from "./types";
import {
  DEMO_USER,
  SEED_BALANCE,
  seedGoals,
  seedLockedPlans,
  seedNotifications,
  seedTransactions,
} from "./seed";
import { uid } from "./utils";

// A fresh, fully-provisioned session for the permanent demo user.
const freshSession = () => ({
  user: DEMO_USER,
  balance: SEED_BALANCE,
  transactions: seedTransactions(),
  goals: seedGoals(),
  lockedPlans: seedLockedPlans(),
  notifications: seedNotifications(DEMO_USER.name),
});

interface EcokriptoState {
  user: User | null;
  balance: number;
  transactions: Transaction[];
  goals: Goal[];
  lockedPlans: LockedPlan[];
  notifications: AppNotification[];
  hydrated: boolean;

  signUp: (name: string, email: string) => void;
  signOut: () => void;
  addTransaction: (type: TransactionType, label: string, amount: number) => void;
  addGoal: (name: string, emoji: string, target: number) => void;
  contributeToGoal: (id: string, amount: number) => void;
  deleteGoal: (id: string) => void;
  addLockedPlan: (name: string, amount: number, apy: number, termMonths: number) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  setHydrated: () => void;
}

export const useEcokripto = create<EcokriptoState>()(
  persist(
    (set) => ({
      // The platform boots straight into the permanent demo account —
      // there is no sign-up / login flow.
      ...freshSession(),
      hydrated: false,

      signUp: (name, email) =>
        set({
          user: { name, email, joinedAt: new Date().toISOString() },
          balance: SEED_BALANCE,
          transactions: seedTransactions(),
          goals: seedGoals(),
          lockedPlans: seedLockedPlans(),
          notifications: seedNotifications(name),
        }),

      // No auth to sign out of — this simply resets to a fresh session.
      signOut: () => set(freshSession()),

      addTransaction: (type, label, amount) =>
        set((s) => ({
          balance: Math.round((s.balance + amount) * 100) / 100,
          transactions: [
            {
              id: uid(),
              type,
              label,
              amount,
              date: new Date().toISOString(),
              status: "completed" as const,
            },
            ...s.transactions,
          ],
        })),

      addGoal: (name, emoji, target) =>
        set((s) => ({
          goals: [
            { id: uid(), name, emoji, target, saved: 0, createdAt: new Date().toISOString() },
            ...s.goals,
          ],
        })),

      contributeToGoal: (id, amount) =>
        set((s) => ({
          balance: Math.round((s.balance - amount) * 100) / 100,
          goals: s.goals.map((g) =>
            g.id === id ? { ...g, saved: Math.round((g.saved + amount) * 100) / 100 } : g
          ),
          transactions: [
            {
              id: uid(),
              type: "goal" as const,
              label: `Goal contribution · ${s.goals.find((g) => g.id === id)?.name ?? "Goal"}`,
              amount: -amount,
              date: new Date().toISOString(),
              status: "completed" as const,
            },
            ...s.transactions,
          ],
        })),

      deleteGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      addLockedPlan: (name, amount, apy, termMonths) =>
        set((s) => ({
          balance: Math.round((s.balance - amount) * 100) / 100,
          lockedPlans: [
            { id: uid(), name, amount, apy, termMonths, startedAt: new Date().toISOString() },
            ...s.lockedPlans,
          ],
          transactions: [
            {
              id: uid(),
              type: "lock" as const,
              label: `Locked savings · ${name}`,
              amount: -amount,
              date: new Date().toISOString(),
              status: "completed" as const,
            },
            ...s.transactions,
          ],
        })),

      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),

      markRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "ecokripto-store",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);

export const selectLockedTotal = (s: EcokriptoState) =>
  s.lockedPlans.reduce((sum, p) => sum + p.amount, 0);

export const selectApyEarned = (s: EcokriptoState) =>
  s.transactions
    .filter((t) => t.type === "apy")
    .reduce((sum, t) => sum + t.amount, 0);
