"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "@/components/nav/sidebar";
import { BottomNav } from "@/components/nav/bottom-nav";
import { MoreDrawer } from "@/components/nav/more-drawer";
import { Topbar } from "@/components/nav/topbar";
import { LogoMark } from "@/components/brand/logo";
import { useEcokripto } from "@/lib/store";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const user = useEcokripto((s) => s.user);
  const hydrated = useEcokripto((s) => s.hydrated);
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!hydrated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <LogoMark className="h-14 w-14" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <MoreDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <div className="px-4 pb-28 pt-5 sm:px-6 lg:ml-72 lg:pb-10 lg:pr-8 lg:pt-6">
        <div className="mx-auto max-w-6xl">
          <Topbar onMenu={() => setDrawerOpen(true)} />
          <AnimatePresence mode="wait">
            <motion.main
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.main>
          </AnimatePresence>
        </div>
      </div>
      <BottomNav onMore={() => setDrawerOpen(true)} />
    </div>
  );
}
