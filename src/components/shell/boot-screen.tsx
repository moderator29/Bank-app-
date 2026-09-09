"use client";

import { motion } from "framer-motion";
import { LogoMark } from "@/components/brand/logo";

/** Shown while the persisted session rehydrates — keeps launch calm. */
export function BootScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: [0.55, 1, 0.55], scale: 1 }}
        transition={{
          opacity: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        }}
      >
        <LogoMark className="h-12 w-12" />
      </motion.div>
    </div>
  );
}
