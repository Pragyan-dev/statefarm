"use client";

import { useMemo } from "react";

import { ReadAloud } from "@/components/ReadAloud";
import { useAccessibility } from "@/hooks/useAccessibility";
import { formatCurrency, pickText } from "@/lib/content";
import type { ScenarioData } from "@/lib/types";

export function ScenarioCard({
  scenario,
}: {
  scenario: ScenarioData;
}) {
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";

  const { maxValue, withoutHeight, withHeight } = useMemo(() => {
    const max = Math.max(scenario.without.total, scenario.with.annual, scenario.with.outOfPocket);

    return {
      maxValue: max,
      withoutHeight: `${(scenario.without.total / max) * 100}%`,
      withHeight: `${(scenario.with.outOfPocket / max) * 100}%`,
    };
  }, [scenario]);

  const narrative = `${pickText(scenario.without.headline, settings.language)} ${pickText(
    scenario.without.narrative,
    settings.language,
  )} ${pickText(scenario.with.headline, settings.language)} ${pickText(
    scenario.with.narrative,
    settings.language,
  )}`;

  return (
    <article className="panel-card overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{isSpanish ? "Simulador de impacto" : "Shock simulator"}</p>
          <h3 className="text-2xl font-semibold text-[var(--color-ink)]">
            {pickText(scenario.title, settings.language)}
          </h3>
        </div>
        <ReadAloud text={narrative} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="sf-stat-card bg-[var(--color-rail)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-muted)]">
            {isSpanish ? "Sin cobertura" : "Without coverage"}
          </p>
          <div className="mt-4 flex h-40 items-end">
            <div
              className="bar-without w-full rounded-t-[1.25rem]"
              style={{ height: withoutHeight }}
              role="img"
              aria-label={`${isSpanish ? "Sin seguro" : "Without insurance"} ${formatCurrency(scenario.without.total, settings.language)}`}
            />
          </div>
          <p className="mt-4 text-3xl font-bold text-[var(--color-danger)]">
            {formatCurrency(scenario.without.total, settings.language)}
          </p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            {pickText(scenario.without.headline, settings.language)}
          </p>
        </div>

        <div className="sf-stat-card bg-[var(--color-rail)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-muted)]">
            {isSpanish ? "Con cobertura" : "With coverage"}
          </p>
          <div className="mt-4 flex h-40 items-end">
            <div
              className="bar-with w-full rounded-t-[1.25rem]"
              style={{ height: withHeight }}
              role="img"
              aria-label={`${isSpanish ? "Con seguro" : "With insurance"} ${formatCurrency(scenario.with.outOfPocket, settings.language)}`}
            />
          </div>
          <p className="mt-4 text-3xl font-bold text-[var(--color-success)]">
            {formatCurrency(scenario.with.outOfPocket, settings.language)}
          </p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            {pickText(scenario.with.headline, settings.language)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-rail)] p-4 text-sm text-[var(--color-muted)]">
        <p>{pickText(scenario.without.narrative, settings.language)}</p>
        <p>{pickText(scenario.with.narrative, settings.language)}</p>
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)]">
          {isSpanish ? "Prima anual de referencia" : "Annual premium anchor"}:{" "}
          {formatCurrency(scenario.with.annual, settings.language)} {isSpanish ? "/ ano" : "/ year"}
        </p>
      </div>

      <p className="sr-only">
        {isSpanish
          ? `El valor maximo comparado en esta tarjeta es ${maxValue}`
          : `Maximum value compared on this card is ${maxValue}`}
      </p>
    </article>
  );
}
