"use client";

import { Home, ShieldCheck, Sofa, TriangleAlert } from "lucide-react";

import { formatCurrency, pickText } from "@/lib/content";
import type { ApartmentListing, ApartmentZipData, Language } from "@/lib/types";

function getLowerRentAmount(range: string) {
  const match = range.replaceAll(",", "").match(/\$([0-9]+)/);
  return match ? Number(match[1]) : 1200;
}

export function ApartmentCoverageCard({
  apartment,
  zipData,
  language,
}: {
  apartment: ApartmentListing;
  zipData: ApartmentZipData;
  language: Language;
}) {
  const lowerRent = getLowerRentAmount(apartment.rentRange);
  const rentPercent = (apartment.estimate / lowerRent) * 100;
  const progressWidth = Math.min((rentPercent / 5) * 100, 100);
  const isSpanish = language === "es";

  const coverageItems = [
    {
      label: language === "es" ? "Propiedad personal" : "Personal property",
      value: apartment.coverage.personalProperty,
      icon: Sofa,
    },
    {
      label: language === "es" ? "Responsabilidad civil" : "Liability",
      value: apartment.coverage.liability,
      icon: ShieldCheck,
    },
    {
      label: language === "es" ? "Gastos de estadia" : "Loss of use",
      value: apartment.coverage.lossOfUse,
      icon: Home,
    },
  ];

  return (
    <section className="panel-card mt-0" aria-live="polite" aria-atomic="true">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="eyebrow">{isSpanish ? "Apartamento seleccionado" : "Selected apartment"}</p>
          <h2 className="font-display text-3xl leading-tight text-[var(--color-ink)]">
            {apartment.name}
          </h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">{apartment.address}</p>
        </div>
        <a
          href="https://www.statefarm.com/insurance/renters"
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] px-4 text-sm font-semibold text-[var(--color-paper)] transition hover:bg-[var(--color-accent-strong)]"
        >
          {isSpanish ? "Conseguir cobertura" : "Get covered"}
        </a>
      </div>

      <div className="mt-5 grid gap-4 rounded-[1.7rem] bg-[var(--color-paper)] p-5 shadow-[inset_0_0_0_1px_rgba(14,18,32,0.06)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-muted)]">
              {isSpanish ? "Estimado de inquilino" : "Renter&apos;s estimate"}
            </p>
            <p className="mt-2 text-4xl font-bold text-[var(--color-ink)]">
              {formatCurrency(apartment.estimate, language)}
              <span className="text-base font-medium text-[var(--color-muted)]">
                {isSpanish ? " / mes" : " / month"}
              </span>
            </p>
          </div>
          <div className="rounded-full bg-[#E8F2EC] px-3 py-2 text-xs font-semibold text-[var(--color-success)]">
            {apartment.rentRange}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3 text-sm text-[var(--color-muted)]">
            <span>
              {rentPercent.toFixed(1)}% {isSpanish ? "del alquiler mensual" : "of monthly rent"}
            </span>
            <span>{apartment.beds}</span>
          </div>
          <div
            className="mt-2 h-3 rounded-full bg-[rgba(17,24,39,0.08)]"
            role="progressbar"
            aria-label={isSpanish ? "Porcentaje del alquiler" : "Share of rent"}
            aria-valuemin={0}
            aria-valuemax={5}
            aria-valuenow={Number(rentPercent.toFixed(1))}
          >
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#C63D36_0%,#E78D84_100%)] transition-[width]"
              style={{ width: `${progressWidth}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {coverageItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-[1.4rem] border border-[var(--color-border)] bg-white/75 px-4 py-4"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
                <Icon className="size-4" />
                <span>{item.label}</span>
              </div>
              <p className="mt-3 text-2xl font-bold text-[var(--color-ink)]">
                {formatCurrency(item.value, language)}
              </p>
            </div>
          );
        })}
        <div className="rounded-[1.4rem] border border-[var(--color-border)] bg-white/75 px-4 py-4 sm:col-span-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
            <TriangleAlert className="size-4 text-[var(--color-warning)]" />
            <span>{language === "es" ? "Deducible" : "Deductible"}</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-[var(--color-ink)]">
            {formatCurrency(apartment.coverage.deductible, language)}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {zipData.topRisks.map((risk) => (
          <span
            key={`${apartment.address}-${risk.en}`}
            className="rounded-full border border-[var(--color-border)] bg-[var(--color-accent-soft)] px-3 py-2 text-xs font-semibold text-[var(--color-muted)]"
          >
            {pickText(risk, language)}
          </span>
        ))}
      </div>
    </section>
  );
}
