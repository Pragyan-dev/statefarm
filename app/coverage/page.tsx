"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import ssnRequirements from "@/data/ssn-requirements.json";
import { ApartmentCoverageCard } from "@/components/ApartmentCoverageCard";
import { ApartmentSelector } from "@/components/ApartmentSelector";
import { AutoInsuranceEstimator } from "@/components/coverage/AutoInsuranceEstimator";
import { FemaTimeline } from "@/components/FemaTimeline";
import { ReadAloud } from "@/components/ReadAloud";
import { useAccessibility } from "@/hooks/useAccessibility";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useViewMode } from "@/hooks/useViewMode";
import {
  DEFAULT_APARTMENT_ZIP,
  deriveProfileLocation,
  formatCurrency,
  getStateCosts,
  isSupportedApartmentZip,
  resolveApartmentZip,
} from "@/lib/content";
import { buildFallbackDisasterHistory, type DisasterHistoryPayload } from "@/lib/fema";

function CoverageMapLoading() {
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";

  return (
    <div className="grid h-[280px] place-items-center rounded-[1.8rem] border border-[var(--color-border)] bg-[var(--color-paper)] text-sm text-[var(--color-muted)]">
      {isSpanish ? "Cargando mapa..." : "Loading map..."}
    </div>
  );
}

const CoverageMap = dynamic(
  () => import("@/components/CoverageMap").then((module) => module.CoverageMap),
  {
    ssr: false,
    loading: () => <CoverageMapLoading />,
  },
);

type Requirements = {
  autoNeedsSsn: boolean;
  acceptsItin: boolean;
  undocumentedLicense: boolean;
};

