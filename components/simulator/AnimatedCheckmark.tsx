"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface AnimatedCheckmarkProps {
  color: string;
  glow: string;
  reduceMotion?: boolean;
  className?: string;
  mode?: "default" | "subtle";
}

export function AnimatedCheckmark({
  color,
  glow,
  reduceMotion = false,
  className = "",
  mode = "default",
}: AnimatedCheckmarkProps) {
  const isSubtle = mode === "subtle";
  const background = isSubtle
    ? `linear-gradient(180deg, rgba(255,255,255,0.92) 0%, ${glow} 100%)`
    : `linear-gradient(180deg, rgba(255,255,255,0.82) 0%, ${glow} 100%)`;
  const shadow = isSubtle
    ? `0 0 14px ${glow}, inset 0 1px 0 rgba(255,255,255,0.95)`
    : `0 0 28px ${glow}, inset 0 1px 0 rgba(255,255,255,0.92)`;

  if (reduceMotion) {
    return (
      <div
        className={`grid place-items-center rounded-full ${className}`}
        style={{ background, color, boxShadow: shadow }}
        aria-hidden="true"
      >
        <Check className="size-4" strokeWidth={2.5} />
      </div>
    );
  }

  return (
    <motion.div
      className={`grid place-items-center rounded-full ${className}`}
      style={{
        background,
        color,
        boxShadow: shadow,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: isSubtle ? [0.92, 1.02, 1] : [0.8, 1.05, 1],
        opacity: 1,
        boxShadow: isSubtle
          ? [`0 0 0 ${glow}`, `0 0 12px ${glow}`, shadow]
          : [`0 0 0 ${glow}`, `0 0 22px ${glow}`, `0 0 12px ${glow}`],
      }}
      transition={{
        duration: isSubtle ? 0.24 : 0.32,
        ease: "easeOut",
      }}
      aria-hidden="true"
    >
      <motion.div
        animate={isSubtle ? { scale: [1, 1.03, 1] } : { scale: [1, 1.08, 1] }}
        transition={{ duration: isSubtle ? 2.6 : 2.2, ease: "easeInOut", repeat: Infinity }}
      >
        <Check className="size-4" strokeWidth={2.7} />
      </motion.div>
    </motion.div>
  );
}
