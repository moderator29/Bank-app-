import type {
  Account,
  AppNotification,
  Bill,
  Card,
  Category,
  Device,
  ExternalAccount,
  LoginEvent,
  Payee,
  Preferences,
  ScheduledPayment,
  Statement,
  SupportThread,
  Transaction,
  User,
} from "./types";

/* ==========================================================================
   AUREMONT BANK — account fixtures
   All figures, people and companies here are fictional.
   ========================================================================== */

export const AUTH_EMAIL = "stainless112233@gmail.com";
export const AUTH_PASSWORD = "stainless123";
export const AUTH_PASSCODE = "195656";

export const EMPLOYER = "Northstar Digital LLC";
export const WEEKLY_INCOME = 30_000;

export const CHECKING_ID = "acct-checking";
export const SAVINGS_ID = "acct-savings";
export const CREDIT_ID = "acct-credit";

export const DEMO_USER: User = {
  name: "Ojoisimi Igbasan KUTY",
  email: AUTH_EMAIL,
  phone: "(704) 555-0182",
  street: "1408 Weatherly Crescent, Apt 12B",
  city: "Charlotte, NC 28203",
  memberSince: "2019-06-04T00:00:00.000Z",
};

export const seedAccounts = (): Account[] => [
  {
    id: CHECKING_ID,
    name: "Auremont Checking",
    kind: "checking",
    mask: "7770",
    balance: 800_000,
    available: 800_000,
    routing: "053112604",
    openedAt: "2019-06-04T00:00:00.000Z",
  },
  {
    id: SAVINGS_ID,
    name: "Auremont Premier Savings",
    kind: "savings",
    mask: "4412",
    balance: 264_318.75,
    available: 264_318.75,
    apy: 4.15,
    routing: "053112604",
    openedAt: "2019-06-04T00:00:00.000Z",
  },
  {
    id: CREDIT_ID,
    name: "Auremont Reserve Card",
    kind: "credit",
    mask: "2058",
    balance: 2_431.18,
    available: 47_568.82,
    creditLimit: 50_000,
    openedAt: "2021-02-17T00:00:00.000Z",
  },
];

export const seedCards = (holder: string): Card[] => [
  {
    id: "card-debit",
    accountId: CHECKING_ID,
    product: "Signature Debit",
    kind: "debit",
    mask: "7770",
    number: "4831 2204 9917 7770",
    cvv: "412",
    holder: holder.toUpperCase(),
    expiry: "09/29",
    frozen: false,
    virtual: false,
    status: "active",
    limits: { daily: 10_000, atm: 1_500, online: true, international: true, contactless: true },
  },
  {
    id: "card-credit",
    accountId: CREDIT_ID,
    product: "Reserve Credit",
    kind: "credit",
    mask: "2058",
    number: "4712 6690 3341 2058",
    cvv: "907",
    holder: holder.toUpperCase(),
    expiry: "04/28",
    frozen: false,
    virtual: false,
    status: "active",
    limits: { daily: 25_000, atm: 1_000, online: true, international: true, contactless: true },
  },
  {
    id: "card-virtual",
    accountId: CHECKING_ID,
    product: "Virtual Card",
    kind: "debit",
    mask: "6314",
    number: "4831 2204 5580 6314",
    cvv: "228",
    holder: holder.toUpperCase(),
    expiry: "11/28",
    frozen: false,
    virtual: true,
    status: "active",
    limits: { daily: 2_500, atm: 0, online: true, international: false, contactless: false },
  },
];

export const seedPayees = (): Payee[] => [
  { id: "p1", name: "Alex Morgan", kind: "person", detail: "Auremont ••3106", favorite: true, lastSentAt: AT_STATIC(6) },
  { id: "p2", name: "Jordan Williams", kind: "person", detail: "(704) 555-0294", favorite: true, lastSentAt: AT_STATIC(13) },
  { id: "p3", name: "Taylor Reed", kind: "person", detail: "taylor.reed@mailbox.com", lastSentAt: AT_STATIC(28) },
  { id: "p4", name: "Chris Anderson", kind: "person", detail: "Auremont ••8815", lastSentAt: AT_STATIC(41) },
  { id: "p5", name: "Priya Raman", kind: "person", detail: "(704) 555-0177" },
  { id: "p6", name: "Ridgeline Residences", kind: "biller", detail: "Rent · acct 44192", favorite: true },
  { id: "p7", name: "Con Edison", kind: "biller", detail: "Electric · acct 90-3318" },
  { id: "p8", name: "Verizon Wireless", kind: "biller", detail: "Wireless · acct 7741" },
  { id: "p9", name: "State Farm Insurance", kind: "biller", detail: "Auto policy · 22-8841" },
  { id: "p10", name: "Xfinity", kind: "biller", detail: "Internet · acct 5520-11" },
];

