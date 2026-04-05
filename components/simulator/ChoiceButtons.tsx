"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { useAccessibility } from "@/hooks/useAccessibility";
import type { DialogueChoice } from "@/types/simulator";

interface ChoiceButtonsProps {
  choices: DialogueChoice[];
  disabled?: boolean;
  onSelect: (nextNodeId: string) => void;
}

export function ChoiceButtons({
  choices,
  disabled = false,
  onSelect,
}: ChoiceButtonsProps) {
  const { settings } = useAccessibility();
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = Boolean(settings.reducedMotion || prefersReducedMotion);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  function handleSelect(choice: DialogueChoice, index: number) {
    if (disabled || selectedIndex !== null) {
      return;
    }

    setSelectedIndex(index);
    window.setTimeout(() => {
      onSelect(choice.next);
      setSelectedIndex(null);
    }, reduceMotion ? 40 : 180);
  }

  return (
    <div className="grid gap-3">
      {choices.map((choice, index) => (
        <motion.button
          key={`${choice.label}-${choice.next}`}
          type="button"
          onClick={() => handleSelect(choice, index)}
          disabled={disabled}
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={
            disabled || reduceMotion
              ? undefined
              : {
                  y: -2,
                  boxShadow: "0 14px 28px rgba(17,24,39,0.12)",
                }
          }
          whileTap={disabled || reduceMotion ? undefined : { scale: 0.985 }}
          transition={{ duration: 0.22, delay: reduceMotion ? 0 : index * 0.05, ease: "easeOut" }}
          className={`sim-choice-enter flex min-h-[56px] w-full items-start gap-3 rounded-[1.1rem] border-[2px] border-black bg-[#FAF4EA] px-4 py-3 text-left transition ${
            disabled ? "opacity-50" : ""
          } ${selectedIndex === index ? "sim-choice-selected" : ""}`}
          style={{
            animationDelay: `${index * 80}ms`,
          }}
        >
          <span className="mt-0.5 text-lg">{choice.emoji ?? "•"}</span>
          <span className="flex-1">
            <span className="block text-sm font-bold text-black">{choice.label}</span>
            {choice.sublabel ? (
              <span className="mt-1 block text-xs leading-5 text-black/65">{choice.sublabel}</span>
            ) : null}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
