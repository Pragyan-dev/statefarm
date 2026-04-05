"use client";

import { useEffect, useState } from "react";

import { formatCurrency } from "@/lib/content";
import { useAccessibility } from "@/hooks/useAccessibility";

interface DeductibleRealityProps {
  amount: number;
  comparisons: string[];
  exampleClaim?: number;
  layout?: "app" | "website";
}

export function DeductibleReality({
  amount,
  comparisons,
  exampleClaim = 3000,
  layout = "app",
}: DeductibleRealityProps) {
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";
  const reducedMotion = settings.reducedMotion;
  const [visible, setVisible] = useState(reducedMotion);
  const deductibleShare = Math.min(100, Math.max(8, (amount / exampleClaim) * 100));
  const insuranceShare = Math.max(0, 100 - deductibleShare);
  const containerClass =
    layout === "website" ? "panel-card w-full px-6 py-6 xl:px-7 xl:py-7" : "panel-card mx-auto w-full max-w-[36rem]";
  const comparisonsClass =
    layout === "website" ? "mt-6 grid gap-3 lg:grid-cols-2" : "mt-6 grid gap-3";

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    const timer = window.setTimeout(() => setVisible(true), 40);
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  return (
    <section className={containerClass}>
      <p className="eyebrow">{isSpanish ? "Realidad del deducible" : "Deductible reality"}</p>
      <h2 className="mt-3 font-display text-5xl leading-none text-[var(--color-ink)]">
        {formatCurrency(amount, settings.language)}
      </h2>
      <p className={`mt-3 text-base text-[var(--color-muted)] ${layout === "website" ? "max-w-[36ch]" : "max-w-[24ch]"}`}>
        {isSpanish
          ? "Esto es lo que pagas antes de que el seguro empiece a ayudarte."
          : "This is what you pay before insurance kicks in."}
      </p>

      <div className={comparisonsClass}>
        {comparisons.slice(0, 4).map((comparison, index) => {
          const width = `${Math.max(42, 100 - index * 13)}%`;

          return (
            <div
              key={`${comparison}-${index}`}
              className="rounded-[1.25rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.72)] px-4 py-4"
            >
              <div className="h-2 overflow-hidden rounded-full bg-[rgba(17,24,39,0.08)]">
                <div
                  className="h-full rounded-full bg-[#d4603a] transition-[width] duration-700 ease-out"
                  style={{
                    width: visible ? width : "0%",
                    transitionDelay: `${index * 200}ms`,
                  }}
                />
              </div>
              <p className="mt-3 text-sm font-medium text-[var(--color-ink)]">{comparison}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-[1.6rem] border border-[var(--color-border)] bg-[rgba(17,24,39,0.03)] px-4 py-4">
        <p className="text-sm text-[var(--color-muted)]">
          {isSpanish
            ? `Si tu reclamo es de ${formatCurrency(exampleClaim, settings.language)}, tu pagas ${formatCurrency(amount, settings.language)} y el seguro paga ${formatCurrency(Math.max(exampleClaim - amount, 0), settings.language)}.`
            : `If your claim is ${formatCurrency(exampleClaim, settings.language)}, you pay ${formatCurrency(amount, settings.language)}. Insurance pays ${formatCurrency(Math.max(exampleClaim - amount, 0), settings.language)}.`}
        </p>

        <div className="mt-4 overflow-hidden rounded-full bg-[rgba(17,24,39,0.08)]">
          <div className="flex h-12 w-full">
            <div
              className="flex items-center justify-center bg-[rgba(226,75,74,0.88)] text-xs font-semibold text-white transition-[width] duration-700 ease-out"
              style={{
                width: visible ? `${deductibleShare}%` : "0%",
              }}
            >
              {visible ? (isSpanish ? "tu pagas" : "you pay") : ""}
            </div>
            <div
              className="flex items-center justify-center bg-[rgba(99,153,34,0.9)] text-xs font-semibold text-white transition-[width] duration-700 ease-out"
              style={{
                width: visible ? `${insuranceShare}%` : "0%",
                transitionDelay: reducedMotion ? "0ms" : "450ms",
              }}
            >
              {visible ? (isSpanish ? "seguro paga" : "insurance pays") : ""}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
