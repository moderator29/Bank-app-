"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { formatCurrency } from "@/lib/utils";

export function AnimatedCurrency({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 65, damping: 20 });
  const display = useTransform(spring, (v) => formatCurrency(v));
  const started = useRef(false);

  useEffect(() => {
    if (!started.current) {
      started.current = true;
      mv.jump(value * 0.6);
    }
    mv.set(value);
  }, [value, mv]);

  return <motion.span className={className}>{display}</motion.span>;
}
