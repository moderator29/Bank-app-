"use client";

import { useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "@/components/nav/sidebar";
import { BottomNav } from "@/components/nav/bottom-nav";
import { SideDrawer } from "@/components/nav/side-drawer";
import { TopBar } from "@/components/nav/top-bar";
import { BootScreen } from "./boot-screen";
import { useBank } from "@/lib/store";

/**
 * Authenticated shell. Nothing renders until the persisted session has
 * rehydrated, which also keeps date-dependent content out of SSR.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const hydrated = useBank((s) => s.hydrated);
  const stage = useBank((s) => s.authStage);

  useEffect(() => {
    if (!hydrated) return;
    if (stage === "authenticated") return;
    router.replace(stage === "passcode" ? "/passcode" : "/signin");
  }, [hydrated, stage, router]);

  if (!hydrated || stage !== "authenticated") return <BootScreen />;

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="lg:pl-[248px]">
        <div className="mx-auto w-full max-w-6xl px-4 pb-28 sm:px-6 lg:px-8 lg:pb-12">
          <TopBar onMenu={() => setMenuOpen(true)} />
          <AnimatePresence mode="wait" initial={false}>
            <motion.main
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.main>
          </AnimatePresence>
        </div>
      </div>
      <BottomNav />
      <SideDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
