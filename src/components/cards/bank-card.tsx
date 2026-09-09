"use client";

import { motion } from "framer-motion";
import { Snowflake, Wifi } from "lucide-react";
import type { Card } from "@/lib/types";
import { LogoMark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

/**
 * The Auremont card face. Navy field, engraved guilloche, brass keyline —
 * the same identity as the app, in physical form.
 */
export function BankCard({
  card,
  revealed,
  size = "lg",
  className,
}: {
  card: Card;
  /** When true the real number, expiry and CVV are shown. */
  revealed?: boolean;
  size?: "sm" | "lg";
  className?: string;
}) {
  const frozen = card.frozen;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, rotateX: 6 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "surface-navy card-guilloche keyline-brass relative w-full overflow-hidden shadow-card",
        size === "lg" ? "rounded-2xl" : "rounded-xl",
        className
      )}
      style={{ aspectRatio: "1.586 / 1" }}
    >
      <div
        className={cn(
          "relative z-10 flex h-full flex-col justify-between",
          size === "lg" ? "p-5 sm:p-6" : "p-4"
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <LogoMark className={size === "lg" ? "h-8 w-8" : "h-7 w-7"} />
            <div className="leading-none">
              <p
                className={cn(
                  "font-semibold tracking-[0.22em] text-white",
                  size === "lg" ? "text-xs" : "text-2xs"
                )}
              >
                AUREMONT
              </p>
              <p className="mt-1 text-[8px] font-medium tracking-[0.3em] text-brass-200/70">
                {card.product.toUpperCase()}
              </p>
            </div>
          </div>
          {card.limits.contactless && !frozen && (
            <Wifi
              className={cn("rotate-90 text-white/35", size === "lg" ? "h-5 w-5" : "h-4 w-4")}
            />
          )}
        </div>

        <div>
          {/* Chip */}
          {size === "lg" && (
            <div className="mb-4 h-7 w-10 rounded-sm bg-gradient-to-br from-brass-200 to-brass-500 opacity-90" />
          )}
          <p
            className={cn(
              "tnum font-medium text-white",
              size === "lg" ? "text-lg tracking-[0.14em] sm:text-xl" : "text-sm tracking-[0.1em]"
            )}
          >
            {revealed ? card.number : `•••• •••• •••• ${card.mask}`}
          </p>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[8px] font-medium uppercase tracking-[0.16em] text-white/40">
              Cardholder
            </p>
            <p
              className={cn(
                "mt-0.5 truncate font-medium tracking-wide text-white/90",
                size === "lg" ? "text-xs" : "text-2xs"
              )}
            >
              {card.holder}
            </p>
          </div>
          <div className="flex shrink-0 gap-4">
            <div>
              <p className="text-[8px] font-medium uppercase tracking-[0.16em] text-white/40">
                Expires
              </p>
              <p className="tnum mt-0.5 text-xs font-medium text-white/90">{card.expiry}</p>
            </div>
            {revealed && (
              <div>
                <p className="text-[8px] font-medium uppercase tracking-[0.16em] text-white/40">
                  CVV
                </p>
                <p className="tnum mt-0.5 text-xs font-medium text-white/90">{card.cvv}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Frozen state reads instantly, without hiding the card. */}
      {frozen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-ink-950/55 backdrop-blur-[2px]"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-3xl bg-white/12 text-white">
            <Snowflake className="h-5 w-5" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white">
            {card.status === "replacing" ? "Being replaced" : "Frozen"}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
