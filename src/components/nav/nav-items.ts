import {
  ArrowLeftRight,
  ChartPie,
  CreditCard,
  FileText,
  Headphones,
  House,
  Landmark,
  ListOrdered,
  Plus,
  Receipt,
  Settings,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Also treat these prefixes as this tab being active. */
  match?: string[];
}

/** Five tabs, and only five — everything else lives behind a hub. */
export const tabNav: NavItem[] = [
  { label: "Home", href: "/home", icon: House },
  { label: "Accounts", href: "/accounts", icon: Landmark, match: ["/accounts", "/cards"] },
  { label: "Pay", href: "/payments", icon: ArrowLeftRight, match: ["/payments", "/deposit"] },
  { label: "Activity", href: "/activity", icon: ListOrdered, match: ["/activity", "/insights"] },
  { label: "Profile", href: "/profile", icon: UserRound, match: ["/profile", "/settings", "/security", "/support", "/documents"] },
];

export const sidebarGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Banking",
    items: [
      { label: "Home", href: "/home", icon: House },
      { label: "Accounts", href: "/accounts", icon: Landmark },
      { label: "Cards", href: "/cards", icon: CreditCard },
      { label: "Activity", href: "/activity", icon: ListOrdered },
      { label: "Insights", href: "/insights", icon: ChartPie },
    ],
  },
  {
    label: "Move money",
    items: [
      { label: "Payments", href: "/payments", icon: ArrowLeftRight },
      { label: "Bills", href: "/payments/bills", icon: Receipt },
      { label: "Add money", href: "/deposit", icon: Plus },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Documents", href: "/documents", icon: FileText },
      { label: "Security", href: "/security", icon: ShieldCheck },
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "Support", href: "/support", icon: Headphones },
    ],
  },
];

export function isActive(pathname: string, item: NavItem) {
  const prefixes = item.match ?? [item.href];
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
