"use client";

import { useState } from "react";
import { Check, CircleHelp } from "lucide-react";

import { useAccessibility } from "@/hooks/useAccessibility";
import type { DocumentItem } from "@/types/claim";

export function ChecklistItem({
  item,
  onToggle,
}: {
  item: DocumentItem;
  onToggle: (id: string) => void;
}) {
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="relative flex items-start gap-3 rounded-[1.2rem] border border-[var(--color-border)] bg-white/65 p-3">
      <button
        type="button"
        onClick={() => onToggle(item.id)}
        className={`mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full border transition ${
          item.collected
            ? "claim-check-pop border-[var(--color-success)] bg-[var(--color-success)] text-white"
            : "border-[rgba(17,24,39,0.22)] bg-white text-transparent"
        }`}
        aria-label={item.collected ? `Uncheck ${item.label}` : `Check ${item.label}`}
      >
        <Check className="size-3.5" />
      </button>

      <button
        type="button"
        onClick={() => onToggle(item.id)}
        className="min-w-0 flex-1 text-left"
      >
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={`text-sm font-semibold text-[var(--color-ink)] ${
              item.collected ? "opacity-60 line-through" : ""
            }`}
          >
            {item.label}
          </p>
          {item.required ? (
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-red-700">
              {isSpanish ? "Obligatorio" : "Required"}
            </span>
          ) : null}
        </div>
        <p className={`mt-1 text-xs leading-relaxed text-[var(--color-muted)] ${item.collected ? "opacity-60" : ""}`}>
          {item.description}
        </p>
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={() => setShowInfo((current) => !current)}
          className="inline-flex size-8 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-muted)]"
          aria-label={`Where to find ${item.label}`}
        >
          <CircleHelp className="size-4" />
        </button>

        {showInfo ? (
          <div className="absolute right-0 top-10 z-10 w-[14rem] rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-paper)] p-3 text-xs leading-relaxed text-[var(--color-muted)] shadow-[0_20px_40px_rgba(17,24,39,0.12)]">
            {item.where_to_find}
          </div>
        ) : null}
      </div>
    </div>
  );
}
