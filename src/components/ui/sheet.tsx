"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Bottom sheet on mobile, centred dialog from `sm` up — one component so
 * confirmations feel native on a phone and considered on a desktop.
 */
export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-60 flex items-end justify-center sm:items-center sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink-950/45 backdrop-blur-[3px]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: "100%", opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.6 }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            className={cn(
              "relative w-full max-w-md rounded-t-3xl border border-line bg-surface pb-safe shadow-e3",
              "sm:rounded-3xl",
              className
            )}
          >
            <div className="mx-auto mt-2.5 h-1 w-9 rounded-3xl bg-ink-200 sm:hidden" />
            <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-4">
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-ink-900">{title}</h3>
                {description && <p className="mt-1 text-sm text-ink-400">{description}</p>}
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="press -mr-1 -mt-1 rounded-sm p-2 text-ink-400 hover:bg-ink-50 hover:text-ink-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 pb-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
