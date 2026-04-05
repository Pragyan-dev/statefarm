"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

import type { Speaker } from "@/types/simulator";

interface DialogueTextProps {
  speaker: Speaker;
  text: string;
  canAdvance?: boolean;
  allowTapAdvance?: boolean;
  onAdvance?: () => void;
  onTypingChange?: (done: boolean) => void;
}

export function DialogueText({
  speaker,
  text,
  canAdvance = false,
  allowTapAdvance = false,
  onAdvance,
  onTypingChange,
}: DialogueTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = Boolean(prefersReducedMotion);
  const isDone = true;

  useEffect(() => {
    onTypingChange?.(true);
  }, [onTypingChange, text]);

  function handlePress() {
    if (allowTapAdvance && canAdvance && onAdvance) {
      onAdvance();
    }
  }

  return (
    <button type="button" onClick={handlePress} className="w-full text-left">
      <motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        aria-live="polite"
        className={`text-base leading-8 text-black md:text-[1.15rem] ${
          speaker === "system" ? "font-mono text-[0.95rem] tracking-[0.01em] text-black/78" : ""
        }`}
      >
        {text}
      </motion.p>

      {isDone && allowTapAdvance && canAdvance ? (
        <div className="mt-3 flex justify-end">
          <span className="sim-continue-indicator text-sm font-bold text-black/45">▼</span>
        </div>
      ) : null}
    </button>
  );
}
