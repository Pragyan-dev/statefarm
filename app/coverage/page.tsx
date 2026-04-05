"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";

import { ApartmentCoverageCard } from "@/components/ApartmentCoverageCard";
import { ApartmentSelector } from "@/components/ApartmentSelector";
import { AutoInsuranceEstimator } from "@/components/coverage/AutoInsuranceEstimator";
import { FemaTimeline } from "@/components/FemaTimeline";
import { useAccessibility } from "@/hooks/useAccessibility";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useViewMode } from "@/hooks/useViewMode";
import {
  DEFAULT_APARTMENT_ZIP,
  deriveProfileLocation,
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

export default function CoveragePage() {
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
        setDisasterData(buildFallbackDisasterHistory(zipData.city, coverageState, settings.language, "fetch-failed"));
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

  if (!isReady || !selectedApartment) {
    return (
      <div className="py-10 text-sm text-[var(--color-muted)]">
        {isSpanish ? "Cargando cobertura..." : "Loading coverage..."}
      </div>
    );
  }

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
    <div className="mx-auto max-w-[1380px] py-4 lg:py-6">
      <section className="mb-6">
        <p className="eyebrow">{isSpanish ? "Cobertura" : "Coverage"}</p>
        <h1 className="font-display text-4xl text-[var(--color-ink)] lg:text-5xl">
          {isSpanish
            ? "Cobertura para donde vives y lo que manejas."
            : "Coverage for where you live and what you drive."}
        </h1>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="rounded-full bg-[var(--color-accent-soft)] px-4 py-2 text-sm font-semibold text-[var(--color-accent)]">
            {zipData.city}, {zipData.state} {activeZip}
          </div>
        </div>
      </section>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isSpanish
          ? `Apartamento seleccionado: ${selectedApartment.name} en ${zipData.city}`
          : `Selected apartment: ${selectedApartment.name} in ${zipData.city}`}
      </div>

      <section className={`mt-6 grid items-start gap-6 ${isWebsite ? "xl:grid-cols-[minmax(0,1.18fr)_minmax(360px,0.82fr)]" : ""}`}>
        <div className="grid gap-6 min-w-0">
          <section className="panel-card mt-0 overflow-hidden">
            <div className="max-w-[40rem]">
              <h2 className="font-display text-3xl leading-tight text-[var(--color-ink)] lg:text-4xl">
                {isSpanish ? "Cobertura de inquilino" : "Renters coverage"}
              </h2>
              <p className="mt-3 text-sm text-[var(--color-muted)]">
                {isSpanish
                  ? "Elige un apartamento y mira cuanto podria costar proteger tus cosas alli."
                  : "Pick an apartment and see what it could cost to protect your belongings there."}
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
