"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { primaryNav, secondaryNav } from "./nav-items";
import { useEcokripto } from "@/lib/store";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const signOut = useEcokripto((s) => s.signOut);
  const unread = useEcokripto(
    (s) => s.notifications.filter((n) => !n.read).length
  );

  return (
    <aside className="glass fixed inset-y-4 left-4 z-40 hidden w-64 flex-col rounded-4xl shadow-float lg:flex">
      <div className="px-6 pb-4 pt-7">
        <Link href="/dashboard">
          <Logo />
        </Link>
      </div>

      <nav className="scrollbar-none flex-1 space-y-1 overflow-y-auto px-3 pb-2">
        {primaryNav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-colors",
                active
                  ? "text-white"
                  : "text-ink-600 hover:bg-brand-50 hover:text-brand-700"
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 shadow-[0_8px_20px_-6px_rgb(22_136_96/0.5)]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <item.icon className="relative z-10 h-4.5 w-4.5" />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}

        <div className="mx-4 my-3 border-t border-brand-100/70" />

        {secondaryNav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-colors",
                active
                  ? "text-white"
                  : "text-ink-600 hover:bg-brand-50 hover:text-brand-700"
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 shadow-[0_8px_20px_-6px_rgb(22_136_96/0.5)]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <item.icon className="relative z-10 h-4.5 w-4.5" />
              <span className="relative z-10 flex-1">{item.label}</span>
              {item.href === "/notifications" && unread > 0 && (
                <span
                  className={cn(
                    "relative z-10 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                    active ? "bg-white/25 text-white" : "bg-brand-500 text-white"
                  )}
                >
                  {unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3">
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold text-ink-400 transition-colors hover:bg-red-50 hover:text-red-500 cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
