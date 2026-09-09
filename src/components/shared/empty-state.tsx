"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="glass flex flex-col items-center rounded-4xl px-8 py-14 text-center shadow-float"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-base font-bold text-ink-900">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm text-ink-400">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