/* -------------------------------------------------------------------------- */

function AT_STATIC(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(10, 0, 0, 0);
  return d.toISOString();
}

const AT = (daysAgo: number, hour = 12, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

const AHEAD = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
};

/** Days back to the most recent payday (Thursday), then weekly from there. */
const lastThursday = () => {
  const day = new Date().getDay();
  return (day - 4 + 7) % 7;
};

const ref = (i: number) =>
  `AUR${(i * 748301 + 91237).toString(36).toUpperCase().padStart(7, "0").slice(-7)}`;

/** [daysAgo, merchant, amount, category, method, city?] */
type Row = [number, string, number, Category, string, string?];

const CARD = "Card ••7770";
const CREDIT_CARD = "Card ••2058";
const ACH = "ACH direct deposit";
const INTERNAL = "Internal transfer";

const SPEND: Row[] = [
  [0, "Starbucks", -6.85, "food", CARD, "Charlotte, NC"],
  [0, "Uber", -18.42, "transport", CARD, "Charlotte, NC"],
  [1, "McDonald's", -12.47, "food", CARD, "Charlotte, NC"],
  [1, "Shell", -58.2, "transport", CARD, "Charlotte, NC"],
  [1, "Amazon", -84.99, "shopping", CARD, "Seattle, WA"],
  [2, "Whole Foods Market", -142.66, "groceries", CARD, "Charlotte, NC"],
  [2, "Netflix", -22.99, "subscriptions", CARD, "Los Gatos, CA"],
  [3, "Uber Eats", -34.18, "food", CARD, "Charlotte, NC"],
  [3, "Apple", -9.99, "subscriptions", CARD, "Cupertino, CA"],
  [3, "Target", -76.43, "shopping", CARD, "Charlotte, NC"],
  [4, "Chipotle Mexican Grill", -14.82, "food", CARD, "Charlotte, NC"],
  [4, "CVS Pharmacy", -27.4, "health", CARD, "Charlotte, NC"],
  [5, "DoorDash", -41.75, "food", CARD, "Charlotte, NC"],
  [5, "Spotify", -11.99, "subscriptions", CARD, "New York, NY"],
  [6, "Trader Joe's", -88.31, "groceries", CARD, "Charlotte, NC"],
  [6, "Chevron", -62.11, "transport", CARD, "Charlotte, NC"],
  [7, "Starbucks", -8.91, "food", CARD, "Charlotte, NC"],
  [7, "Delta Air Lines", -412.6, "travel", CARD, "Atlanta, GA"],
  [8, "Walmart", -119.0, "shopping", CARD, "Charlotte, NC"],
  [8, "Verizon Wireless", -96.55, "bills", "ACH debit"],
  [9, "Panera Bread", -19.36, "food", CARD, "Charlotte, NC"],
  [9, "Equinox", -215.0, "health", CARD, "Charlotte, NC"],
  [10, "Amazon", -156.24, "shopping", CARD, "Seattle, WA"],
  [10, "Con Edison", -184.72, "bills", "ACH debit"],
  [11, "Sweetgreen", -17.55, "food", CARD, "Charlotte, NC"],
  [11, "Lyft", -23.8, "transport", CARD, "Charlotte, NC"],
  [12, "Costco Wholesale", -264.19, "groceries", CARD, "Charlotte, NC"],
  [13, "Ridgeline Residences", -4_200.0, "housing", "ACH debit"],
  [14, "State Farm Insurance", -178.44, "bills", "ACH debit"],
  [14, "Hulu", -18.99, "subscriptions", CARD, "Santa Monica, CA"],
  [15, "Uber", -21.05, "transport", CARD, "Charlotte, NC"],
  [15, "Blue Bottle Coffee", -7.25, "food", CARD, "Charlotte, NC"],
  [16, "Best Buy", -329.99, "shopping", CARD, "Charlotte, NC"],
  [17, "Shake Shack", -26.7, "food", CARD, "Charlotte, NC"],
  [17, "ATM withdrawal", -200.0, "atm", "ATM ••7770", "Charlotte, NC"],
  [18, "Figma", -15.0, "subscriptions", CARD, "San Francisco, CA"],
  [18, "GitHub", -21.0, "subscriptions", CARD, "San Francisco, CA"],
  [19, "Safeway", -97.88, "groceries", CARD, "Charlotte, NC"],
  [19, "Exxon", -54.36, "transport", CARD, "Charlotte, NC"],
  [20, "The Smith", -138.5, "food", CARD, "Charlotte, NC"],
  [21, "Apple Store", -1_249.0, "shopping", CARD, "Charlotte, NC"],
  [22, "Uber Eats", -29.14, "food", CARD, "Charlotte, NC"],
  [22, "AT&T", -82.3, "bills", "ACH debit"],
  [23, "Nordstrom", -486.0, "shopping", CARD, "Charlotte, NC"],
  [24, "Starbucks", -5.75, "food", CARD, "Charlotte, NC"],
  [24, "Charlotte Area Transit", -45.0, "transport", CARD, "Charlotte, NC"],
  [25, "Whole Foods Market", -118.42, "groceries", CARD, "Charlotte, NC"],
  [26, "Peloton", -44.0, "subscriptions", CARD, "New York, NY"],
  [26, "Sephora", -92.6, "shopping", CARD, "Charlotte, NC"],
  [27, "Chipotle Mexican Grill", -13.28, "food", CARD, "Charlotte, NC"],
  [28, "Hilton Hotels", -642.18, "travel", CARD, "Nashville, TN"],
  [29, "DoorDash", -38.9, "food", CARD, "Charlotte, NC"],
  [29, "Walgreens", -31.22, "health", CARD, "Charlotte, NC"],
  [30, "Amazon", -63.21, "shopping", CARD, "Seattle, WA"],
  [31, "The Home Depot", -214.77, "shopping", CARD, "Charlotte, NC"],
  [32, "Netflix", -22.99, "subscriptions", CARD, "Los Gatos, CA"],
  [32, "Uber", -16.3, "transport", CARD, "Charlotte, NC"],
  [33, "Trader Joe's", -76.14, "groceries", CARD, "Charlotte, NC"],
  [34, "Spotify", -11.99, "subscriptions", CARD, "New York, NY"],
  [34, "McDonald's", -9.63, "food", CARD, "Charlotte, NC"],
  [35, "Con Edison", -176.05, "bills", "ACH debit"],
  [36, "Starbucks", -7.4, "food", CARD, "Charlotte, NC"],
  [36, "Shell", -49.88, "transport", CARD, "Charlotte, NC"],
  [37, "Target", -143.19, "shopping", CARD, "Charlotte, NC"],
  [38, "Apple", -9.99, "subscriptions", CARD, "Cupertino, CA"],
  [39, "Chipotle Mexican Grill", -15.44, "food", CARD, "Charlotte, NC"],
  [39, "CVS Pharmacy", -18.75, "health", CARD, "Charlotte, NC"],
  [40, "Verizon Wireless", -96.55, "bills", "ACH debit"],
  [41, "Whole Foods Market", -131.09, "groceries", CARD, "Charlotte, NC"],
  [42, "Uber Eats", -27.4, "food", CARD, "Charlotte, NC"],
  [43, "Ridgeline Residences", -4_200.0, "housing", "ACH debit"],
  [44, "State Farm Insurance", -178.44, "bills", "ACH debit"],
  [45, "AMC Theatres", -34.5, "entertainment", CARD, "Charlotte, NC"],
  [47, "Ticketmaster", -288.0, "entertainment", CARD, "Charlotte, NC"],
  [49, "Amazon", -47.63, "shopping", CARD, "Seattle, WA"],
  [51, "Starbucks", -6.1, "food", CARD, "Charlotte, NC"],
  [53, "Costco Wholesale", -198.44, "groceries", CARD, "Charlotte, NC"],
  [55, "Uber", -19.75, "transport", CARD, "Charlotte, NC"],
  [58, "Best Buy", -89.99, "shopping", CARD, "Charlotte, NC"],
];

