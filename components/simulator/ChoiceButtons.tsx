"use client";

import { useState } from "react";

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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  function handleSelect(choice: DialogueChoice, index: number) {
    if (disabled || selectedIndex !== null) {
      return;
    }

    setSelectedIndex(index);
    window.setTimeout(() => {
      onSelect(choice.next);
      setSelectedIndex(null);
    }, 300);
  }

  return (
    <div className="grid gap-3">
      {choices.map((choice, index) => (
        <button
          key={`${choice.label}-${choice.next}`}
          type="button"
          onClick={() => handleSelect(choice, index)}
          disabled={disabled}
          className={`sim-choice-enter flex min-h-[52px] w-full items-start gap-3 rounded-[1.1rem] border-[2px] border-black bg-[#FAF4EA] px-4 py-3 text-left transition ${
            disabled ? "opacity-50" : "active:scale-[0.98]"
          } ${selectedIndex === index ? "sim-choice-selected" : ""}`}
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          <span className="mt-0.5 text-lg">{choice.emoji ?? "•"}</span>
          <span className="flex-1">
            <span className="block text-sm font-bold text-black">{choice.label}</span>
            {choice.sublabel ? (
              <span className="mt-1 block text-xs leading-5 text-black/65">{choice.sublabel}</span>
            ) : null}
          </span>
        </button>
      ))}
    </div>
  );
}
