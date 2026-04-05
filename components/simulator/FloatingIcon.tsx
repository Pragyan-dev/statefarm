"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface FloatingIconProps {
  icon: LucideIcon;
  size?: number;
  color: string;
  className?: string;
  delay?: number;
  reduceMotion?: boolean;
}

export function FloatingIcon({
  icon: Icon,
  size = 18,
  color,
  className = "",
  delay = 0,
  reduceMotion = false,
}: FloatingIconProps) {
  if (reduceMotion) {
    return (
      <span className={`inline-flex items-center justify-center ${className}`} style={{ color }}>
        <Icon size={size} strokeWidth={1.8} />
      </span>
    );
  }

  return (
    <motion.span
      className={`inline-flex items-center justify-center ${className}`}
      style={{ color }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{
        opacity: [0.28, 0.74, 0.28],
        y: [0, -7, 0],
        scale: [0.88, 1.04, 0.88],
        rotate: [-4, 6, -4],
      }}
      transition={{
        duration: 2.8,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      aria-hidden="true"
    >
      <Icon size={size} strokeWidth={1.8} />
    </motion.span>
  );
}