export default function CoveragePage() {
  const t = useTranslations();
  const [profile, setProfile, isReady] = useUserProfile();
  const { settings } = useAccessibility();
  const { resolvedMode } = useViewMode();
  const isSpanish = settings.language === "es";
  const [zipInput, setZipInput] = useState(DEFAULT_APARTMENT_ZIP);
  const [activeZip, setActiveZip] = useState(DEFAULT_APARTMENT_ZIP);
  const [selectedApartmentAddress, setSelectedApartmentAddress] = useState<string | null>(null);
  const [disasterData, setDisasterData] = useState<DisasterHistoryPayload>(
    buildFallbackDisasterHistory("Tempe", "AZ", "en", "fetch-failed"),
  );
  const [loadingDisasters, setLoadingDisasters] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!isReady || initializedRef.current) {
      return;
    }

    const initialZip = profile.zip || DEFAULT_APARTMENT_ZIP;
    const resolved = resolveApartmentZip(initialZip);
    setZipInput(initialZip);
    setActiveZip(resolved.resolvedZip);
    initializedRef.current = true;
  }, [isReady, profile.zip]);

  const { zipData } = useMemo(() => resolveApartmentZip(activeZip), [activeZip]);
  const isWebsite = resolvedMode === "website";
  const unsupportedZip = zipInput.trim().length === 5 && !isSupportedApartmentZip(zipInput.trim());
  const coverageState = zipData.state;

  useEffect(() => {
    if (!zipData.apartments.length) {
      setSelectedApartmentAddress(null);
      return;
    }

    const currentExists = zipData.apartments.some(
      (apartment) => apartment.address === selectedApartmentAddress,
    );

    if (!currentExists) {
      setSelectedApartmentAddress(zipData.apartments[0]?.address ?? null);
    }
  }, [selectedApartmentAddress, zipData.apartments]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    async function loadDisasters() {
      setLoadingDisasters(true);

      try {
        const params = new URLSearchParams({
          city: zipData.city,
          state: coverageState,
          language: settings.language,
        });

        for (const area of zipData.disasterAreaMatches ?? [zipData.city]) {
          params.append("area", area);
        }

        const response = await fetch(`/api/fema?${params.toString()}`);
        const payload = (await response.json()) as DisasterHistoryPayload;
        setDisasterData(payload);
      } catch {
        setDisasterData(
          buildFallbackDisasterHistory(zipData.city, coverageState, settings.language, "fetch-failed"),
        );
      } finally {
        setLoadingDisasters(false);
      }
    }

    void loadDisasters();
  }, [coverageState, isReady, settings.language, zipData.city, zipData.disasterAreaMatches]);

  const selectedApartment =
    zipData.apartments.find((apartment) => apartment.address === selectedApartmentAddress) ??
    zipData.apartments[0] ??
    null;

  const requirements = useMemo(
    () =>
      (ssnRequirements as Record<string, Requirements>)[coverageState] ??
      (ssnRequirements as Record<string, Requirements>)["AZ"],
    [coverageState],
  );

  if (!isReady || !selectedApartment) {
    return (
      <div className="py-10 text-sm text-[var(--color-muted)]">
        {isSpanish ? "Cargando cobertura..." : "Loading coverage..."}
      </div>
    );
  }

  const costs = getStateCosts(coverageState);
  const stateCallout = isSpanish
    ? `En ${coverageState}, el seguro de auto ${requirements.autoNeedsSsn ? "puede requerir" : "no requiere"} SSN. ITIN aceptado: ${requirements.acceptsItin ? "si" : "no"}.`
    : `In ${coverageState}, auto insurance does ${
        requirements.autoNeedsSsn ? "" : "not "
      }require an SSN. ITIN accepted: ${requirements.acceptsItin ? "yes" : "no"}.`;

  const heroCopy = isWebsite
    ? isSpanish
      ? "Entra a un lugar real, toca un apartamento y mira lo que realmente protege el seguro de inquilino."
      : "Drop into a real place, tap an apartment, and see what renter's coverage actually protects."
    : isSpanish
      ? "Toca un pin de apartamento cercano y mira al instante la brecha de proteccion del inquilino."
      : "Tap a nearby apartment pin and see the renter's protection gap instantly.";

  function updateSupportedZip(nextZip: string) {
    const trimmedZip = nextZip.trim();
    const resolved = resolveApartmentZip(trimmedZip);
    const location = deriveProfileLocation(resolved.resolvedZip);

    setActiveZip(resolved.resolvedZip);
    setSelectedApartmentAddress(null);
    setProfile((current) => ({
      ...current,
      zip: trimmedZip,
      city: location.city,
      state: location.state,
      rents: true,
    }));
  }

  function handleZipInputChange(nextValue: string) {
    const sanitized = nextValue.replace(/\D/g, "").slice(0, 5);
    setZipInput(sanitized);

    if (sanitized.length === 5 && isSupportedApartmentZip(sanitized)) {
      updateSupportedZip(sanitized);
    }
  }

  async function handleLocate() {
    setZipInput(DEFAULT_APARTMENT_ZIP);
    updateSupportedZip(DEFAULT_APARTMENT_ZIP);
  }

  return (
    <div className="website-page mx-auto max-w-[1380px]">
      <section
        className={`grid gap-6 ${isWebsite ? "xl:grid-cols-[minmax(0,0.96fr)_minmax(360px,0.84fr)]" : ""}`}
      >
        <section className="page-hero mt-0 p-6 sm:p-8 lg:p-10">
          <p className="eyebrow">{isSpanish ? "Buscador de cobertura" : "Coverage finder"}</p>
          <h1 className="sf-section-title mt-3 max-w-[11ch]">
            {isSpanish
              ? "El seguro se entiende mejor cuando puedes ver la cuadra, no solo la cuenta."
              : "Insurance hits harder when you can see the block, not just the bill."}
          </h1>
          <p className="sf-body-copy mt-4 max-w-[42rem]">{heroCopy}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="status-badge status-badge-accent px-4 py-2 text-sm font-semibold">
              {zipData.city}, {zipData.state} {activeZip}
            </div>
            <div className="status-badge status-badge-neutral border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-muted)]">
              {formatCurrency(selectedApartment.estimate, settings.language)}
              {isSpanish
                ? "/mes promedio para tu apartamento seleccionado"
                : "/mo average for your selected apartment"}
            </div>
          </div>
        </section>

        <section className="sf-side-panel">
          <p className="eyebrow">{t("stateRequirements")}</p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">
            {requirements.autoNeedsSsn
              ? isSpanish
                ? `Algunas aseguradoras en ${coverageState} pueden pedir SSN.`
                : `Some insurers in ${coverageState} may ask for an SSN.`
              : isSpanish
                ? `NO necesitas SSN para el seguro de auto en ${coverageState}.`
                : `You do NOT need an SSN for auto insurance in ${coverageState}.`}
          </h2>
          <p className="mt-4 text-sm text-[var(--color-muted)]">{stateCallout}</p>
          <div className="mt-5">
            <ReadAloud text={stateCallout} />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="sf-stat-card">
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)]">
                {isSpanish ? "Responsabilidad auto" : "Auto liability"}
              </p>
              <p className="mt-2 text-2xl font-bold text-[var(--color-ink)]">
                {formatCurrency(costs.autoLiability, settings.language)}
              </p>
            </div>
            <div className="sf-stat-card">
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)]">
                {isSpanish ? "Base de inquilino por ZIP" : "ZIP renter baseline"}
              </p>
              <p className="mt-2 text-2xl font-bold text-[var(--color-ink)]">
                {formatCurrency(zipData.avgRenters, settings.language)}
              </p>
            </div>
            <div className="sf-stat-card">
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)]">
                {isSpanish ? "Multa sin seguro" : "No-insurance fine"}
              </p>
              <p className="mt-2 text-2xl font-bold text-[var(--color-danger)]">
                {formatCurrency(costs.noAutoFine, settings.language)}
              </p>
            </div>
          </div>
        </section>
      </section>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isSpanish
          ? `Apartamento seleccionado: ${selectedApartment.name} en ${zipData.city}`
          : `Selected apartment: ${selectedApartment.name} in ${zipData.city}`}
      </div>

      <section
        className={`mt-6 grid items-start gap-6 ${isWebsite ? "xl:grid-cols-[minmax(0,1.18fr)_minmax(360px,0.82fr)]" : ""}`}
      >
        <div className="grid min-w-0 gap-6">
          <section className="sf-band mt-0 overflow-hidden p-6 sm:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-[40rem]">
                <p className="eyebrow">{isSpanish ? "Mapa + apartamentos" : "Map + apartments"}</p>
                <h2 className="mt-2 text-3xl font-semibold leading-tight text-[var(--color-ink)]">
                  {isSpanish
                    ? "Explora la zona primero. Luego elige el apartamento que encaja con tu presupuesto."
                    : "Explore the block first. Then choose the apartment that matches your budget."}
                </h2>
              </div>
              <p className="max-w-[30ch] text-sm text-[var(--color-muted)]">
                {isSpanish
                  ? "Los pines, el cambio de ZIP y las tarjetas se mantienen sincronizados para que el panel de cobertura siempre refleje el lugar que elegiste."
                  : "Pins, ZIP changes, and apartment cards stay synchronized so the coverage panel on the right always reflects the place you picked."}
              </p>
            </div>

            <div className="mt-5 grid gap-5">
              <CoverageMap
                center={zipData.center}
                apartments={zipData.apartments}
                selectedApartmentAddress={selectedApartment.address}
                language={settings.language}
                onApartmentSelect={(apartment) => setSelectedApartmentAddress(apartment.address)}
              />

              <ApartmentSelector
                zipInput={zipInput}
                activeZip={activeZip}
                zipData={zipData}
                selectedApartmentAddress={selectedApartment.address}
                unsupportedZip={unsupportedZip}
                layout={isWebsite ? "website" : "app"}
                onZipInputChange={handleZipInputChange}
                onLocate={handleLocate}
                onApartmentSelect={(apartment) => setSelectedApartmentAddress(apartment.address)}
              />
            </div>
          </section>
        </div>

        <div className={`grid gap-6 ${isWebsite ? "xl:sticky xl:top-28" : ""}`}>
          <FemaTimeline
            state={coverageState}
            language={settings.language}
            data={disasterData}
            topRisks={zipData.topRisks}
            loading={loadingDisasters}
          />

          <ApartmentCoverageCard
            apartment={selectedApartment}
            zipData={zipData}
            language={settings.language}
          />
        </div>
      </section>

      <section className="mt-6">
        <AutoInsuranceEstimator state={coverageState} zip={activeZip} />
      </section>
    </div>
  );
}
