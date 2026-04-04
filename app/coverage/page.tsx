"use client";

import { useEffect, useMemo, useState } from "react";
import ssnRequirements from "@/data/ssn-requirements.json";

import { ApartmentSelector } from "@/components/ApartmentSelector";
import { ReadAloud } from "@/components/ReadAloud";
import { useAccessibility } from "@/hooks/useAccessibility";
import { useUserProfile } from "@/hooks/useUserProfile";
import { formatCurrency, getStateCosts } from "@/lib/content";
import type { ApartmentListing, ApartmentZipData } from "@/lib/types";

interface DisasterSummary {
  title: string;
  date: string;
  incidentType?: string;
}

function getLowerRentAmount(range: string) {
  const match = range.replaceAll(",", "").match(/\$([0-9]+)/);
  return match ? Number(match[1]) : 1200;
}

export default function CoveragePage() {
  const [profile, setProfile, isReady] = useUserProfile();
  const { settings } = useAccessibility();
  const [selectedApartment, setSelectedApartment] = useState<ApartmentListing | null>(null);
  const [selectedZipData, setSelectedZipData] = useState<ApartmentZipData | null>(null);
  const [disasters, setDisasters] = useState<DisasterSummary[]>([]);
  const [loadingDisasters, setLoadingDisasters] = useState(false);

  const requirements = useMemo(
    () =>
      (ssnRequirements as Record<string, {
        autoNeedsSsn: boolean;
        acceptsItin: boolean;
        undocumentedLicense: boolean;
      }>)[profile.state] ?? (ssnRequirements as Record<string, {
        autoNeedsSsn: boolean;
        acceptsItin: boolean;
        undocumentedLicense: boolean;
      }>)["AZ"],
    [profile.state],
  );

  useEffect(() => {
    if (!isReady) {
      return;
    }

    async function loadDisasters() {
      setLoadingDisasters(true);
      try {
        const response = await fetch(`/api/fema?state=${profile.state}&language=${settings.language}`);
        const payload = (await response.json()) as { items: DisasterSummary[] };
        setDisasters(payload.items);
      } catch {
        setDisasters([]);
      } finally {
        setLoadingDisasters(false);
      }
    }

    void loadDisasters();
  }, [isReady, profile.state, settings.language]);

  if (!isReady) {
    return <div className="py-10 text-sm text-[var(--color-muted)]">Loading coverage...</div>;
  }

  const costs = getStateCosts(profile.state);
  const selectedEstimate = selectedApartment?.estimate ?? costs.rentersMonthly;
  const rentPercent = selectedApartment
    ? ((selectedEstimate / getLowerRentAmount(selectedApartment.rentRange)) * 100).toFixed(1)
    : null;
  const stateCallout = `In ${profile.state}, auto insurance does ${
    requirements.autoNeedsSsn ? "" : "not "
  }require an SSN. ITIN accepted: ${requirements.acceptsItin ? "yes" : "no"}.`;

  return (
    <div className="py-6">
      <section className="panel-card hero-ambient overflow-hidden">
        <p className="eyebrow">Coverage finder</p>
        <h1 className="font-display text-4xl text-[var(--color-ink)]">
          Match your ZIP code to real first-month protection.
        </h1>
        <p className="mt-4 text-base text-[var(--color-muted)]">
          Start with a renter&apos;s estimate, then stack on the state rules and disaster history
          that change your risk.
        </p>
        <div className="mt-5">
          <ReadAloud text={stateCallout} />
        </div>
      </section>

      <ApartmentSelector
        zip={profile.zip}
        onZipChange={(zip) => {
          setProfile((current) => ({
            ...current,
            zip,
          }));
        }}
        onApartmentSelect={(apartment, zipData) => {
          setSelectedApartment(apartment);
          setSelectedZipData(zipData);
          setProfile((current) => ({
            ...current,
            zip: current.zip,
            city: zipData.city,
            state: zipData.state,
            rents: true,
          }));
        }}
      />

      <section className="panel-card">
        <p className="eyebrow">State rules</p>
        <h2 className="font-display text-2xl text-[var(--color-ink)]">
          {requirements.autoNeedsSsn
            ? `You may need an SSN for some policies in ${profile.state}.`
            : `You do NOT need an SSN for auto insurance in ${profile.state}.`}
        </h2>
        <p className="mt-4 text-sm text-[var(--color-muted)]">{stateCallout}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
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
              Renter&apos;s insurance
            </p>
            <p className="mt-2 text-2xl font-bold text-[var(--color-ink)]">
              {formatCurrency(selectedEstimate, settings.language)}
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

      {selectedApartment && selectedZipData ? (
        <section className="panel-card">
          <p className="eyebrow">Selected apartment</p>
          <h2 className="font-display text-2xl text-[var(--color-ink)]">
            {selectedApartment.name}
          </h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">{selectedApartment.address}</p>
          <div className="mt-5 rounded-[1.5rem] bg-[var(--color-paper)] p-4 shadow-[inset_0_0_0_1px_rgba(14,18,32,0.06)]">
            <p className="text-3xl font-bold text-[var(--color-ink)]">
              {formatCurrency(selectedApartment.estimate, settings.language)} / month
            </p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Covers the belongings you are rebuilding your life with in {selectedZipData.city}.
            </p>
            {rentPercent ? (
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                That is {rentPercent}% of the low end of your rent.
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="panel-card">
        <p className="eyebrow">Recent disaster history</p>
        <h2 className="font-display text-2xl text-[var(--color-ink)]">
          FEMA declarations in {profile.state}
        </h2>
        {loadingDisasters ? (
          <p className="mt-4 text-sm text-[var(--color-muted)]">Loading FEMA data...</p>
        ) : (
          <ul className="mt-5 grid gap-3">
            {disasters.map((item) => (
              <li
                key={`${item.title}-${item.date}`}
                className="rounded-[1.5rem] border border-[var(--color-border)] px-4 py-4"
              >
                <p className="font-semibold text-[var(--color-ink)]">{item.title}</p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {item.date} {item.incidentType ? `· ${item.incidentType}` : ""}
                </p>
              </li>
            ))}
            {!disasters.length ? (
              <li className="rounded-[1.5rem] border border-[var(--color-border)] px-4 py-4 text-sm text-[var(--color-muted)]">
                No FEMA history available right now.
              </li>
            ) : null}
          </ul>
        )}
      </section>
    </div>
  );
}
