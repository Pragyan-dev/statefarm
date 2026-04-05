"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { useAccessibility } from "@/hooks/useAccessibility";

interface MascotProps {
  mascotImage: string;
  alt: string;
  width: number;
  height: number;
  mood?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export function Mascot({
  mascotImage,
  alt,
  width,
  height,
  mood,
  className = "",
  priority = false,
  sizes = "(max-width: 640px) 60vw, (max-width: 1024px) 32vw, 24rem",
}: MascotProps) {
  const { settings } = useAccessibility();
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = Boolean(settings.reducedMotion || prefersReducedMotion);

  return (
    <motion.div
      className={`relative ${className}`}
      animate={
        reduceMotion
          ? undefined
          : {
              y: [0, -8, 0, 6, 0],
              rotate: [0, -1.2, 0, 1, 0],
            }
      }
      transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={`${mascotImage}:${mood ?? "default"}`}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, scale: 0.985, y: 6 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="relative h-full w-full"
        >
          <Image
            src={mascotImage}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            className="h-full w-full object-contain drop-shadow-[0_24px_34px_rgba(17,24,39,0.16)]"
            priority={priority}
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
