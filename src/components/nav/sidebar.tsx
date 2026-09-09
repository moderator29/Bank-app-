"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { isActive, sidebarGroups } from "./nav-items";
import { useBank } from "@/lib/store";
import { cn, initials, money } from "@/lib/utils";
import { totalDeposits } from "@/lib/selectors";

/** Desktop navigation: grouped, quiet, with the household total at the foot. */
export function Sidebar() {
  const pathname = usePathname();
  const user = useBank((s) => s.user);
  const total = useBank(totalDeposits);
  const hidden = useBank((s) => s.balanceHidden);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-line bg-surface lg:flex">
      <div className="px-5 py-6">
        <Link href="/home" aria-label="Auremont Bank home">
          <Logo />
        </Link>
      </div>

      <nav className="no-scrollbar flex-1 space-y-6 overflow-y-auto px-3 pb-4">
        {sidebarGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-3 text-2xs font-semibold uppercase tracking-[0.12em] text-ink-400">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active ? "text-ink-900" : "text-ink-500 hover:bg-ink-25 hover:text-ink-800"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="sidebar-active"
                        transition={{ type: "spring", stiffness: 460, damping: 38 }}
                        className="absolute inset-0 rounded-md bg-ink-50"
                      />
                    )}
                    <item.icon className="relative z-10 h-[17px] w-[17px]" />
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <Link
        href="/profile"
        className="press m-3 flex items-center gap-3 edge glass-sunken relative rounded-xl p-3 hover:brightness-[1.03]"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-ink-900 text-xs font-semibold text-brass-200">
          {initials(user.name)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-ink-900">{user.name}</span>
          <span className="tnum block text-2xs text-ink-400">
            {hidden ? "•••••••" : `${money(total, { compact: true })} total`}
          </span>
        </span>
        <ChevronRight className="h-4 w-4 text-ink-300" />
      </Link>
    </aside>
  );
}
