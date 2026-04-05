"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import ssnRequirements from "@/data/ssn-requirements.json";

import { ApartmentCoverageCard } from "@/components/ApartmentCoverageCard";
import { ApartmentSelector } from "@/components/ApartmentSelector";
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

const CoverageMap = dynamic(
  () => import("@/components/CoverageMap").then((module) => module.CoverageMap),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-[280px] place-items-center rounded-[1.8rem] border border-[var(--color-border)] bg-[var(--color-paper)] text-sm text-[var(--color-muted)]">
        Loading map...
      </div>
    ),
  },
);

type Requirements = {
  autoNeedsSsn: boolean;
  acceptsItin: boolean;
  undocumentedLicense: boolean;
};

export default function CoveragePage() {
  const [profile, setProfile, isReady] = useUserProfile();
  const { settings } = useAccessibility();
  const { resolvedMode } = useViewMode();
  const [zipInput, setZipInput] = useState(DEFAULT_APARTMENT_ZIP);
  const [activeZip, setActiveZip] = useState(DEFAULT_APARTMENT_ZIP);
  const [selectedApartmentAddress, setSelectedApartmentAddress] = useState<string | null>(null);
  const [disasterData, setDisasterData] = useState<DisasterHistoryPayload>(
    buildFallbackDisasterHistory("AZ", "en", "fetch-failed"),
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
        const response = await fetch(`/api/fema?state=${coverageState}&language=${settings.language}`);
        const payload = (await response.json()) as DisasterHistoryPayload;
        setDisasterData(payload);
      } catch {
        setDisasterData(buildFallbackDisasterHistory(coverageState, settings.language, "fetch-failed"));
      } finally {
        setLoadingDisasters(false);
      }
    }

    void loadDisasters();
  }, [coverageState, isReady, settings.language]);

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
    return <div className="py-10 text-sm text-[var(--color-muted)]">Loading coverage...</div>;
  }

  const costs = getStateCosts(coverageState);
  const stateCallout = `In ${coverageState}, auto insurance does ${
    requirements.autoNeedsSsn ? "" : "not "
  }require an SSN. ITIN accepted: ${requirements.acceptsItin ? "yes" : "no"}.`;

  const heroCopy = isWebsite
    ? "Drop into a real place, tap an apartment, and see what renter's coverage actually protects."
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
    <div className="mx-auto max-w-[1380px] py-4 lg:py-6">
      <section className={`grid gap-4 ${isWebsite ? "xl:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.78fr)]" : ""}`}>
        <section className="panel-card hero-ambient mt-0 overflow-hidden">
          <p className="eyebrow">Coverage finder</p>
          <h1 className="font-display text-4xl text-[var(--color-ink)] lg:max-w-[11ch]">
            Insurance hits harder when you can see the block, not just the bill.
          </h1>
          <p className="mt-4 max-w-[42ch] text-base text-[var(--color-muted)]">{heroCopy}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="rounded-full bg-[#FFF2E7] px-4 py-2 text-sm font-semibold text-[var(--color-accent)]">
              {zipData.city}, {zipData.state} {activeZip}
            </div>
            <div className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-muted)]">
              {formatCurrency(selectedApartment.estimate, settings.language)}/mo average for your
              selected apartment
            </div>
          </div>
        </section>

        <section className="panel-card mt-0">
          <p className="eyebrow">State rules</p>
          <h2 className="font-display text-2xl text-[var(--color-ink)]">
            {requirements.autoNeedsSsn
              ? `Some insurers in ${coverageState} may ask for an SSN.`
              : `You do NOT need an SSN for auto insurance in ${coverageState}.`}
          </h2>
          <p className="mt-4 text-sm text-[var(--color-muted)]">{stateCallout}</p>
          <div className="mt-5">
            <ReadAloud text={stateCallout} />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-[var(--color-border)] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)]">
                Auto liability
              </p>
              <p className="mt-2 text-2xl font-bold text-[var(--color-ink)]">
                {formatCurrency(costs.autoLiability, settings.language)}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--color-border)] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)]">
                ZIP renter baseline
              </p>
              <p className="mt-2 text-2xl font-bold text-[var(--color-ink)]">
                {formatCurrency(zipData.avgRenters, settings.language)}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--color-border)] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)]">
                No-insurance fine
              </p>
              <p className="mt-2 text-2xl font-bold text-[var(--color-danger)]">
                {formatCurrency(costs.noAutoFine, settings.language)}
              </p>
            </div>
          </div>
        </section>
      </section>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Selected apartment: {selectedApartment.name} in {zipData.city}
      </div>

      <section className={`mt-6 grid items-start gap-6 ${isWebsite ? "xl:grid-cols-[minmax(0,1.18fr)_minmax(360px,0.82fr)]" : ""}`}>
        <div className="grid gap-6 min-w-0">
          <section className="panel-card mt-0 overflow-hidden">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-[40rem]">
                <p className="eyebrow">Map + apartments</p>
                <h2 className="font-display text-3xl leading-tight text-[var(--color-ink)]">
                  Explore the block first. Then choose the apartment that matches your budget.
                </h2>
              </div>
              <p className="max-w-[30ch] text-sm text-[var(--color-muted)]">
                Pins, ZIP changes, and apartment cards stay synchronized so the coverage panel on
                the right always reflects the place you picked.
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
          <ApartmentCoverageCard
            apartment={selectedApartment}
            zipData={zipData}
            language={settings.language}
          />

          <FemaTimeline
            state={coverageState}
            language={settings.language}
            data={disasterData}
            topRisks={zipData.topRisks}
            loading={loadingDisasters}
          />
        </div>
      </section>
    </div>
  );
}
