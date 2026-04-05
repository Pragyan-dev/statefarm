"use client";

import { useEffect, useRef } from "react";

import { DocumentPreview } from "@/components/decoder/DocumentPreview";
import { useAccessibility } from "@/hooks/useAccessibility";

interface ScanningAnimationProps {
  documentSrc: string;
  documentKind?: "image" | "pdf";
  documentName?: string;
  isScanning: boolean;
  progress: number;
  onComplete: () => void;
}

const TEXT_FRAGMENTS = [
  { key: "deductible", left: "14%", top: "18%", delay: "120ms" },
  { key: "liability", left: "56%", top: "28%", delay: "380ms" },
  { key: "coverage", left: "20%", top: "48%", delay: "660ms" },
  { key: "floodGap", left: "62%", top: "54%", delay: "920ms" },
  { key: "monthlyCost", left: "28%", top: "72%", delay: "1180ms" },
  { key: "property", left: "68%", top: "74%", delay: "1440ms" },
] as const;

export function ScanningAnimation({
  documentSrc,
  documentKind = "pdf",
  documentName = "Policy document",
  isScanning,
  progress,
  onComplete,
}: ScanningAnimationProps) {
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";
  const completedRef = useRef(false);
  const labels = isSpanish
    ? {
        deductible: "Deducible",
        liability: "Responsabilidad",
        coverage: "Cobertura",
        floodGap: "Hueco de inundacion",
        monthlyCost: "Costo mensual",
        property: "Bienes",
      }
    : {
        deductible: "Deductible",
        liability: "Liability",
        coverage: "Coverage",
        floodGap: "Flood gap",
        monthlyCost: "Monthly cost",
        property: "Property",
      };

  useEffect(() => {
    if (!isScanning) {
      completedRef.current = false;
      return;
    }

    if (progress >= 100 && !completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  }, [isScanning, onComplete, progress]);

  return (
    <section className="panel-card mx-auto w-full max-w-[42rem] overflow-hidden">
      <div className="relative flex min-h-[30rem] flex-col items-center justify-center px-3 py-4 text-center">
        <div className="relative w-full max-w-[17.5rem]">
          <DocumentPreview
            src={documentSrc}
            kind={documentKind}
            name={documentName}
            dimmed={progress >= 100}
            className="mx-auto h-[23rem] w-full max-w-[17.5rem]"
          />

          {isScanning && !settings.reducedMotion ? (
            <>
              <div className="decoder-scan-glow absolute inset-0 rounded-[1.6rem]" />
              <div className="scan-line absolute left-0 right-0 top-0" />
              {TEXT_FRAGMENTS.map((fragment) => (
                <span
                  key={fragment.key}
                  className="decoder-fragment absolute rounded-full border border-[rgba(55,138,221,0.22)] bg-[rgba(255,255,255,0.88)] px-2 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[#378ADD]"
                  style={{
                    left: fragment.left,
                    top: fragment.top,
                    animationDelay: fragment.delay,
                  }}
                >
                  {labels[fragment.key]}
                </span>
              ))}
            </>
          ) : null}
        </div>

        <div className="mt-6">
          <p className="eyebrow">{isSpanish ? "Escaneo en progreso" : "Scan in progress"}</p>
          <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
            {isSpanish ? "Analizando tu poliza..." : "Analyzing your policy..."}
          </h1>
          <p className="mt-4 text-lg font-semibold text-[#378ADD]">
            {isSpanish ? "Analizando..." : "Analyzing..."} {Math.max(1, Math.min(progress, 100))}%
          </p>
          <div className="mt-4 h-2.5 w-[16rem] overflow-hidden rounded-full bg-[rgba(17,24,39,0.08)]">
            <div
              className="h-full rounded-full bg-[#378add] transition-[width] duration-300"
              style={{ width: `${Math.max(4, Math.min(progress, 100))}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
