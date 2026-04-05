"use client";

import { useAccessibility } from "@/hooks/useAccessibility";
import type { ClaimStep } from "@/types/claim";

import { TimelineStep } from "./TimelineStep";

export function ClaimTimeline({
  steps,
  onCompleteStep,
}: {
  steps: ClaimStep[];
  onCompleteStep: (stepId: string) => void;
}) {
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";
  const activeStepId = steps.find((step) => !step.completed)?.id ?? steps[steps.length - 1]?.id;

  return (
    <section className="panel-card">
      <div className="max-w-[34rem]">
        <p className="eyebrow">{isSpanish ? "Que hacer ahora" : "What to do now"}</p>
        <h2 className="mt-2 font-display text-3xl leading-[0.98] text-[var(--color-ink)] sm:text-4xl">
          {isSpanish
            ? "Sigue esta linea del tiempo paso por paso."
            : "Follow this timeline step by step."}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">
          {isSpanish
            ? "Marca cada paso cuando lo termines. El siguiente paso se activa automaticamente."
            : "Mark each step when you finish it. The next step becomes active automatically."}
        </p>
      </div>

      <div className="mt-6 space-y-5">
        {steps.map((step, index) => (
          <TimelineStep
            key={step.id}
            step={step}
            isActive={step.id === activeStepId}
            isLast={index === steps.length - 1}
            onComplete={onCompleteStep}
          />
        ))}
      </div>
    </section>
  );
}
