"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { primaryNav, secondaryNav } from "./nav-items";
import { useEcokripto } from "@/lib/store";
import { cn } from "@/lib/utils";

export function MoreDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const signOut = useEcokripto((s) => s.signOut);
  const items = [...primaryNav, ...secondaryNav];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-emerald-950/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="glass absolute inset-y-0 right-0 flex w-[85%] max-w-sm flex-col bg-white/85 shadow-float-lg"
          >
            <div className="flex items-center justify-between px-5 pb-3 pt-6">
              <Logo />
              <button
                onClick={onClose}
                className="rounded-xl p-2 text-ink-400 hover:bg-brand-50 hover:text-ink-900 cursor-pointer"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="scrollbar-none flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
              {items.map((item, i) => {
                const active = pathname === item.href;
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.03 * i, duration: 0.3 }}
                  >
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors",
                        active
                          ? "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-[0_8px_20px_-6px_rgb(22_136_96/0.5)]"
                          : "text-ink-600 hover:bg-brand-50 hover:text-brand-700"
                      )}
                    >
                      <item.icon className="h-4.5 w-4.5" />
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
            <div className="p-3 pb-6">
              <button
                onClick={() => {
                  onClose();
                  signOut();
                }}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-ink-400 hover:bg-red-50 hover:text-red-500 cursor-pointer"
              >
                <LogOut className="h-4.5 w-4.5" />
                Sign out
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
