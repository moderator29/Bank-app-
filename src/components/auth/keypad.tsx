"use client";

import { Delete, ScanFace } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

/** iPhone-style numeric keypad with generous touch targets. */
export function Keypad({
  onKey,
  onBackspace,
  onBiometric,
  disabled,
}: {
  onKey: (digit: string) => void;
  onBackspace: () => void;
  onBiometric?: () => void;
  disabled?: boolean;
}) {
  const keyClass =
    "relative flex h-16 items-center justify-center rounded-lg text-2xl font-medium text-ink-900 transition-colors duration-100 select-none";

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {KEYS.map((k) => (
        <motion.button
          key={k}
          type="button"
          disabled={disabled}
          onClick={() => onKey(k)}
          whileTap={{ scale: 0.94, backgroundColor: "rgb(219 225 234)" }}
          transition={{ duration: 0.08 }}
          className={cn(keyClass, "bg-surface border border-line shadow-e1")}
        >
          {k}
        </motion.button>
      ))}

      {onBiometric ? (
        <motion.button
          type="button"
          disabled={disabled}
          onClick={onBiometric}
          whileTap={{ scale: 0.94 }}
          className={cn(keyClass, "text-ink-500 hover:bg-ink-50")}
          aria-label="Use Face ID"
        >
          <ScanFace className="h-6 w-6" />
        </motion.button>
      ) : (
        <span />
      )}

      <motion.button
        type="button"
        disabled={disabled}
        onClick={() => onKey("0")}
        whileTap={{ scale: 0.94, backgroundColor: "rgb(219 225 234)" }}
        transition={{ duration: 0.08 }}
        className={cn(keyClass, "bg-surface border border-line shadow-e1")}
      >
        0
      </motion.button>

      <motion.button
        type="button"
        disabled={disabled}
        onClick={onBackspace}
        whileTap={{ scale: 0.94 }}
        className={cn(keyClass, "text-ink-500 hover:bg-ink-50")}
        aria-label="Delete"
      >
        <Delete className="h-6 w-6" />
      </motion.button>
    </div>
  );
}

/** Six passcode indicators — fill as digits land, shake on a wrong code. */
export function PasscodeDots({
  length,
  filled,
  error,
}: {
  length: number;
  filled: number;
  error?: boolean;
}) {
  return (
    <motion.div
      animate={error ? { x: [0, -9, 8, -6, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.42, ease: "easeInOut" }}
      className="flex items-center justify-center gap-3.5"
      aria-live="polite"
    >
      {Array.from({ length }).map((_, i) => {
        const on = i < filled;
        return (
          <motion.span
            key={i}
            animate={{ scale: on ? 1 : 0.82 }}
            transition={{ type: "spring", stiffness: 520, damping: 24 }}
            className={cn(
              "h-3 w-3 rounded-3xl border transition-colors duration-150",
              error
                ? "border-neg-500 bg-neg-500"
                : on
                  ? "border-ink-900 bg-ink-900"
                  : "border-ink-200 bg-transparent"
            )}
          />
        );
      })}
    </motion.div>
  );
}
