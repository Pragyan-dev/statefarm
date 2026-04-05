"use client";

import { Check } from "lucide-react";

import { useAccessibility } from "@/hooks/useAccessibility";
import type { IncidentCategory, IncidentType } from "@/types/claim";

export function IncidentSelector({
  categories,
  selectedType,
  onSelect,
}: {
  categories: IncidentCategory[];
  selectedType: IncidentType | null;
  onSelect: (incidentType: IncidentType) => void;
}) {
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";

  return (
    <section className="panel-card hero-ambient overflow-hidden">
      <p className="eyebrow">{isSpanish ? "Inicio del reclamo" : "Claim intake"}</p>
      <h1 className="mt-2 font-display text-4xl leading-[0.98] text-[var(--color-ink)] sm:text-5xl">
        {isSpanish ? "¿Que paso?" : "What happened?"}
      </h1>
      <p className="mt-3 max-w-[34rem] text-base text-[var(--color-muted)]">
        {isSpanish
          ? "Toca una categoria o describe el incidente abajo. Te guiaremos paso por paso."
          : "Tap a category or describe the incident below. We’ll walk you through it step by step."}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {categories.map((category) => {
          const selected = category.type === selectedType;

          return (
            <button
              key={category.type}
              type="button"
              onClick={() => onSelect(category.type)}
              className={`group relative aspect-[1.08/1] overflow-hidden rounded-[1.4rem] border p-4 text-left transition duration-200 active:scale-[0.97] ${
                selected
                  ? `${category.color} border-2 shadow-[0_14px_28px_rgba(17,24,39,0.12)]`
                  : `${category.color} shadow-[0_8px_18px_rgba(17,24,39,0.05)] hover:-translate-y-0.5`
              }`}
            >
              {selected ? (
                <span className="absolute right-3 top-3 inline-flex size-6 items-center justify-center rounded-full bg-[var(--color-ink)] text-[var(--color-paper)]">
                  <Check className="size-4" />
                </span>
              ) : null}

              <div className="flex h-full flex-col justify-between">
                <div className="text-[2.25rem] leading-none">{category.icon}</div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[var(--color-ink)] sm:text-[0.95rem]">
                    {category.label}
                  </p>
                  <p className="text-xs leading-snug text-[var(--color-muted)]">
                    {category.sublabel}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
