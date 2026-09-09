"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { mobileNav } from "./nav-items";
import { cn } from "@/lib/utils";

export function BottomNav({ onMore }: { onMore: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="glass fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-3xl px-1 py-2 shadow-float-lg lg:hidden">
      {mobileNav.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="relative flex flex-col items-center gap-0.5 rounded-2xl px-3 py-1.5"
          >
            {active && (
              <motion.span
                layoutId="bottomnav-active"
                className="absolute inset-0 rounded-2xl bg-brand-50"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <item.icon
              className={cn(
                "relative z-10 h-5 w-5",
                active ? "text-brand-600" : "text-ink-400"
              )}
            />
            <span
              className={cn(
                "relative z-10 text-[10px] font-semibold",
                active ? "text-brand-700" : "text-ink-400"
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
      <button
        onClick={onMore}
        className="relative flex flex-col items-center gap-0.5 rounded-2xl px-3 py-1.5 cursor-pointer"
      >
        <Menu className="h-5 w-5 text-ink-400" />
        <span className="text-[10px] font-semibold text-ink-400">More</span>
      </button>
    </nav>
  );
}
