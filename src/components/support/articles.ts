import {
  ArrowLeftRight,
  CreditCard,
  Landmark,
  PiggyBank,
  Receipt,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export type SupportTopicId =
  | "cards"
  | "transfers"
  | "payments"
  | "accounts"
  | "security"
  | "deposits";

export interface SupportTopic {
  id: SupportTopicId;
  label: string;
  blurb: string;
  icon: LucideIcon;
}

export interface SupportArticle {
  id: string;
  topic: SupportTopicId;
  title: string;
  summary: string;
  /** Two to four short paragraphs — the full answer, not a teaser. */
  body: string[];
}

export const SUPPORT_TOPICS: SupportTopic[] = [
  {
    id: "cards",
    label: "Cards",
    blurb: "Freezing, limits and replacements",
    icon: CreditCard,
  },
  {
    id: "transfers",
    label: "Transfers",
    blurb: "Moving money in and out",
    icon: ArrowLeftRight,
  },
  {
    id: "payments",
    label: "Payments",
    blurb: "Bills, autopay and recipients",
    icon: Receipt,
  },
  {
    id: "accounts",
    label: "Accounts",
    blurb: "Balances, statements and details",
    icon: Landmark,
  },
  {
    id: "security",
    label: "Security",
    blurb: "Passcode, devices and fraud",
    icon: ShieldCheck,
  },
  {
    id: "deposits",
    label: "Deposits",
    blurb: "Direct deposit and check deposits",
    icon: PiggyBank,
  },
];

export const SUPPORT_ARTICLES: SupportArticle[] = [
  {
    id: "freeze-card",
    topic: "cards",
    title: "How do I freeze or unfreeze my card?",
    summary: "Stop new charges instantly without cancelling the card.",
    body: [
      "Open Cards, choose the card you want to pause, then use Freeze card. The change takes effect immediately — new purchases, ATM withdrawals and contactless taps are declined while the freeze is on.",
      "Payments you have already authorised, such as a scheduled bill or a recurring subscription tied to that card, still go through. If you want those stopped as well, cancel the recurring payment from Payments → Scheduled.",
      "Unfreezing works the same way and is also instant. If your card is genuinely lost or stolen, order a replacement instead — that permanently retires the old number.",
    ],
  },
  {
    id: "replace-card",
    topic: "cards",
    title: "Ordering a replacement card",
    summary: "What happens after you report a card lost or damaged.",
    body: [
      "From the card's page, choose Replace card. We retire the existing number straight away and freeze the card so nothing further can be charged to it.",
      "A new card is printed and dispatched the same business day and typically arrives within three to five business days at the address on your profile. Check that address under Profile → Personal information before you order.",
      "Any recurring payments attached to the old number need to be updated with your new card details once it arrives and is activated.",
    ],
  },
  {
    id: "card-limits",
    topic: "cards",
    title: "Changing your spending and ATM limits",
    summary: "Set daily limits and control contactless or international use.",
    body: [
      "Card controls let you set a daily purchase limit and a separate daily ATM withdrawal limit. Limits reset at midnight in your account's time zone.",
      "You can also switch online purchases, contactless and international use on or off individually. Turning international use off is a sensible precaution when you are not travelling.",
      "Limit changes apply within a few seconds. If a purchase is declined by a limit you have set, raising the limit and retrying usually resolves it.",
    ],
  },
  {
    id: "transfer-timing",
    topic: "transfers",
    title: "When will my transfer arrive?",
    summary: "Timings for internal moves and external bank transfers.",
    body: [
      "Transfers between your own Auremont accounts post immediately and the new balances are available straight away.",
      "Transfers to a linked account at another bank travel over the ACH network and settle in one to three business days. Requests submitted after 5:00 pm ET, or on a weekend or federal holiday, begin processing the next business day.",
      "A transfer shows as pending until it settles. You can follow it in Activity, and we notify you the moment it clears.",
    ],
  },
  {
    id: "link-external",
    topic: "transfers",
    title: "Linking an account at another bank",
    summary: "How verification works and how long it takes.",
    body: [
      "Go to Accounts → Linked accounts and add the institution, routing number and account number. Most links verify within a minute.",
      "Occasionally we place two small deposits into the external account to confirm ownership. They appear within one to two business days and you confirm the amounts to finish linking.",
      "Linked accounts can be removed at any time. Removing one does not cancel transfers that have already been submitted.",
    ],
  },
  {
    id: "transfer-limits",
    topic: "transfers",
    title: "Transfer limits and how to raise them",
    summary: "Daily and monthly ceilings on outbound transfers.",
    body: [
      "Outbound transfers to external accounts are subject to a daily and a rolling thirty-day limit. Internal transfers between your Auremont accounts are not limited.",
      "If a transfer would exceed a limit you will see the ceiling before you confirm, so nothing is submitted by surprise.",
      "Start a conversation with us if you need a higher limit for a specific payment — house purchases and tax payments are common reasons — and we will review it with you.",
    ],
  },
  {
    id: "autopay",
    topic: "payments",
    title: "Setting up autopay for a bill",
    summary: "Pay a biller automatically each month from the account you choose.",
    body: [
      "Open the bill under Payments → Bills and switch Autopay on. We pay the statement amount from your chosen account on the due date.",
      "We check the funding account the morning of the payment. If the balance is short, we notify you and hold the payment rather than overdrawing the account.",
      "Switching autopay off takes effect immediately for any payment not yet submitted.",
    ],
  },
  {
    id: "add-recipient",
    topic: "payments",
    title: "Adding and managing recipients",
    summary: "Send money to a person or a company you pay regularly.",
    body: [
      "Add a recipient from Payments → Send, entering their name and either their account details, phone number or email address.",
      "The first payment to a new recipient is reviewed briefly before it is released. Later payments to the same recipient send without that pause.",
      "Mark recipients you use often as favourites so they appear at the top of the send screen.",
    ],
  },
  {
    id: "cancel-payment",
    topic: "payments",
    title: "Cancelling or changing a scheduled payment",
    summary: "What you can change, and until when.",
    body: [
      "Scheduled payments can be edited or cancelled up until they begin processing, which is 5:00 pm ET on the day before the payment date.",
      "Once a payment has been submitted it cannot be recalled. If a payment has already gone out in error, start a conversation with us and we will contact the receiving bank on your behalf.",
      "Cancelling a single occurrence of a recurring payment leaves the rest of the series in place.",
    ],
  },
  {
    id: "statements",
    topic: "accounts",
    title: "Finding your statements",
    summary: "Twelve months of statements are always available.",
    body: [
      "Statements are published on the first of each month for the month before and live under Documents. Choose the account, then the period you need.",
      "Each statement shows the opening and closing balance, everything paid in and out, and the transactions behind those totals.",
      "Turn on Email statements under Settings → Notifications if you would like a copy sent to you as soon as each one is published.",
    ],
  },
  {
    id: "routing",
    topic: "accounts",
    title: "Your account and routing numbers",
    summary: "Where to find the details an employer or biller asks for.",
    body: [
      "Open the account from the Accounts tab and choose Account details. Your routing number and full account number are shown there after a passcode check.",
      "The routing number identifies Auremont Bank and is the same for every customer. The account number is unique to you — share it only with people and companies you intend to pay you.",
      "For payroll, most employers accept the pre-filled direct deposit summary available under Add money → Direct deposit.",
    ],
  },
  {
    id: "interest",
    topic: "accounts",
    title: "How savings interest is calculated",
    summary: "Daily accrual, monthly credit.",
    body: [
      "Premier Savings accrues interest daily on the closing balance and credits it on the last business day of each month.",
      "The annual percentage yield shown on your account page is the current rate. Rates are variable and any change is announced at least ten days before it takes effect.",
      "Interest paid to you appears in Activity as a deposit and is included in that month's statement.",
    ],
  },
  {
    id: "secure-account",
    topic: "security",
    title: "Keeping your account secure",
    summary: "The settings worth turning on today.",
    body: [
      "Use a six-digit passcode that is not a birthday or a repeated sequence, and keep biometric unlock switched on so you rarely need to type it in public.",
      "Two-step verification adds a one-time code to sign-ins from an unrecognised device. It is the single most effective control against someone reusing a stolen password.",
      "Review Security → Trusted devices from time to time and remove anything you no longer use. Sign-in activity shows where and when your account has been opened.",
    ],
  },
  {
    id: "phishing",
    topic: "security",
    title: "Spotting a message that is not from us",
    summary: "What Auremont will and will not ask you for.",
    body: [
      "We never ask for your passcode, your full card number or a one-time code — not by phone, text or email. Anyone who does is not from Auremont, however convincing they sound.",
      "We will never ask you to move money to a safe account. That request is always fraud, even if the caller knows details about you or your recent transactions.",
      "If a message makes you uneasy, close it and open the app yourself. Anything genuine from us will be waiting in your notifications.",
    ],
  },
  {
    id: "unrecognised",
    topic: "security",
    title: "You do not recognise a transaction",
    summary: "Freeze first, then tell us.",
    body: [
      "Freeze the card the charge was made on so nothing further can be taken while you look into it. Subscriptions sometimes bill under a parent company's name, so it is worth checking the merchant details on the transaction first.",
      "If it is still not yours, start a conversation with us from the transaction. We will open a dispute, provisionally credit the amount where the rules allow and keep you updated in writing.",
      "Disputes are normally resolved within ten business days, or forty-five days for more complex cases.",
    ],
  },
  {
    id: "direct-deposit",
    topic: "deposits",
    title: "Setting up direct deposit",
    summary: "Get your pay into Auremont a day or two sooner.",
    body: [
      "Open Add money → Direct deposit for a pre-filled summary with your account and routing numbers. Send it to your employer's payroll team or upload it to their portal.",
      "Payroll usually takes one or two pay cycles to switch over. We release funds as soon as your employer's file reaches us, which is often a day or two ahead of the stated pay date.",
      "You can split a deposit across your checking and savings accounts if your employer supports it — use the account details for each.",
    ],
  },
  {
    id: "check-deposit",
    topic: "deposits",
    title: "Depositing a check with your phone",
    summary: "Availability and what to do with the paper check.",
    body: [
      "Endorse the back of the check, write “For mobile deposit at Auremont Bank” beneath your signature, then photograph the front and back in good light with all four corners visible.",
      "Deposits under $25,000 are usually available the next business day. Larger deposits and checks drawn on some institutions can take a little longer, and we tell you the expected date when you submit.",
      "Keep the paper check for fourteen days after the funds appear, then destroy it. Do not deposit it again anywhere else.",
    ],
  },
  {
    id: "deposit-hold",
    topic: "deposits",
    title: "Why a deposit is on hold",
    summary: "Common reasons and how long a hold lasts.",
    body: [
      "Holds are placed on larger checks, on deposits into accounts opened in the last thirty days, and where a check has previously been returned unpaid.",
      "The expected availability date is shown on the transaction as soon as the hold is applied, and we notify you when the funds are released.",
      "If you need the funds sooner, start a conversation with us — we can sometimes shorten a hold once the paying bank confirms the check.",
    ],
  },
];

export const articlesForTopic = (topic: SupportTopicId) =>
  SUPPORT_ARTICLES.filter((a) => a.topic === topic);

export const topicById = (id: string) =>
  SUPPORT_TOPICS.find((t) => t.id === id);

export function searchArticles(query: string): SupportArticle[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return SUPPORT_ARTICLES.filter((a) =>
    `${a.title} ${a.summary} ${a.topic} ${a.body.join(" ")}`.toLowerCase().includes(q)
  ).slice(0, 8);
}
