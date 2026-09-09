import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Bell,
  Gift,
  LayoutDashboard,
  LifeBuoy,
  LineChart,
  Lock,
  Percent,
  PiggyBank,
  Settings,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

// Primary items shown in the desktop sidebar
export const primaryNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Savings", href: "/savings", icon: PiggyBank },
  { label: "Locked Savings", href: "/locked-savings", icon: Lock },
  { label: "APY Earnings", href: "/apy-earnings", icon: Percent },
  { label: "Investments", href: "/investments", icon: LineChart },
  { label: "Deposit", href: "/deposit", icon: ArrowDownToLine },
  { label: "Withdraw", href: "/withdraw", icon: ArrowUpFromLine },
  { label: "Rewards", href: "/rewards", icon: Gift },
  { label: "Referrals", href: "/referrals", icon: Users },
];

// Secondary items (bottom of sidebar + inside the More drawer)
export const secondaryNav: NavItem[] = [
  { label: "Profile", href: "/profile", icon: User },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Support", href: "/support", icon: LifeBuoy },
  { label: "Settings", href: "/settings", icon: Settings },
];

// Mobile bottom navigation (4 tabs + More)
export const mobileNav: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Savings", href: "/savings", icon: PiggyBank },
  { label: "Locked", href: "/locked-savings", icon: Lock },
  { label: "Invest", href: "/investments", icon: LineChart },
];
