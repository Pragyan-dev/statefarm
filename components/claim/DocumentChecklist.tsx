"use client";

import { useMemo } from "react";

import { useAccessibility } from "@/hooks/useAccessibility";
import type { DocumentItem } from "@/types/claim";

import { ChecklistItem } from "./ChecklistItem";

export function DocumentChecklist({
  items,
  onToggle,
}: {
  items: DocumentItem[];
  onToggle: (id: string) => void;
}) {
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";
  const collectedCount = items.filter((item) => item.collected).length;
  const progress = items.length ? collectedCount / items.length : 0;
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = useMemo(
    () => circumference - progress * circumference,
    [circumference, progress],
  );

  return (
    <section className="panel-card">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">{isSpanish ? "Papeleo" : "Paperwork"}</p>
          <h2 className="mt-2 font-display text-3xl leading-[0.98] text-[var(--color-ink)] sm:text-4xl">
            {isSpanish ? "Documentos para reunir" : "Documents to collect"}
          </h2>
        </div>

        <div className="flex items-center gap-3 rounded-[1.35rem] border border-[var(--color-border)] bg-white/70 px-4 py-3">
          <svg width="80" height="80" viewBox="0 0 80 80" className="shrink-0">
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke="rgba(17,24,39,0.12)"
              strokeWidth="8"
            />
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke="var(--color-success)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 420ms ease" }}
              transform="rotate(-90 40 40)"
            />
          </svg>
          <div>
            <p className="text-xl font-bold text-[var(--color-ink)]">
              {collectedCount}/{items.length}
            </p>
            <p className="text-sm text-[var(--color-muted)]">
              {isSpanish ? "reunidos" : "collected"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 max-h-[28rem] space-y-3 overflow-y-auto pr-1">
        {items.map((item) => (
          <ChecklistItem key={item.id} item={item} onToggle={onToggle} />
        ))}
      </div>
    </section>
  );
}