const MOVEMENTS: Row[] = [
  [5, "Transfer to Premier Savings", -25_000, "transfer", INTERNAL],
  [10, "Auremont Reserve Card payment", -1_850, "transfer", INTERNAL],
  [20, "Transfer to Premier Savings", -15_000, "transfer", INTERNAL],
  [33, "Transfer to Premier Savings", -20_000, "transfer", INTERNAL],
];

export const seedTransactions = (): Transaction[] => {
  const out: Transaction[] = [];
  let i = 0;

  // Recurring weekly payroll — the backbone of the incoming history.
  const offset = lastThursday();
  for (let w = 0; w < 12; w += 1) {
    const days = offset + w * 7;
    out.push({
      id: `tx-pay-${w}`,
      accountId: CHECKING_ID,
      merchant: EMPLOYER,
      amount: WEEKLY_INCOME,
      date: AT(days, 8, 12),
      category: "income",
      status: "posted",
      method: ACH,
      reference: ref(i += 1),
      note: "Payroll · bi-weekly cycle 04",
    });
  }

  for (const [d, merchant, amount, category, method, city] of [...SPEND, ...MOVEMENTS]) {
    i += 1;
    out.push({
      id: `tx-${i}`,
      accountId: CHECKING_ID,
      merchant,
      amount,
      date: AT(d, 8 + ((i * 3) % 11), (i * 17) % 60),
      category,
      status: d === 0 && merchant === "Uber" ? "pending" : "posted",
      method,
      reference: ref(i),
      city,
    });
  }

  // Premier Savings — funded by transfers, paid monthly interest.
  const savings: Row[] = [
    [5, "Transfer from Auremont Checking", 25_000, "transfer", INTERNAL],
    [8, "Interest paid", 902.41, "income", "Interest credit"],
    [20, "Transfer from Auremont Checking", 15_000, "transfer", INTERNAL],
    [33, "Transfer from Auremont Checking", 20_000, "transfer", INTERNAL],
    [38, "Interest paid", 838.16, "income", "Interest credit"],
  ];
  for (const [d, merchant, amount, category, method] of savings) {
    i += 1;
    out.push({
      id: `tx-sv-${i}`,
      accountId: SAVINGS_ID,
      merchant,
      amount,
      date: AT(d, 6, 30),
      category,
      status: "posted",
      method,
      reference: ref(i),
    });
  }

  // Reserve Card — a handful of charges plus the payment from checking.
  const credit: Row[] = [
    [2, "Delta Air Lines", -486.2, "travel", CREDIT_CARD, "Atlanta, GA"],
    [6, "The Capital Grille", -214.85, "food", CREDIT_CARD, "Charlotte, NC"],
    [9, "Marriott Bonvoy", -1_180.4, "travel", CREDIT_CARD, "Charleston, SC"],
    [10, "Payment received", 1_850, "transfer", INTERNAL],
    [15, "Saks Fifth Avenue", -549.73, "shopping", CREDIT_CARD, "Charlotte, NC"],
  ];
  for (const [d, merchant, amount, category, method, city] of credit) {
    i += 1;
    out.push({
      id: `tx-cr-${i}`,
      accountId: CREDIT_ID,
      merchant,
      amount,
      date: AT(d, 13, (i * 7) % 60),
      category,
      status: "posted",
      method,
      reference: ref(i),
      city,
    });
  }

  return out.sort((a, b) => +new Date(b.date) - +new Date(a.date));
};

