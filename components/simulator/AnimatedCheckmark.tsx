"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface AnimatedCheckmarkProps {
  color: string;
  glow: string;
  reduceMotion?: boolean;
  className?: string;
}

export function AnimatedCheckmark({
  color,
  glow,
  reduceMotion = false,
  className = "",
}: AnimatedCheckmarkProps) {
  if (reduceMotion) {
    return (
      <div
        className={`grid place-items-center rounded-full ${className}`}
        style={{ backgroundColor: glow, color }}
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
        backgroundColor: glow,
        color,
        boxShadow: `0 0 28px ${glow}`,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: [0.8, 1.05, 1],
        opacity: 1,
        boxShadow: [`0 0 0 ${glow}`, `0 0 22px ${glow}`, `0 0 12px ${glow}`],
      }}
      transition={{
        duration: 0.32,
        ease: "easeOut",
      }}
      aria-hidden="true"
    >
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity }}
      >
        <Check className="size-4" strokeWidth={2.7} />
      </motion.div>
    </motion.div>
  );
}
