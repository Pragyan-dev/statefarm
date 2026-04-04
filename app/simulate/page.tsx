"use client";

import { useMemo } from "react";
import scenarios from "@/data/scenarios.json";

import { ScenarioCard } from "@/components/ScenarioCard";
import { useAccessibility } from "@/hooks/useAccessibility";
import { useUserProfile } from "@/hooks/useUserProfile";
import { affordabilityCopy, formatCurrency, getStateCosts } from "@/lib/content";
import type { ScenarioData } from "@/lib/types";

export default function SimulatePage() {
  const [profile, setProfile, isReady] = useUserProfile();
  const { settings } = useAccessibility();

  const visibleScenarios = useMemo(
    () =>
      (scenarios as ScenarioData[]).filter((scenario) => {
        if (scenario.appliesIf === "always") {
          return true;
        }
        if (scenario.appliesIf === "drives") {
          return profile.drives;
        }
        return profile.rents;
      }),
    [profile.drives, profile.rents],
  );

  if (!isReady) {
    return <div className="py-10 text-sm text-[var(--color-muted)]">Loading simulator...</div>;
  }

  const costs = getStateCosts(profile.state);
  const monthlyAnchor = profile.drives ? costs.autoLiability : costs.rentersMonthly;

  return (
    <div className="py-6">
      <section className="panel-card hero-ambient overflow-hidden">
        <p className="eyebrow">Shock simulator</p>
        <h1 className="font-display text-4xl text-[var(--color-ink)]">
          Show the cost of waiting, not just the monthly premium.
        </h1>
        <p className="mt-4 text-base text-[var(--color-muted)]">
          These scenarios use your profile in {profile.city}, {profile.state}. Each chart pairs a
          patterned high-risk bar with the smaller insured out-of-pocket moment.
        </p>
      </section>

      {visibleScenarios.map((scenario) => (
        <ScenarioCard key={scenario.id} scenario={scenario} />
      ))}

      <section className="panel-card">
        <p className="eyebrow">Can I afford this?</p>
        <h2 className="font-display text-2xl text-[var(--color-ink)]">
          Keep the monthly number in proportion.
        </h2>
        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">
            Monthly income
          </span>
          <input
            type="number"
            value={profile.monthlyIncome}
            onChange={(event) =>
              setProfile((current) => ({
                ...current,
                monthlyIncome: Number(event.target.value) || 0,
              }))
            }
            className="w-full rounded-[1.5rem] border border-[var(--color-border)] bg-transparent px-4 py-3 text-[var(--color-ink)]"
          />
        </label>
        <div className="mt-5 rounded-[1.5rem] bg-[var(--color-paper)] p-4 shadow-[inset_0_0_0_1px_rgba(14,18,32,0.06)]">
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)]">
            Coverage anchor
          </p>
          <p className="mt-3 text-3xl font-bold text-[var(--color-ink)]">
            {formatCurrency(monthlyAnchor, settings.language)} / month
          </p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            {affordabilityCopy(profile.monthlyIncome, monthlyAnchor, settings.language)}
          </p>
        </div>
      </section>
    </div>
  );
}
