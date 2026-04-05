"use client";

import { Check } from "lucide-react";

import { useAccessibility } from "@/hooks/useAccessibility";
import type { IncidentCategory, IncidentType } from "@/types/claim";

export function IncidentSelector({
  categories,
  selectedType,
  onSelect,
  compact = false,
  embedded = false,
  className = "",
}: {
  categories: IncidentCategory[];
  selectedType: IncidentType | null;
  onSelect: (incidentType: IncidentType) => void;
  compact?: boolean;
  embedded?: boolean;
  className?: string;
}) {
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";

  return (
    <section
      className={`${
        embedded ? "" : "panel-card hero-ambient overflow-hidden"
      } ${className}`}
    >
      <p className="eyebrow">{isSpanish ? "Inicio del reclamo" : "Claim intake"}</p>
      <h1
        className={`font-display leading-[0.98] text-[var(--color-ink)] ${
          compact ? "mt-1.5 text-[2.45rem] sm:text-[2.8rem]" : "mt-2 text-4xl sm:text-5xl"
        }`}
      >
        {isSpanish ? "¿Que paso?" : "What happened?"}
      </h1>
      <p
        className={`max-w-[34rem] text-[var(--color-muted)] ${
          compact ? "mt-2 text-sm leading-6" : "mt-3 text-base"
        }`}
      >
        {isSpanish
          ? "Toca una categoria o describe el incidente abajo. Te guiaremos paso por paso."
          : "Tap a category or describe the incident below. We’ll walk you through it step by step."}
      </p>

      <div
        className={`grid gap-3 ${
          compact ? "mt-4 grid-cols-2 lg:grid-cols-3" : "mt-6 grid-cols-2"
        }`}
      >
        {categories.map((category) => {
          const selected = category.type === selectedType;
          const Icon = category.icon;

          return (
            <button
              key={category.type}
              type="button"
              onClick={() => onSelect(category.type)}
              className={`group relative overflow-hidden rounded-[1.4rem] border text-left transition duration-200 active:scale-[0.97] ${
                compact ? "min-h-[8.75rem] p-3.5 lg:min-h-[9.25rem]" : "aspect-[1.08/1] p-4"
              } ${
                selected
                  ? `${category.color} border-2 shadow-[0_14px_28px_rgba(17,24,39,0.12)]`
                  : `${category.color} shadow-[0_8px_18px_rgba(17,24,39,0.05)] hover:-translate-y-0.5`
              }`}
            >
              {selected ? (
                <span
                  className={`absolute inline-flex items-center justify-center rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] ${
                    compact ? "right-2.5 top-2.5 size-5.5" : "right-3 top-3 size-6"
                  }`}
                >
                  <Check className="size-4" />
                </span>
              ) : null}

              <div className="flex h-full flex-col justify-between">
                <span
                  className={`inline-flex items-center justify-center rounded-full bg-white/70 text-[var(--color-ink)] shadow-sm ${
                    compact ? "size-12" : "size-14"
                  }`}
                >
                  <Icon className={compact ? "size-6" : "size-7"} strokeWidth={1.8} />
                </span>
                <div className={compact ? "space-y-0.5" : "space-y-1"}>
                  <p
                    className={`font-semibold text-[var(--color-ink)] ${
                      compact ? "text-[0.92rem] leading-5" : "text-sm sm:text-[0.95rem]"
                    }`}
                  >
                    {category.label}
                  </p>
                  <p
                    className={`text-[var(--color-muted)] ${
                      compact ? "text-[0.76rem] leading-4" : "text-xs leading-snug"
                    }`}
                  >
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
