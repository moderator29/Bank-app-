export type TransactionType =
  | "deposit"
  | "withdraw"
  | "apy"
  | "reward"
  | "goal"
  | "lock";

export interface Transaction {
  id: string;
  type: TransactionType;
  label: string;
  amount: number; // positive = money in, negative = money out
  date: string; // ISO
  status: "completed" | "pending";
}

export interface Goal {
  id: string;
  name: string;
  emoji: string;
  target: number;
  saved: number;
  createdAt: string;
}

export interface LockedPlan {
  id: string;
  name: string;
  amount: number;
  apy: number;
  termMonths: number;
  startedAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  date: string;
  read: boolean;
}

export interface User {
  name: string;
  email: string;
  joinedAt: string;
}
