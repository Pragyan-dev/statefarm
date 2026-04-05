"use client";

import { motion } from "framer-motion";

import { FloatingIcon } from "@/components/simulator/FloatingIcon";
import type { GamifiedTheme } from "@/components/simulator/gamifiedTheme";

interface FloatingParticlesProps {
  theme: GamifiedTheme;
  reduceMotion?: boolean;
  className?: string;
  density?: "low" | "medium";
}

export function FloatingParticles({
  theme,
  reduceMotion = false,
  className = "",
  density = "medium",
}: FloatingParticlesProps) {
  const [primaryIcon, secondaryIcon] = theme.accentIcons;
  const dotOpacity = density === "low" ? 0.18 : 0.24;

  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
      <FloatingIcon
        icon={primaryIcon}
        color={theme.tint}
        className="absolute right-[18%] top-[22%]"
        size={14}
        delay={0.1}
        reduceMotion={reduceMotion}
      />
      <FloatingIcon
        icon={secondaryIcon}
        color={theme.tint}
        className="absolute right-[11%] top-[29%]"
        size={12}
        delay={0.4}
        reduceMotion={reduceMotion}
      />
      <motion.span
        className="absolute right-[15%] top-[40%] h-3 w-3 rounded-full"
        style={{ backgroundColor: theme.tint }}
        animate={reduceMotion ? undefined : { y: [0, -6, 0], opacity: [dotOpacity, 0.42, dotOpacity] }}
        transition={{ duration: 2.8, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.span
        className="absolute right-[9%] top-[36%] h-2 w-2 rounded-full"
        style={{ backgroundColor: theme.arrow }}
        animate={reduceMotion ? undefined : { y: [0, 5, 0], opacity: [0.14, 0.3, 0.14] }}
        transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity, delay: 0.25 }}
      />
    </div>
  );
}