export const seedBills = (): Bill[] => [
  { id: "b1", name: "Ridgeline Residences", service: "Rent", amount: 4_200, dueDate: AHEAD(4), autopay: true, category: "housing", accountId: CHECKING_ID, status: "scheduled", lastPaidAt: AT(13), lastPaidAmount: 4_200 },
  { id: "b2", name: "Con Edison", service: "Electric", amount: 179.4, dueDate: AHEAD(7), autopay: true, category: "bills", accountId: CHECKING_ID, status: "scheduled", lastPaidAt: AT(10), lastPaidAmount: 184.72 },
  { id: "b3", name: "Verizon Wireless", service: "Wireless", amount: 96.55, dueDate: AHEAD(11), autopay: false, category: "bills", accountId: CHECKING_ID, status: "due", lastPaidAt: AT(8), lastPaidAmount: 96.55 },
  { id: "b4", name: "Xfinity", service: "Internet", amount: 89.99, dueDate: AHEAD(13), autopay: false, category: "bills", accountId: CHECKING_ID, status: "due", lastPaidAt: AT(17), lastPaidAmount: 89.99 },
  { id: "b5", name: "State Farm Insurance", service: "Auto insurance", amount: 178.44, dueDate: AHEAD(16), autopay: true, category: "bills", accountId: CHECKING_ID, status: "scheduled", lastPaidAt: AT(14), lastPaidAmount: 178.44 },
  { id: "b6", name: "Auremont Reserve Card", service: "Credit card", amount: 2_431.18, dueDate: AHEAD(19), autopay: false, category: "transfer", accountId: CHECKING_ID, status: "due", lastPaidAt: AT(10), lastPaidAmount: 1_850 },
];

