"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  hover?: boolean;
  delay?: number;
}

export function GlassCard({
  className,
  hover = true,
  delay = 0,
  children,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -3 } : undefined}
      className={cn(
        "glass rounded-4xl shadow-float transition-shadow duration-300",
        hover && "hover:shadow-float-lg",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
