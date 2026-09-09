/* Auremont Bank — domain model. */

export type AccountKind = "checking" | "savings" | "credit";

export interface Account {
  id: string;
  name: string;
  kind: AccountKind;
  mask: string;
  /** Ledger balance. For credit accounts this is the amount owed. */
  balance: number;
  /** Available to spend now (checking/savings) or remaining credit. */
  available: number;
  apy?: number;
  creditLimit?: number;
  routing?: string;
  openedAt: string;
}

export type Category =
  | "income"
  | "transfer"
  | "deposit"
  | "food"
  | "groceries"
  | "transport"
  | "shopping"
  | "entertainment"
  | "subscriptions"
  | "bills"
  | "housing"
  | "health"
  | "travel"
  | "atm";

export type TxStatus = "posted" | "pending";

export interface Transaction {
  id: string;
  accountId: string;
  /** Merchant, employer or counterparty — the primary row label. */
  merchant: string;
  /** Positive = money in, negative = money out. */
  amount: number;
  date: string;
  category: Category;
  status: TxStatus;
  /** How it moved: "Card ••7770", "ACH direct deposit", "Internal transfer". */
  method: string;
  reference: string;
  city?: string;
  note?: string;
}

export interface Card {
  id: string;
  accountId: string;
  product: string;
  kind: "debit" | "credit";
  mask: string;
  holder: string;
  expiry: string;
  frozen: boolean;
  virtual: boolean;
  /** Full number is only ever rendered after a passcode check. */
  number: string;
  cvv: string;
  status: "active" | "frozen" | "replacing";
  limits: CardLimits;
}

export interface Payee {
  id: string;
  name: string;
  kind: "person" | "biller";
  /** Masked account, phone or email the money goes to. */
  detail: string;
  favorite?: boolean;
  lastSentAt?: string;
}

export interface Bill {
  id: string;
  name: string;
  /** What the biller provides — "Electric", "Wireless", "Rent". */
  service: string;
  amount: number;
  dueDate: string;
  autopay: boolean;
  category: Category;
  accountId: string;
  status: "due" | "scheduled" | "paid";
  lastPaidAt?: string;
  lastPaidAmount?: number;
}

export type ScheduleFrequency = "once" | "weekly" | "biweekly" | "monthly";

export interface ScheduledPayment {
  id: string;
  kind: "bill" | "send" | "transfer";
  /** Biller, recipient or destination account name. */
  target: string;
  amount: number;
  nextDate: string;
  frequency: ScheduleFrequency;
  fromAccountId: string;
  active: boolean;
}

export interface ExternalAccount {
  id: string;
  institution: string;
  nickname: string;
  mask: string;
  kind: "checking" | "savings";
  status: "linked" | "pending";
  linkedAt: string;
}

export interface Statement {
  id: string;
  accountId: string;
  /** ISO month, e.g. "2026-08". */
  period: string;
  issuedAt: string;
  openingBalance: number;
  closingBalance: number;
  moneyIn: number;
  moneyOut: number;
}

export interface LoginEvent {
  id: string;
  device: string;
  location: string;
  date: string;
  status: "success" | "blocked";
  method: string;
}

export interface SupportMessage {
  id: string;
  from: "customer" | "agent";
  body: string;
  at: string;
}

export interface SupportThread {
  id: string;
  subject: string;
  agent: string;
  status: "open" | "resolved";
  updatedAt: string;
  messages: SupportMessage[];
}

export type ThemeChoice = "light" | "dark" | "system";

export interface Preferences {
  theme: ThemeChoice;
  biometric: boolean;
  twoFactor: boolean;
  pushTransactions: boolean;
  pushSecurity: boolean;
  pushPayments: boolean;
  pushMarketing: boolean;
  emailStatements: boolean;
  hideBalancesOnOpen: boolean;
  privateActivity: boolean;
  shareAnalytics: boolean;
}

export interface CardLimits {
  daily: number;
  atm: number;
  online: boolean;
  international: boolean;
  contactless: boolean;
}

export type NotificationKind =
  | "transaction"
  | "deposit"
  | "payment"
  | "security"
  | "account"
  | "promotion";

export interface AppNotification {
  id: string;
  /** Optional deep link into the thing the notification is about. */
  href?: string;
  kind: NotificationKind;
  title: string;
  body: string;
  date: string;
  read: boolean;
}

export interface Device {
  id: string;
  name: string;
  platform: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export interface User {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  memberSince: string;
}

/** Sign-in → passcode → in. Persisted so a reload keeps you signed in. */
export type AuthStage = "signed-out" | "passcode" | "authenticated";
