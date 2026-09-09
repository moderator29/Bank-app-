"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { isActive, tabNav } from "./nav-items";
import { cn } from "@/lib/utils";

/**
 * A floating glass capsule holding the four tabs, with search detached into
 * its own round button alongside — both within thumb reach, neither crowded.
 */
export function BottomNav() {
  const pathname = usePathname();
  const searching = pathname.startsWith("/search");

  return (
    <nav
      aria-label="Primary"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-safe lg:hidden"
    >
      <div className="mx-auto mb-3 flex max-w-md items-center gap-2.5">
        <div className="edge glass-nav pointer-events-auto relative flex flex-1 items-center gap-0.5 rounded-3xl p-1.5">
          {tabNav.map((item) => {
            const active = isActive(pathname, item) && !searching;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="press relative flex flex-1 flex-col items-center gap-1 rounded-3xl px-1 py-2"
              >
                {active && (
                  <motion.span
                    layoutId="tab-active"
                    transition={{ type: "spring", stiffness: 480, damping: 38 }}
                    className="absolute inset-0 rounded-3xl border border-brass-400/35 bg-brass-400/12"
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

        <Link
          href="/search"
          aria-label="Search"
          aria-current={searching ? "page" : undefined}
          className={cn(
            "edge glass-nav press pointer-events-auto relative flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-3xl",
            searching && "bg-brass-400/14"
          )}
        >
          <Search
            className={cn(
              "h-[21px] w-[21px] transition-colors",
              searching ? "text-ink-900" : "text-ink-500"
            )}
          />
        </Link>
      </div>
    </nav>
  );
}