export const seedScheduled = (): ScheduledPayment[] => [
  { id: "s1", kind: "bill", target: "Ridgeline Residences", amount: 4_200, nextDate: AHEAD(4), frequency: "monthly", fromAccountId: CHECKING_ID, active: true },
  { id: "s2", kind: "bill", target: "Con Edison", amount: 179.4, nextDate: AHEAD(7), frequency: "monthly", fromAccountId: CHECKING_ID, active: true },
  { id: "s3", kind: "transfer", target: "Auremont Premier Savings", amount: 5_000, nextDate: AHEAD(9), frequency: "weekly", fromAccountId: CHECKING_ID, active: true },
  { id: "s4", kind: "bill", target: "State Farm Insurance", amount: 178.44, nextDate: AHEAD(16), frequency: "monthly", fromAccountId: CHECKING_ID, active: true },
  { id: "s5", kind: "send", target: "Alex Morgan", amount: 400, nextDate: AHEAD(21), frequency: "monthly", fromAccountId: CHECKING_ID, active: false },
];

export const seedExternalAccounts = (): ExternalAccount[] => [
  { id: "x1", institution: "Chase", nickname: "Chase Total Checking", mask: "4417", kind: "checking", status: "linked", linkedAt: "2023-04-11T00:00:00.000Z" },
  { id: "x2", institution: "Bank of America", nickname: "Advantage Savings", mask: "9082", kind: "savings", status: "linked", linkedAt: "2024-01-22T00:00:00.000Z" },
  { id: "x3", institution: "Capital One", nickname: "360 Performance Savings", mask: "6631", kind: "savings", status: "pending", linkedAt: AT(2) },
];

export const seedLoginEvents = (): LoginEvent[] => [
  { id: "l1", device: "iPhone 15 Pro", location: "Charlotte, NC", date: AT(0, 9, 14), status: "success", method: "Passcode" },
  { id: "l2", device: "MacBook Pro · Safari", location: "Charlotte, NC", date: AT(2, 14, 28), status: "success", method: "Password" },
  { id: "l3", device: "Unrecognized browser", location: "Newark, NJ", date: AT(5, 3, 41), status: "blocked", method: "Password" },
  { id: "l4", device: "iPad Air", location: "Raleigh, NC", date: AT(12, 20, 5), status: "success", method: "Face ID" },
  { id: "l5", device: "iPhone 15 Pro", location: "Charleston, SC", date: AT(19, 11, 2), status: "success", method: "Passcode" },
];

export const seedSupportThreads = (): SupportThread[] => [
  {
    id: "sup1",
    subject: "Replacement card delivery",
    agent: "Nadia K.",
    status: "resolved",
    updatedAt: AT(9, 15, 20),
    messages: [
      { id: "m1", from: "customer", body: "I ordered a replacement debit card last week — can you tell me where it is?", at: AT(9, 15, 2) },
      { id: "m2", from: "agent", body: "Of course. Your Signature Debit ••7770 replacement shipped on the 2nd and arrives within three business days. I've added tracking to your documents.", at: AT(9, 15, 11) },
      { id: "m3", from: "customer", body: "Perfect, thank you.", at: AT(9, 15, 20) },
    ],
  },
];

