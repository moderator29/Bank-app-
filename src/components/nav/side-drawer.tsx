"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Lock, LogOut, X } from "lucide-react";
import { drawerGroups, isActive } from "./nav-items";
import { Avatar } from "@/components/ui/avatar";
import { useBank } from "@/lib/store";
import { unreadCount } from "@/lib/selectors";
import { cn, formatDate, money } from "@/lib/utils";
import { totalDeposits } from "@/lib/selectors";

/**
 * The drawer holds everything the four tabs don't: an identity header, then
 * grouped destinations with generous rows. Slides from the left, dismisses
 * on backdrop, Escape or navigation.
 */
export function SideDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useBank((s) => s.user);
  const unread = useBank(unreadCount);
  const total = useBank(totalDeposits);
  const hidden = useBank((s) => s.balanceHidden);
  const lock = useBank((s) => s.lock);
  const signOut = useBank((s) => s.signOut);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-60 lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink-950/55 backdrop-blur-[3px]"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="edge panel-over-scrim absolute inset-y-0 left-0 flex w-[86%] max-w-[340px] flex-col rounded-r-3xl"
          >
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="press absolute right-3 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-md text-ink-400 hover:bg-ink-50 hover:text-ink-900"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="no-scrollbar flex-1 overflow-y-auto pt-safe">
              {/* Identity */}
              <div className="px-6 pb-6 pt-7">
                <Avatar name={user.name} size="xl" className="mb-4" />
                <p className="font-display text-xl font-semibold leading-tight text-ink-900">
                  {user.name}
                </p>
                <p className="mt-1 truncate text-sm text-ink-400">{user.email}</p>

                <div className="mt-4 flex items-baseline gap-5">
                  <span className="text-sm text-ink-400">
                    <span className="tnum font-semibold text-ink-900">
                      {hidden ? "•••" : money(total, { compact: true })}
                    </span>{" "}
                    total
                  </span>
                  <span className="text-sm text-ink-400">
                    Member since{" "}
                    <span className="font-semibold text-ink-900">
                      {new Date(user.memberSince).getFullYear()}
                    </span>
                  </span>
                </div>

                <Link
                  href="/profile"
                  onClick={onClose}
                  className="press mt-5 flex items-center justify-between gap-3 edge glass-sunken relative rounded-xl px-4 py-3"
                >
                  <span className="text-sm font-semibold text-ink-800">View profile</span>
                  <ChevronRight className="h-4 w-4 text-ink-300" />
                </Link>
              </div>

              <div className="mx-6 border-t border-line" />

              {/* Grouped destinations */}
              <nav className="px-3 py-5">
                {drawerGroups.map((group, gi) => (
                  <div key={group.label} className={gi > 0 ? "mt-6" : undefined}>
                    <p className="mb-1 px-3 text-xs font-semibold tracking-[0.02em] text-ink-400">
                      {group.label}
                    </p>
                    {group.items.map((item, i) => {
                      const active = isActive(pathname, item);
                      return (
                        <motion.div
                          key={item.href}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.04 + (gi * 4 + i) * 0.018, duration: 0.26 }}
                        >
                          <Link
                            href={item.href}
                            onClick={onClose}
                            className={cn(
                              "flex items-center gap-4 rounded-xl px-3 py-3.5 transition-colors",
                              active
                                ? "bg-ink-900/6 text-ink-900"
                                : "text-ink-700 hover:bg-ink-900/4"
                            )}
                          >
                            <item.icon className="h-5 w-5 shrink-0 text-ink-600" />
                            <span className="flex-1 text-[17px] font-medium tracking-tight">
                              {item.label}
                            </span>
                            {item.href === "/notifications" && unread > 0 && (
                              <span className="tnum flex h-5 min-w-5 items-center justify-center rounded-3xl bg-brass-400/20 px-1.5 text-2xs font-bold text-brass-600">
                                {unread}
                              </span>
                            )}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                ))}
              </nav>
            </div>

            {/* Session */}
            <div className="border-t border-line px-3 py-3 pb-safe">
              <button
                onClick={() => {
                  onClose();
                  lock();
                  router.push("/passcode");
                }}
                className="flex w-full items-center gap-4 rounded-xl px-3 py-3 text-left text-ink-700 transition-colors hover:bg-ink-900/4"
              >
                <Lock className="h-5 w-5 text-ink-600" />
                <span className="text-[17px] font-medium">Lock app</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  signOut();
                  router.push("/signin");
                }}
                className="flex w-full items-center gap-4 rounded-xl px-3 py-3 text-left text-neg-500 transition-colors hover:bg-neg-50"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-[17px] font-medium">Sign out</span>
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
