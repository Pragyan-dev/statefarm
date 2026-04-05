"use client";

import { Check } from "lucide-react";

import { useAccessibility } from "@/hooks/useAccessibility";
import type { ClaimStep, DocumentItem } from "@/types/claim";

export function ClaimStatusTracker({
  steps,
  documents,
  estimatedTimeline,
}: {
  steps: ClaimStep[];
  documents: DocumentItem[];
  estimatedTimeline: string;
}) {
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";
  const labels = isSpanish
    ? ["Incidente", "Documentar", "Presentar", "Ajustador", "Resolucion"]
    : ["Incident", "Document", "File claim", "Adjuster review", "Resolution"];
  const currentStage = getCurrentStage(steps, documents);

  return (
    <section className="panel-card">
      <p className="eyebrow">{isSpanish ? "Ruta del reclamo" : "Claim path"}</p>
      <div className="mt-5 grid grid-cols-5 gap-1">
        {labels.map((label, index) => {
          const isPast = index < currentStage;
          const isActive = index === currentStage;

          return (
            <div key={label} className="relative flex flex-col items-center text-center">
              {index < labels.length - 1 ? (
                <span
                  className={`absolute left-1/2 top-3 h-[2px] w-full translate-x-1/2 ${
                    isPast ? "bg-[var(--color-success)]" : "bg-[rgba(17,24,39,0.12)]"
                  }`}
                />
              ) : null}
              <span
                className={`relative z-[1] inline-flex size-6 items-center justify-center rounded-full border text-[0.7rem] ${
                  isPast
                    ? "border-[var(--color-success)] bg-[var(--color-success)] text-white"
                    : isActive
                      ? "claim-active-dot border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                      : "border-[rgba(17,24,39,0.2)] bg-white text-[var(--color-muted)]"
                }`}
              >
                {isPast ? <Check className="size-3.5" /> : index + 1}
              </span>
              <span className="mt-2 text-[0.68rem] font-semibold leading-tight text-[var(--color-muted)] sm:text-xs">
                {label}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-sm text-[var(--color-muted)]">
        {isSpanish ? "Tiempo tipico: " : "Typical resolution: "}
        <span className="font-medium text-[var(--color-ink)]">{estimatedTimeline}</span>
      </p>
    </section>
  );
}

function getCurrentStage(steps: ClaimStep[], documents: DocumentItem[]) {
  const completedSteps = steps.filter((step) => step.completed).length;
  const totalSteps = Math.max(steps.length, 1);
  const requiredDocuments = documents.filter((item) => item.required);
  const collectedRequired = requiredDocuments.filter((item) => item.collected).length;
  const completionRatio = completedSteps / totalSteps;

  if (
    completedSteps === steps.length &&
    (requiredDocuments.length === 0 || collectedRequired === requiredDocuments.length)
  ) {
    return 4;
  }

  if (completionRatio >= 0.7) {
    return 3;
  }

  if (completionRatio >= 0.45 || steps.some((step) => step.id === "file_claim" && step.completed)) {
    return 2;
  }

  if (completionRatio > 0 || collectedRequired > 0) {
    return 1;
  }

  return 0;
}
