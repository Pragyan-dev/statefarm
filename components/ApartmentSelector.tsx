"use client";

import { MapPin, Navigation } from "lucide-react";

import { useAccessibility } from "@/hooks/useAccessibility";
import { formatCurrency, pickText } from "@/lib/content";
import type { ApartmentListing, ApartmentZipData } from "@/lib/types";

interface ApartmentSelectorProps {
  zipInput: string;
  activeZip: string;
  zipData: ApartmentZipData;
  selectedApartmentAddress: string | null;
  unsupportedZip: boolean;
  layout: "website" | "app";
  onZipInputChange: (zip: string) => void;
  onLocate: () => Promise<void> | void;
  onApartmentSelect: (apartment: ApartmentListing) => void;
}

export function ApartmentSelector({
  zipInput,
  activeZip,
  zipData,
  selectedApartmentAddress,
  unsupportedZip,
  layout,
  onZipInputChange,
  onLocate,
  onApartmentSelect,
}: ApartmentSelectorProps) {
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";

  const isWebsite = layout === "website";

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-subtle)] px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="eyebrow">{isSpanish ? "Ubicacion demo" : "Demo location"}</p>
          <p className="mt-2 text-base font-semibold text-[var(--color-ink)]">
            {isSpanish ? "Pines de apartamentos cerca de" : "Apartment pins near"} {zipData.city},{" "}
            {zipData.state}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void onLocate()}
          className="button-ink px-4 text-sm font-semibold"
        >
          <Navigation className="size-4" />
          <span>{isSpanish ? "Usar ubicacion demo" : "Use demo location"}</span>
        </button>
      </div>

      <div className={`grid gap-3 ${isWebsite ? "md:grid-cols-[180px_minmax(0,1fr)] xl:grid-cols-[200px_minmax(0,1fr)]" : "md:grid-cols-[180px_minmax(0,1fr)]"} md:items-end`}>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">
            {isSpanish ? "Codigo ZIP" : "ZIP code"}
          </span>
          <input
            value={zipInput}
            onChange={(event) => onZipInputChange(event.target.value)}
            className="field-input"
            inputMode="numeric"
            maxLength={5}
          />
        </label>
        <div
          className="rounded-[0.9rem] border border-[var(--color-border)] bg-[var(--color-subtle)] px-4 py-3 text-sm text-[var(--color-muted)]"
          aria-live="polite"
          aria-atomic="true"
        >
          {isSpanish ? "Mostrando" : "Showing"} {zipData.city}, {zipData.state} {activeZip}
        </div>
      </div>

      {unsupportedZip ? (
        <div className="rounded-[1rem] border border-[var(--color-warning)] bg-[#fff8ed] px-4 py-4 text-sm text-[var(--color-ink)]">
          <p className="font-semibold">
            {isSpanish
              ? "Ese ZIP no esta en la demo todavia."
              : "That ZIP is not in the demo yet."}
          </p>
          <p className="mt-2 text-[var(--color-muted)]">
            {isSpanish
              ? `Seguimos mostrando ${zipData.city}, ${zipData.state} ${activeZip} para que el mapa y las estimaciones sigan funcionando.`
              : `We are keeping ${zipData.city}, ${zipData.state} ${activeZip} active so the map and renter estimates still show a complete demo flow.`}
          </p>
        </div>
      ) : null}

      <div
        className={
          isWebsite
            ? "grid gap-3 md:grid-cols-2 2xl:grid-cols-4"
            : "flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1"
        }
      >
        {zipData.apartments.map((apartment) => {
          const isSelected = apartment.address === selectedApartmentAddress;

          return (
            <button
              key={`${apartment.name}-${apartment.address}`}
              type="button"
              onClick={() => onApartmentSelect(apartment)}
              aria-pressed={isSelected}
              className={`rounded-[1rem] border px-4 py-4 text-left transition ${
                isWebsite ? "min-h-[186px]" : "min-h-[170px] min-w-[82%] snap-start"
              } ${
                isSelected
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] shadow-[0_12px_28px_var(--color-accent-glow)]"
                  : "border-[var(--color-border)] bg-white hover:border-[var(--color-accent)] hover:bg-[var(--color-subtle)]"
              }`}
            >
              <div className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold leading-tight text-[var(--color-ink)]">
                      {apartment.name}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">{apartment.address}</p>
                  </div>
                  <span className="status-badge status-badge-neutral shrink-0 px-3 py-1 text-xs">
                    {formatCurrency(apartment.estimate, settings.language)}
                    {isSpanish ? "/mes" : "/mo"}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-[var(--color-muted)]">
                  <MapPin className="size-4 shrink-0" />
                  <span>{apartment.rentRange}</span>
                  <span aria-hidden="true">·</span>
                  <span>{apartment.beds}</span>
                </div>

                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  {zipData.topRisks.slice(0, 2).map((risk) => (
                    <span
                      key={`${apartment.address}-${risk.en}`}
                        className="rounded-full border border-[var(--color-border)] bg-[var(--color-subtle)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-muted)]"
                      >
                      {pickText(risk, settings.language)}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
