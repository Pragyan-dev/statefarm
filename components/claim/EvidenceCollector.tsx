"use client";

import { useAccessibility } from "@/hooks/useAccessibility";
import type { EvidenceItem } from "@/types/claim";

import { EvidenceCard } from "./EvidenceCard";

export function EvidenceCollector({
  items,
  imageUrls,
  onCapture,
}: {
  items: EvidenceItem[];
  imageUrls: Record<string, string>;
  onCapture: (itemId: string, file: File) => void;
}) {
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";
  const capturedCount = items.filter((item) => item.captured).length;
  const progress = items.length ? (capturedCount / items.length) * 100 : 0;

  return (
    <section className="panel-card">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">{isSpanish ? "Pruebas visuales" : "Visual evidence"}</p>
          <h2 className="mt-2 font-display text-3xl leading-[0.98] text-[var(--color-ink)] sm:text-4xl">
            {isSpanish ? "Evidencia para reunir" : "Evidence to collect"}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">
            {isSpanish
              ? "Toca cada tarjeta para tomar una foto. Las fotos correctas hacen el reclamo mucho mas fuerte."
              : "Tap each card to take a photo. The right photos make the claim much stronger."}
          </p>
        </div>

        <div className="min-w-[12rem] rounded-[1.25rem] border border-[var(--color-border)] bg-white/70 p-3">
          <p className="text-sm font-semibold text-[var(--color-ink)]">
            {capturedCount} {isSpanish ? "de" : "of"} {items.length} {isSpanish ? "fotos tomadas" : "photos taken"}
          </p>
          <div className="mt-2 h-2 rounded-full bg-[rgba(17,24,39,0.08)]">
            <div
              className="h-2 rounded-full bg-[var(--color-success)] transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <EvidenceCard
            key={item.id}
            item={item}
            imageUrl={imageUrls[item.id]}
            onCapture={onCapture}
          />
        ))}
      </div>
    </section>
  );
}
