"use client";

import { AlertTriangle, ArrowRight } from "lucide-react";

import { formatCurrency } from "@/lib/content";
import { useAccessibility } from "@/hooks/useAccessibility";
import type { CoverageGap } from "@/types/policy";

interface GapWarningCardProps {
  gap: CoverageGap;
  onFixGap: () => void;
}

const SEVERITY_STYLES = {
  high: {
    border: "#E24B4A",
    background: "rgba(226,75,74,0.08)",
    badge: "rgba(226,75,74,0.14)",
  },
  medium: {
    border: "#EF9F27",
    background: "rgba(239,159,39,0.08)",
    badge: "rgba(239,159,39,0.14)",
  },
  low: {
    border: "#378ADD",
    background: "rgba(55,138,221,0.08)",
    badge: "rgba(55,138,221,0.14)",
  },
} as const;

export function GapWarningCard({ gap, onFixGap }: GapWarningCardProps) {
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";
  const styles = SEVERITY_STYLES[gap.severity];
  const actionClass =
    "inline-flex min-h-[3.1rem] items-center justify-center gap-2 rounded-full border border-[rgba(212,96,58,0.18)] bg-[linear-gradient(135deg,#d4603a_0%,#e67647_100%)] px-5 text-sm font-semibold text-[#fff7ef] shadow-[0_14px_28px_rgba(212,96,58,0.24)] transition hover:-translate-y-px hover:shadow-[0_18px_34px_rgba(212,96,58,0.28)]";

  return (
    <article
      className={`rounded-[1.75rem] border border-[var(--color-border)] px-4 py-4 shadow-[0_18px_34px_rgba(17,24,39,0.08)] ${
        gap.severity === "high" ? "decoder-gap-pulse" : ""
      }`}
      style={{
        background: styles.background,
        boxShadow: `inset 4px 0 0 ${styles.border}, 0 18px 34px rgba(17,24,39,0.08)`,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div
            className="inline-flex rounded-full px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.24em]"
            style={{ background: styles.badge, color: styles.border }}
          >
            {gap.severity === "high"
              ? isSpanish
                ? "Riesgo alto"
                : "High risk"
              : gap.severity === "medium"
                ? isSpanish
                  ? "Riesgo medio"
                  : "Medium risk"
                : isSpanish
                  ? "Riesgo bajo"
                  : "Low risk"}
          </div>
          <h3 className="mt-3 font-display text-2xl text-[var(--color-ink)]">{gap.title}</h3>
        </div>
        <AlertTriangle className="mt-1 size-5" style={{ color: styles.border }} />
      </div>

      <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{gap.description}</p>

      <div className="decoder-risk-panel mt-4 rounded-[1.25rem] px-4 py-4 text-[var(--color-paper)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="max-w-[34ch] text-sm leading-6 text-[rgba(255,247,239,0.88)]">
            ⚠️ {gap.scenario}
          </p>
          <div className="rounded-full bg-[rgba(255,180,168,0.12)] px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#FFB4A8]">
            {gap.severity === "high"
              ? isSpanish
                ? "Golpe grande"
                : "Big hit"
              : isSpanish
                ? "Riesgo real"
                : "Real risk"}
          </div>
        </div>
        <p className="mt-4 font-display text-3xl leading-none text-[#FFB4A8]">
          {formatCurrency(gap.estimatedRisk, settings.language)}
        </p>
      </div>

      <button
        type="button"
        onClick={onFixGap}
        className={`${actionClass} mt-4`}
      >
        {isSpanish ? "Arreglar esta brecha" : "Fix this gap"}
        <ArrowRight className="size-4" />
      </button>
    </article>
  );
}
