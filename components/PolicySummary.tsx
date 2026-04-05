"use client";

import jargon from "@/data/jargon.json";
import { AiSourceNotice } from "@/components/AiSourceNotice";
import { ReadAloud } from "@/components/ReadAloud";
import { JargonTooltip } from "@/components/JargonTooltip";
import { useAccessibility } from "@/hooks/useAccessibility";
import { formatCurrency, formatDate } from "@/lib/content";
import type { PolicySummaryResult } from "@/lib/types";

export function PolicySummary({
  summary,
}: {
  summary: PolicySummaryResult;
}) {
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";
  const narration = [
    summary.summary,
    `${isSpanish ? "Cubierto" : "Covered"}: ${summary.covered.join(", ")}`,
    `${isSpanish ? "No cubierto" : "Not covered"}: ${summary.notCovered.join(", ")}`,
  ].join(" ");
  const scoreLabel =
    summary.score === "basic"
      ? isSpanish
        ? "basico"
        : "basic"
      : summary.score === "good"
        ? isSpanish
          ? "bueno"
          : "good"
        : isSpanish
          ? "excelente"
          : "great";

  return (
    <section className="panel-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{isSpanish ? "Traductor de polizas" : "Policy translator"}</p>
          <h2 className="font-display text-2xl text-[var(--color-ink)]">
            {summary.provider}
          </h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {summary.type} {isSpanish ? "poliza" : "policy"} · {formatDate(summary.expires, settings.language)}
          </p>
        </div>
        <ReadAloud text={narration} />
      </div>

      <div className="mt-4">
        <AiSourceNotice aiSource={summary.aiSource} fallbackReason={summary.fallbackReason} />
      </div>

      <p className="mt-4 text-base leading-7 text-[var(--color-ink)]">{summary.summary}</p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-[1.5rem] bg-[var(--color-paper)] p-4 shadow-[inset_0_0_0_1px_rgba(14,18,32,0.06)]">
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)]">
            {isSpanish ? "Cubierto" : "Covered"}
          </p>
          <ul className="mt-3 grid gap-2 text-sm text-[var(--color-ink)]">
            {summary.covered.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-1 size-2 rounded-full bg-[var(--color-success)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[1.5rem] bg-[var(--color-paper)] p-4 shadow-[inset_0_0_0_1px_rgba(14,18,32,0.06)]">
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)]">
            {isSpanish ? "No cubierto" : "Not covered"}
          </p>
          <ul className="mt-3 grid gap-2 text-sm text-[var(--color-ink)]">
            {summary.notCovered.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span aria-hidden="true" className="pattern-chip mt-1 size-3 rounded-full border border-[var(--color-danger)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-5 grid gap-3 rounded-[1.5rem] border border-[var(--color-border)] px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-[var(--color-ink)]">
            {settings.language === "es" ? "Deducible" : "Deductible"}:{" "}
            {formatCurrency(summary.deductible.amount, settings.language)}
          </p>
          <JargonTooltip term="Deductible" definition={jargon.deductible} />
        </div>
        <p className="text-sm text-[var(--color-muted)]">{summary.deductible.analogy}</p>
        <p className="text-sm text-[var(--color-muted)]">
          {settings.language === "es" ? "Costo mensual" : "Monthly cost"}:{" "}
          {formatCurrency(summary.monthlyCost, settings.language)}
        </p>
        <p className="text-sm text-[var(--color-muted)]">
          {settings.language === "es" ? "Puntaje" : "Coverage score"}:{" "}
          <span className="font-semibold text-[var(--color-ink)]">{scoreLabel}</span>
        </p>
      </div>

      {summary.gaps.length ? (
        <div className="mt-5 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-highlight)] px-4 py-4">
          <p className="font-semibold text-[var(--color-ink)]">
            {settings.language === "es" ? "Huecos encontrados" : "Gaps spotted"}
          </p>
          <ul className="mt-3 grid gap-2 text-sm text-[var(--color-muted)]">
            {summary.gaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
