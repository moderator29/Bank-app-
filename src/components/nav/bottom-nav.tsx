"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { isActive, tabNav } from "./nav-items";
import { cn } from "@/lib/utils";

/** Floating glass tab bar — always within thumb reach, never crowded. */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 px-3 pb-safe lg:hidden"
    >
      <div className="glass-nav mx-auto mb-2.5 flex max-w-md items-center justify-between gap-0.5 rounded-3xl p-1.5">
        {tabNav.map((item) => {
          const active = isActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="press relative flex flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-2"
            >
              {active && (
                <motion.span
                  layoutId="tab-active"
                  transition={{ type: "spring", stiffness: 460, damping: 36 }}
                  className="absolute inset-0 rounded-2xl bg-ink-900/6"
                />
              )}
              <item.icon
                className={cn(
                  "relative z-10 h-[19px] w-[19px] transition-colors",
                  active ? "text-ink-900" : "text-ink-400"
                )}
              />
              <span
                className={cn(
                  "relative z-10 text-[10px] font-semibold tracking-tight transition-colors",
                  active ? "text-ink-900" : "text-ink-400"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
