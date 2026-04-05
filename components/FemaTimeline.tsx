"use client";

import { AlertCircle, CloudLightning } from "lucide-react";

import { formatDate, pickText } from "@/lib/content";
import type { LocalizedText, Language } from "@/lib/types";
import type { DisasterHistoryPayload, DisasterSummary } from "@/lib/fema";

export function FemaTimeline({
  state,
  language,
  data,
  topRisks,
  loading,
}: {
  state: string;
  language: Language;
  data: DisasterHistoryPayload;
  topRisks: LocalizedText[];
  loading: boolean;
}) {
  const riskLabel = language === "es" ? "Riesgos principales en este ZIP" : "Top risks in this ZIP";
  const isSpanish = language === "es";

  return (
    <section className="panel-card mt-0">
      <p className="eyebrow">{isSpanish ? "Historial reciente de desastres" : "Recent disaster history"}</p>
      <div className="mt-3 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl text-[var(--color-ink)]">
            {isSpanish ? "FEMA + contexto de riesgo local" : "FEMA + local risk context"}
          </h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            {loading
              ? isSpanish
                ? "Cargando declaraciones recientes..."
                : "Loading recent declarations..."
              : data.insight}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="mt-5 grid gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-[1.5rem] bg-[rgba(17,24,39,0.06)]"
            />
          ))}
        </div>
      ) : data.items.length ? (
        <ul className="mt-5 grid gap-4">
          {data.items.map((item, index) => (
            <TimelineItem
              key={`${item.title}-${item.date}-${index}`}
              item={item}
              language={language}
              index={index}
            />
          ))}
        </ul>
      ) : (
        <div className="mt-5 rounded-[1.7rem] border border-[var(--color-border)] bg-[#FFF7EE] px-5 py-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-5 text-[var(--color-warning)]" />
            <div>
              <p className="font-semibold text-[var(--color-ink)]">
                {data.source === "fallback"
                  ? isSpanish
                    ? "Sin declaraciones recientes para mostrar"
                    : "No recent declarations to show"
                  : `FEMA ${state}`}
              </p>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{data.insight}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 rounded-[1.6rem] border border-[var(--color-border)] bg-white/75 px-4 py-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
          <CloudLightning className="size-4 text-[var(--color-accent)]" />
          <span>{riskLabel}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {topRisks.map((risk) => (
            <span
              key={risk.en}
              className="rounded-full border border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-[var(--color-muted)]"
            >
              {pickText(risk, language)}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function TimelineItem({
  item,
  language,
  index,
}: {
  item: DisasterSummary;
  language: Language;
  index: number;
}) {
  return (
    <li className="relative pl-7">
      <span
        aria-hidden="true"
        className={`absolute left-2 top-0 h-full w-px ${index === 0 ? "bg-[var(--color-accent)]" : "bg-[rgba(17,24,39,0.12)]"}`}
      />
      <span
        aria-hidden="true"
        className="absolute left-0 top-4 size-4 rounded-full border-2 border-[var(--color-paper)] bg-[var(--color-accent)] shadow-[0_0_0_3px_rgba(212,96,58,0.14)]"
      />
      <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/85 px-4 py-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
          <span>{formatDate(item.date, language)}</span>
          {item.incidentType ? <span>{item.incidentType}</span> : null}
        </div>
        <p className="mt-3 text-lg font-semibold text-[var(--color-ink)]">{item.title}</p>
        {item.area ? <p className="mt-1 text-sm text-[var(--color-muted)]">{item.area}</p> : null}
      </div>
    </li>
  );
}
