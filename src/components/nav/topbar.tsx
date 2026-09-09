"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, Menu } from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { useEcokripto } from "@/lib/store";
import { firstName, initials } from "@/lib/utils";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const user = useEcokripto((s) => s.user);
  const unread = useEcokripto(
    (s) => s.notifications.filter((n) => !n.read).length
  );

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mb-6 flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={onMenu}
          className="glass flex h-11 w-11 items-center justify-center rounded-2xl shadow-float cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-ink-900" />
        </button>
        <Link href="/dashboard" className="sm:hidden">
          <LogoMark className="h-9 w-9" />
        </Link>
        <Link href="/dashboard" className="hidden sm:block">
          <Logo />
        </Link>
      </div>

      <div className="hidden lg:block">
        <p className="text-xs font-medium text-ink-400">{greeting},</p>
        <h2 className="text-xl font-extrabold tracking-tight text-ink-900">
          {user ? user.name : ""} <span className="align-middle">👋</span>
        </h2>
      </div>

      <div className="flex items-center gap-2.5">
        <Link
          href="/notifications"
          className="glass relative flex h-11 w-11 items-center justify-center rounded-2xl shadow-float transition-shadow hover:shadow-float-lg"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-ink-600" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white shadow">
              {unread}
            </span>
          )}
        </Link>
        <Link
          href="/profile"
          className="glass flex items-center gap-2.5 rounded-2xl py-1.5 pl-1.5 pr-4 shadow-float transition-shadow hover:shadow-float-lg"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-b from-brand-500 to-brand-700 text-xs font-bold text-white">
            {user ? initials(user.name) : ""}
          </span>
          <span className="hidden text-sm font-semibold text-ink-900 sm:block">
            {user ? firstName(user.name) : ""}
          </span>
        </Link>
      </div>
    </motion.header>
  );
}
