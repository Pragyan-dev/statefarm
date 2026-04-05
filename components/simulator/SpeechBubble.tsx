"use client";

import type { CSSProperties, ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { useAccessibility } from "@/hooks/useAccessibility";

interface SpeechBubbleProps {
  label: string;
  tone?: "default" | "system";
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentKey?: string;
}

export function SpeechBubble({
  label,
  tone = "default",
  children,
  footer,
  className = "",
  contentKey,
}: SpeechBubbleProps) {
  const { settings } = useAccessibility();
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = Boolean(settings.reducedMotion || prefersReducedMotion);
  const surfaceColor = tone === "system" ? "#FCFBF7" : "#FFFDF8";

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, scale: 0.95, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className={`relative ${className}`}
    >
      <div
        className="relative overflow-visible rounded-[2rem] border-[2px] border-black px-5 py-5 shadow-[0_24px_70px_rgba(17,24,39,0.14)] md:px-6 md:py-6"
        style={
          {
            backgroundColor: surfaceColor,
            "--speech-bubble-surface": surfaceColor,
          } as CSSProperties
        }
      >
        <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.7),rgba(255,255,255,0))]" />

        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={contentKey ?? label}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative z-10"
          >
            <span className="inline-flex rounded-full bg-black px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.32em] text-white">
              {label}
            </span>

            <div className="mt-4 grid gap-4">{children}</div>

            {footer ? <div className="mt-5 flex justify-end">{footer}</div> : null}
          </motion.div>
        </AnimatePresence>

        <svg
          viewBox="0 0 50 40"
          className="pointer-events-none absolute left-12 top-[-24px] h-12 w-12 lg:hidden"
          aria-hidden="true"
        >
          <path d="M6 38 L25 4 L44 38 Z" fill={surfaceColor} stroke="black" strokeWidth="2.6" />
        </svg>
      </div>
    </motion.section>
  );
}
