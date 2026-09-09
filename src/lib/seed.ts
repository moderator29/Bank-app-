import type {
  AppNotification,
  Goal,
  LockedPlan,
  Transaction,
  User,
} from "./types";

// The single permanent account the platform loads into. There is no sign-up
// or login — every visitor lands straight in as this user.
export const DEMO_USER: User = {
  name: "Tamara Lee Gilmore",
  email: "tamara.gilmore@ecokripto.com",
  joinedAt: "2024-03-12T09:00:00.000Z",
};

// Demo data seeded into every new local account. All figures are simulated —
// nothing here represents real money or a real financial product.

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(9 + (n % 8), (n * 13) % 60, 0, 0);
  return d.toISOString();
};

export const SEED_BALANCE = 3_150_000;
export const SEED_APY = 4.25;

export const seedTransactions = (): Transaction[] => [
  { id: "t1", type: "deposit",  label: "Deposit · Checking ••4821", amount: 1200,   date: daysAgo(1),  status: "completed" },
  { id: "t2", type: "apy",      label: "APY earnings payout",       amount: 1_000_000, date: daysAgo(3),  status: "completed" },
  { id: "t4", type: "withdraw", label: "Withdrawal · Checking ••4821", amount: -500, date: daysAgo(8), status: "completed" },
  { id: "t5", type: "reward",   label: "Savings streak reward",     amount: 300_000, date: daysAgo(11), status: "completed" },
  { id: "t6", type: "deposit",  label: "Deposit · Checking ••4821", amount: 2000,   date: daysAgo(14), status: "completed" },
  { id: "t7", type: "lock",     label: "Locked savings · 6-month",  amount: -3000,  date: daysAgo(18), status: "completed" },
  { id: "t8", type: "apy",      label: "APY earnings payout",       amount: 850_000, date: daysAgo(21), status: "completed" },
  { id: "t9", type: "deposit",  label: "Deposit · Checking ••4821", amount: 1500,   date: daysAgo(26), status: "completed" },
];

export const seedGoals = (): Goal[] => [
  { id: "g1", name: "Dream Home",     emoji: "🏡", target: 40000, saved: 18250, createdAt: daysAgo(120) },
  { id: "g2", name: "Emergency Fund", emoji: "🛟", target: 10000, saved: 8400,  createdAt: daysAgo(200) },
  { id: "g3", name: "Japan Trip",     emoji: "🗻", target: 6000,  saved: 2150,  createdAt: daysAgo(60) },
];

export const seedLockedPlans = (): LockedPlan[] => [
  { id: "l1", name: "6-Month Growth Lock", amount: 1_150_000, apy: 5.1, termMonths: 6,  startedAt: daysAgo(18) },
  { id: "l2", name: "12-Month Reserve",    amount: 2_000_000, apy: 5.6, termMonths: 12, startedAt: daysAgo(95) },
];

export const seedNotifications = (name: string): AppNotification[] => [
  {
    id: "n1",
    title: `Welcome to Ecokripto, ${name.split(" ")[0]} 👋`,
    body: "Your account is ready. Explore savings, locked plans and investments.",
    date: new Date().toISOString(),
    read: false,
  },
  {
    id: "n2",
    title: "APY payout received",
    body: "Your latest earnings payout of $150,000 has been added to your balance.",
    date: daysAgo(3),
    read: false,
  },
  {
    id: "n3",
    title: "Savings streak: 45 days 🔥",
    body: "You've saved consistently for 45 days. Keep the streak alive!",
    date: daysAgo(6),
    read: true,
  },
];

// 12-month balance history for the portfolio chart
export const seedHistory = () => {
  const months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const values = [
    1_260_000, 1_440_000, 1_560_000, 1_760_000, 1_920_000, 2_110_000,
    2_220_000, 2_430_000, 2_610_000, 2_800_000, 2_970_000, 3_150_000,
  ];
  return months.map((month, i) => ({ month, value: values[i] }));
};
