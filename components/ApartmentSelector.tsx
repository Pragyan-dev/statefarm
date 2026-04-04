"use client";

import { useState } from "react";
import apartmentData from "@/data/apartments.json";
import { useAccessibility } from "@/hooks/useAccessibility";
import { pickText } from "@/lib/content";
import type { ApartmentListing, ApartmentZipData } from "@/lib/types";

export function ApartmentSelector({
  zip,
  onZipChange,
  onApartmentSelect,
}: {
  zip: string;
  onZipChange: (zip: string) => void;
  onApartmentSelect: (apartment: ApartmentListing, zipData: ApartmentZipData) => void;
}) {
  const { settings } = useAccessibility();
  const [isLocating, setIsLocating] = useState(false);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [selectedZip, setSelectedZip] = useState(zip);

  const zipData =
    (apartmentData as Record<string, ApartmentZipData>)[selectedZip] ??
    (apartmentData as Record<string, ApartmentZipData>)["85281"];

  async function handleLocate() {
    setIsLocating(true);
    await new Promise((resolve) => window.setTimeout(resolve, 900));
    setSelectedZip("85281");
    onZipChange("85281");
    setLocationConfirmed(true);
    setIsLocating(false);
  }

  return (
    <section className="panel-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Coverage finder</p>
          <h2 className="font-display text-2xl text-[var(--color-ink)]">
            Apartment + renter&apos;s estimate
          </h2>
        </div>
        <button
          type="button"
          onClick={handleLocate}
          disabled={isLocating}
          className="rounded-full bg-[var(--color-ink)] px-4 py-3 text-sm font-semibold text-[var(--color-paper)]"
        >
          {isLocating
            ? settings.language === "es"
              ? "Buscando..."
              : "Locating..."
            : settings.language === "es"
              ? "Buscar cerca de mi"
              : "Find near me"}
        </button>
      </div>

      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">
          ZIP code
        </span>
        <input
          value={selectedZip}
          onChange={(event) => {
            setSelectedZip(event.target.value);
            onZipChange(event.target.value);
            setLocationConfirmed(false);
          }}
          className="w-full rounded-2xl border border-[var(--color-border)] bg-transparent px-4 py-3 text-base text-[var(--color-ink)]"
          maxLength={5}
        />
      </label>

      <div
        className="mt-4 rounded-[1.5rem] bg-[var(--color-paper)] p-4 text-sm text-[var(--color-muted)] shadow-[inset_0_0_0_1px_rgba(14,18,32,0.06)]"
        aria-live="polite"
        aria-atomic="true"
      >
        {locationConfirmed
          ? `${settings.language === "es" ? "Ubicacion confirmada" : "Location confirmed"}: ${zipData.city}, ${zipData.state} ${selectedZip}`
          : `${zipData.city}, ${zipData.state} ${selectedZip}`}
      </div>

      <div className="mt-5 grid gap-3">
        {zipData.apartments.map((apartment) => (
          <button
            key={`${apartment.name}-${apartment.address}`}
            type="button"
            onClick={() => onApartmentSelect(apartment, zipData)}
            className="rounded-[1.75rem] border border-[var(--color-border)] px-4 py-4 text-left transition hover:border-[var(--color-accent)] hover:bg-[var(--color-paper)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-[var(--color-ink)]">{apartment.name}</h3>
                <p className="mt-1 text-sm text-[var(--color-muted)]">{apartment.address}</p>
              </div>
              <span className="rounded-full bg-[var(--color-highlight)] px-3 py-1 text-xs font-semibold text-[var(--color-ink)]">
                ${apartment.estimate}/mo
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-[var(--color-muted)]">
              <span>{apartment.rentRange}</span>
              <span>{apartment.beds}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {zipData.topRisks.map((risk) => (
          <span
            key={risk.en}
            className="rounded-full border border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-[var(--color-muted)]"
          >
            {pickText(risk, settings.language)}
          </span>
        ))}
      </div>
    </section>
  );
}
