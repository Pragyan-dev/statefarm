"use client";

import { useMemo, useState } from "react";

import { formatCurrency } from "@/lib/content";
import { useAccessibility } from "@/hooks/useAccessibility";
import type { CoverageCategory, CoverageGap, CoverageItem, PolicyAnalysis } from "@/types/policy";

const SEGMENT_CONFIG = [
  {
    key: "theft",
    icon: "👜",
    categories: ["theft", "property", "comprehensive"] as CoverageCategory[],
  },
  {
    key: "fire",
    icon: "🔥",
    categories: ["fire"] as CoverageCategory[],
  },
  {
    key: "water",
    icon: "💧",
    categories: ["water", "collision"] as CoverageCategory[],
  },
  {
    key: "liability",
    icon: "🛡️",
    categories: ["liability", "uninsured_motorist"] as CoverageCategory[],
  },
  {
    key: "medical",
    icon: "🏥",
    categories: ["medical"] as CoverageCategory[],
  },
  {
    key: "natural_disaster",
    icon: "🌊",
    categories: ["natural_disaster"] as CoverageCategory[],
  },
] as const;

type SegmentKey = (typeof SEGMENT_CONFIG)[number]["key"];
type SegmentStatus = "covered" | "partial" | "uncovered";

export function CoverageShield({
  analysis,
  onFixGap,
}: {
  analysis: PolicyAnalysis;
  onFixGap: () => void;
}) {
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";
  const [selectedKey, setSelectedKey] = useState<SegmentKey | null>(null);

  const segments = useMemo(
    () =>
      SEGMENT_CONFIG.map((segment) => {
        const coveredItems = analysis.covered.filter((item) => segment.categories.includes(item.category));
        const notCoveredItems = analysis.notCovered.filter((item) => segment.categories.includes(item.category));
        const gap = analysis.gaps.find((item) => segment.categories.includes(item.category));
        const status: SegmentStatus = coveredItems.length
          ? gap || notCoveredItems.length
            ? "partial"
            : "covered"
          : gap || notCoveredItems.length
            ? "uncovered"
            : "uncovered";

        return {
          ...segment,
          label: getSegmentLabel(segment.key, settings.language),
          status,
          coveredItems,
          notCoveredItems,
          gap,
        };
      }),
    [analysis.covered, analysis.gaps, analysis.notCovered, settings.language],
  );

  const defaultSegment =
    segments.find((segment) => segment.status === "partial") ??
    segments.find((segment) => segment.status === "uncovered") ??
    segments[0] ??
    null;
  const activeKey =
    selectedKey && segments.some((segment) => segment.key === selectedKey)
      ? selectedKey
      : defaultSegment?.key ?? null;
  const selectedSegment = segments.find((segment) => segment.key === activeKey) ?? null;

  return (
    <section className="panel-card mx-auto w-full max-w-[36rem]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">{isSpanish ? "Escudo de cobertura" : "Coverage shield"}</p>
          <h2 className="mt-2 font-display text-3xl text-[var(--color-ink)]">
            {isSpanish ? "Tu poliza, capa por capa." : "Your policy, layer by layer."}
          </h2>
        </div>
        <div className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
          {analysis.policyType}
        </div>
      </div>

      <div className="relative mx-auto mt-6 w-full max-w-[20rem]">
        <svg
          viewBox="0 0 400 400"
          className="w-full drop-shadow-[0_26px_44px_rgba(17,24,39,0.18)]"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="shield-fill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF8F0" />
              <stop offset="100%" stopColor="#F3E5D1" />
            </linearGradient>
          </defs>
          <path
            d="M200 20 C200 20, 350 20, 380 40 C380 40, 390 60, 390 80 L390 220 C390 280, 340 340, 200 380 C60 340, 10 280, 10 220 L10 80 C10 60, 20 40, 20 40 C50 20, 200 20, 200 20 Z"
            fill="url(#shield-fill)"
            stroke="rgba(17,24,39,0.14)"
            strokeWidth="2"
          />
        </svg>

        <div className="absolute inset-[12%_8%_14%_8%] grid grid-cols-2 gap-3">
          {segments.map((segment, index) => (
            <button
              key={segment.key}
              type="button"
              onClick={() => setSelectedKey(segment.key)}
              aria-pressed={selectedKey === segment.key}
              className={`decoder-shield-segment rounded-[1.2rem] border px-3 py-3 text-left transition ${
                selectedKey === segment.key
                  ? "border-[var(--color-accent)] shadow-[0_16px_26px_rgba(17,24,39,0.12)]"
                  : "border-[rgba(17,24,39,0.08)]"
              } ${getSegmentClasses(segment.status)}`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xl">{segment.icon}</span>
                <span className="text-xs font-semibold">
                  {segment.status === "covered" ? "✓" : segment.status === "partial" ? "!" : "✕"}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold leading-tight">{segment.label}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-[1.6rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.68)] px-4 py-4">
        {selectedSegment ? (
          <ShieldDetail
            segment={selectedSegment}
            language={settings.language}
            onFixGap={onFixGap}
          />
        ) : (
          <p className="text-sm text-[var(--color-muted)]">
            {isSpanish
              ? "Toca un segmento del escudo para ver que protege y donde se rompe."
              : "Tap a shield segment to see what it protects and where it breaks."}
          </p>
        )}
      </div>
    </section>
  );
}

function ShieldDetail({
  segment,
  language,
  onFixGap,
}: {
  segment: {
    key: SegmentKey;
    label: string;
    status: SegmentStatus;
    coveredItems: CoverageItem[];
    notCoveredItems: CoverageItem[];
    gap?: CoverageGap;
  };
  language: "en" | "es";
  onFixGap: () => void;
}) {
  const isSpanish = language === "es";
  const tip = getSegmentTip(segment.key, language);
  const actionClass =
    "inline-flex min-h-[3.1rem] items-center justify-center rounded-full border border-[rgba(212,96,58,0.18)] bg-[linear-gradient(135deg,#d4603a_0%,#e67647_100%)] px-5 text-sm font-semibold text-[#fff7ef] shadow-[0_14px_28px_rgba(212,96,58,0.24)] transition hover:-translate-y-px hover:shadow-[0_18px_34px_rgba(212,96,58,0.28)]";

  return (
    <div className="grid gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{isSpanish ? "Detalle del segmento" : "Segment detail"}</p>
          <h3 className="mt-2 font-display text-2xl text-[var(--color-ink)]">{segment.label}</h3>
        </div>
        <div className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${getStatusBadgeClasses(segment.status)}`}>
          {segment.status === "covered"
            ? isSpanish
              ? "Cubierto"
              : "Covered"
            : segment.status === "partial"
              ? isSpanish
                ? "Parcial"
                : "Partial"
              : isSpanish
                ? "Hueco"
                : "Gap"}
        </div>
      </div>

      {segment.coveredItems.length ? (
        <div className="grid gap-2">
          <p className="text-sm font-semibold text-[var(--color-ink)]">
            {isSpanish ? "Lo que si entra" : "What this policy includes"}
          </p>
          {segment.coveredItems.map((item) => (
            <div key={`${segment.key}-${item.label}`} className="rounded-[1rem] border border-[rgba(31,122,90,0.18)] bg-[rgba(31,122,90,0.08)] px-3 py-3">
              <p className="font-semibold text-[var(--color-ink)]">{item.label}</p>
              {item.detail ? <p className="mt-1 text-sm text-[var(--color-muted)]">{item.detail}</p> : null}
              {item.limit ? (
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--color-success)]">
                  {item.limit}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {segment.gap || segment.notCoveredItems.length ? (
        <div className="grid gap-3 rounded-[1.2rem] border border-[rgba(226,75,74,0.16)] bg-[rgba(226,75,74,0.06)] px-3 py-3">
          <p className="text-sm font-semibold text-[var(--color-ink)]">
            {isSpanish ? "Donde se abre la brecha" : "Where the shield opens up"}
          </p>
          {segment.gap ? (
            <>
              <p className="text-sm text-[var(--color-muted)]">{segment.gap.description}</p>
              <div className="decoder-risk-panel rounded-[1rem] px-4 py-4 text-[var(--color-paper)]">
                <p className="text-sm text-[rgba(255,247,239,0.88)]">{segment.gap.scenario}</p>
                <p className="mt-3 text-2xl font-bold text-[#FFB4A8]">
                  {formatCurrency(segment.gap.estimatedRisk, language)}
                </p>
              </div>
            </>
          ) : (
            segment.notCoveredItems.map((item) => (
              <p key={`${segment.key}-${item.label}-gap`} className="text-sm text-[var(--color-muted)]">
                {item.detail ?? item.label}
              </p>
            ))
          )}

          <button
            type="button"
            onClick={onFixGap}
            className={actionClass}
          >
            {isSpanish ? "Arreglar esta brecha" : "Fix this gap"}
          </button>
        </div>
      ) : null}

      <div className="rounded-[1.2rem] border border-[var(--color-border)] bg-[rgba(17,24,39,0.03)] px-3 py-3">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">Safi tip</p>
        <p className="mt-2 text-sm text-[var(--color-ink)]">{tip}</p>
      </div>
    </div>
  );
}

function getSegmentLabel(segment: SegmentKey, language: "en" | "es") {
  const labels = {
    theft: { en: "Theft", es: "Robo" },
    fire: { en: "Fire", es: "Incendio" },
    water: { en: "Water", es: "Agua" },
    liability: { en: "Liability", es: "Responsabilidad" },
    medical: { en: "Medical", es: "Gastos extra" },
    natural_disaster: { en: "Disaster", es: "Desastre" },
  } as const;

  return labels[segment][language];
}

function getSegmentTip(segment: SegmentKey, language: "en" | "es") {
  const tips = {
    theft: {
      en: "Photograph serial numbers and keep a quick home inventory. Theft claims move faster when you can prove what you owned.",
      es: "Toma fotos de numeros de serie y guarda un inventario rapido del hogar. Los reclamos por robo avanzan mas rapido cuando puedes probar lo que tenias.",
    },
    fire: {
      en: "Fire coverage is strongest when you also know your temporary housing limit, because the hotel bill arrives fast.",
      es: "La cobertura por incendio funciona mejor cuando tambien conoces tu limite de vivienda temporal, porque la cuenta del hotel llega rapido.",
    },
    water: {
      en: "Burst-pipe damage and flood damage are not the same. Ask what kind of water event this policy actually pays for.",
      es: "El dano por tuberia rota y el dano por inundacion no son lo mismo. Pregunta que tipo de evento de agua paga realmente esta poliza.",
    },
    liability: {
      en: "Liability protects your future income and savings, not just the apartment. That makes this one of the highest-value parts of the policy.",
      es: "La responsabilidad protege tus ingresos y ahorros futuros, no solo el apartamento. Eso la vuelve una de las partes mas valiosas de la poliza.",
    },
    medical: {
      en: "Temporary living help matters more than most first-time renters expect. A covered loss gets expensive the same night.",
      es: "La ayuda para vivir temporalmente importa mas de lo que esperan muchos inquilinos primerizos. Una perdida cubierta se vuelve cara esa misma noche.",
    },
    natural_disaster: {
      en: "Ask about separate flood or earthquake add-ons if your ZIP has exposure. Base policies often stop short right here.",
      es: "Pregunta por anexos separados para inundacion o terremoto si tu ZIP tiene exposicion. Las polizas base suelen quedarse cortas justo aqui.",
    },
  } as const;

  return tips[segment][language];
}

function getSegmentClasses(status: SegmentStatus) {
  if (status === "covered") {
    return "bg-[rgba(99,153,34,0.1)] text-[#355A15]";
  }

  if (status === "partial") {
    return "bg-[rgba(239,159,39,0.1)] text-[#9A5A07]";
  }

  return "border-dashed bg-[rgba(17,24,39,0.04)] text-[rgba(17,24,39,0.62)]";
}

function getStatusBadgeClasses(status: SegmentStatus) {
  if (status === "covered") {
    return "bg-[rgba(99,153,34,0.12)] text-[#355A15]";
  }

  if (status === "partial") {
    return "bg-[rgba(239,159,39,0.14)] text-[#9A5A07]";
  }

  return "bg-[rgba(226,75,74,0.12)] text-[#9B2E2E]";
}