/** Twelve monthly statements per deposit account, newest first. */
export const seedStatements = (): Statement[] => {
  const out: Statement[] = [];
  const now = new Date();
  for (const acct of [
    { id: CHECKING_ID, close: 800_000, step: 13_800, inflow: 120_000, outflow: 106_200 },
    { id: SAVINGS_ID, close: 264_318.75, step: 20_900, inflow: 21_800, outflow: 900 },
  ]) {
    for (let i = 0; i < 12; i += 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const closing = round(acct.close - acct.step * i);
      out.push({
        id: `st-${acct.id}-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        accountId: acct.id,
        period: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        issuedAt: new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString(),
        openingBalance: round(closing - acct.step),
        closingBalance: closing,
        moneyIn: acct.inflow,
        moneyOut: acct.outflow,
      });
    }
  }
  return out;
};

const round = (n: number) => Math.round(n * 100) / 100;

export const seedNotifications = (): AppNotification[] => [
  {
    id: "n1",
    kind: "deposit",
    title: "Deposit received",
    body: `Your weekly deposit of $30,000.00 from ${EMPLOYER} has arrived in Auremont Checking ••7770.`,
    date: AT(lastThursday(), 8, 14),
    read: false,
    href: "/accounts/acct-checking",
  },
  {
    id: "n2",
    kind: "transaction",
    title: "Netflix payment processed",
    body: "A card payment of $22.99 to Netflix was processed on Card ••7770.",
    date: AT(2, 19, 4),
    read: false,
  },
  {
    id: "n3",
    kind: "security",
    title: "New sign-in to your account",
    body: "Your account was accessed from iPhone 15 Pro in Charlotte, NC. If this wasn't you, review your devices.",
    date: AT(3, 7, 41),
    read: false,
    href: "/security/activity",
  },
  {
    id: "n4",
    kind: "transaction",
    title: "Uber payment processed",
    body: "A card payment of $18.42 to Uber is pending on Card ••7770.",
    date: AT(0, 9, 22),
    read: true,
  },
  {
    id: "n5",
    kind: "account",
    title: "Statement ready",
    body: "Your latest statement for Auremont Checking ••7770 is available to download.",
    date: AT(9, 6, 0),
    read: true,
    href: "/documents",
  },
  {
    id: "n7",
    kind: "payment",
    title: "Autopay scheduled",
    body: "Rent of $4,200.00 to Ridgeline Residences is scheduled from Checking ••7770.",
    date: AT(4, 7, 30),
    read: true,
    href: "/payments/scheduled",
  },
  {
    id: "n8",
    kind: "promotion",
    title: "Premier Savings rate held at 4.15%",
    body: "Your Premier Savings APY stays at 4.15% through the next statement period.",
    date: AT(15, 9, 0),
    read: true,
    href: "/accounts/acct-savings",
  },
  {
    id: "n6",
    kind: "deposit",
    title: "Interest paid",
    body: "$902.41 in interest was credited to Auremont Premier Savings ••4412.",
    date: AT(8, 6, 30),
    read: true,
  },
];

export const seedDevices = (): Device[] => [
  { id: "d1", name: "iPhone 15 Pro", platform: "iOS 18.2 · Auremont app", location: "Charlotte, NC", lastActive: AT(0, 9, 12), current: true },
  { id: "d2", name: "MacBook Pro", platform: "Safari · macOS", location: "Charlotte, NC", lastActive: AT(2, 14, 30), current: false },
  { id: "d3", name: "iPad Air", platform: "iPadOS · Auremont app", location: "Raleigh, NC", lastActive: AT(12, 20, 5), current: false },
];

export const DEFAULT_PREFERENCES: Preferences = {
  theme: "light",
  biometric: true,
  twoFactor: true,
  pushTransactions: true,
  pushSecurity: true,
  pushPayments: true,
  pushMarketing: false,
  emailStatements: true,
  hideBalancesOnOpen: false,
  privateActivity: false,
  shareAnalytics: false,
};
