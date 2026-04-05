"use client";

import { useState } from "react";
import { AlertTriangle, Check, ChevronDown } from "lucide-react";

import { useAccessibility } from "@/hooks/useAccessibility";
import type { ClaimStep } from "@/types/claim";

export function TimelineStep({
  step,
  isActive,
  isLast,
  onComplete,
}: {
  step: ClaimStep;
  isActive: boolean;
  isLast: boolean;
  onComplete: (stepId: string) => void;
}) {
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";
  const StepIcon = step.icon;
  const [expanded, setExpanded] = useState(false);
  const [burst, setBurst] = useState(false);
  const isExpanded = expanded || isActive || step.completed;

  function handleComplete() {
    if (step.completed) {
      return;
    }

    setBurst(true);
    onComplete(step.id);
    window.setTimeout(() => setBurst(false), 650);
  }

  const badgeClass =
    step.urgency === "now"
      ? "bg-red-100 text-red-700"
      : step.urgency === "soon"
        ? "bg-amber-100 text-amber-700"
        : "bg-sky-100 text-sky-700";

  return (
    <div className="relative pl-12">
      {!isLast ? (
        <span
          className={`absolute left-[11px] top-7 bottom-[-1.5rem] w-[2px] transition-colors ${
            step.completed ? "bg-[var(--color-success)]" : "bg-[rgba(17,24,39,0.12)]"
          }`}
        />
      ) : null}

      <span className="absolute left-0 top-5 h-px w-5 bg-[rgba(17,24,39,0.18)]" />

      <span
        className={`absolute left-0 top-3 z-[1] inline-flex size-6 items-center justify-center rounded-full border text-xs shadow-sm transition ${
          step.completed
            ? "claim-step-check border-[var(--color-success)] bg-[var(--color-success)] text-white"
            : isActive
              ? "claim-active-dot border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
              : "border-[rgba(17,24,39,0.18)] bg-white text-[var(--color-muted)]"
        }`}
      >
        {step.completed ? <Check className="size-3.5" /> : <StepIcon className="size-3.5" strokeWidth={2} />}
      </span>

      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          if (!isActive && !step.completed) {
            setExpanded((current) => !current);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (!isActive && !step.completed) {
              setExpanded((current) => !current);
            }
          }
        }}
        className={`rounded-[1.5rem] border bg-white/70 p-4 shadow-[0_14px_32px_rgba(17,24,39,0.06)] transition ${
          step.completed
            ? "border-[rgba(31,122,90,0.28)] ring-1 ring-[rgba(31,122,90,0.1)]"
            : "border-[var(--color-border)] hover:-translate-y-0.5"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.18em] ${badgeClass}`}>
              {step.urgency === "now" ? step.timeframe.toUpperCase() : step.timeframe}
            </span>
            <h3 className="mt-3 font-semibold text-[var(--color-ink)] sm:text-[1.03rem]">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
              {step.description}
            </p>
          </div>
          <ChevronDown
            className={`mt-1 size-4 shrink-0 text-[var(--color-muted)] transition ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>

        <div
          className={`grid transition-all duration-300 ${
            isExpanded ? "mt-4 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <ul className="space-y-2 text-sm text-[var(--color-muted)]">
              {step.details.map((detail) => (
                <li key={detail} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>

            {step.warning ? (
              <div className="mt-4 rounded-[1rem] border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <div className="flex gap-2">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  <p className="font-medium">{step.warning}</p>
                </div>
              </div>
            ) : null}

            <div className="relative mt-4 flex justify-start">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleComplete();
                }}
                disabled={step.completed}
                className={`relative inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-semibold transition ${
                  step.completed
                    ? "border border-[rgba(31,122,90,0.25)] bg-[rgba(31,122,90,0.12)] text-[var(--color-success)]"
                    : "border border-[var(--color-border)] bg-white text-[var(--color-ink)] hover:border-[var(--color-success)]"
                }`}
              >
                {step.completed
                  ? isSpanish
                    ? "Completado ✓"
                    : "Completed ✓"
                  : isSpanish
                    ? "Listo ✓"
                    : "Done ✓"}
                {burst ? (
                  <>
                    <span className="claim-confetti-dot left-3 top-2 bg-[var(--color-success)]" />
                    <span className="claim-confetti-dot right-4 top-1 bg-[var(--color-accent)]" />
                    <span className="claim-confetti-dot left-7 bottom-1 bg-amber-400" />
                    <span className="claim-confetti-dot right-2 bottom-2 bg-sky-400" />
                  </>
                ) : null}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
