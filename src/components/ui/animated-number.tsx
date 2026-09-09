"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { money } from "@/lib/utils";

/** Counts a balance up on first paint, then tracks changes without replaying. */
export function AnimatedMoney({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const mv = useMotionValue(value);
  const spring = useSpring(mv, { stiffness: 90, damping: 22, restDelta: 0.5 });
  const text = useTransform(spring, (v) => money(v));
  const started = useRef(false);

  useEffect(() => {
    if (!started.current) {
      started.current = true;
      mv.jump(value * 0.88);
    }
    mv.set(value);
  }, [value, mv]);

  return <motion.span className={className}>{text}</motion.span>;
}
