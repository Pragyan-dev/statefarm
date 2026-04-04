"use client";

import { useMemo, useState } from "react";

import { useAccessibility } from "@/hooks/useAccessibility";
import { useUserProfile } from "@/hooks/useUserProfile";
import { formatCurrency, getStateCosts } from "@/lib/content";

export default function AffordPage() {
  const [profile, setProfile, isReady] = useUserProfile();
  const { settings } = useAccessibility();
  const [rent, setRent] = useState(1250);
  const [groceries, setGroceries] = useState(320);

  const stateCosts = useMemo(() => getStateCosts(profile.state), [profile.state]);

  if (!isReady) {
    return <div className="py-10 text-sm text-[var(--color-muted)]">Loading affordability...</div>;
  }

  const monthlyProtection =
    (profile.drives ? stateCosts.autoLiability : 0) +
    (profile.rents ? stateCosts.rentersMonthly : 0) +
    stateCosts.medicalMonthly;
  const percent = ((monthlyProtection / (profile.monthlyIncome || 1)) * 100).toFixed(1);
  const safetyVsGroceries = (monthlyProtection / groceries).toFixed(1);

  return (
    <div className="py-6">
      <section className="panel-card hero-ambient overflow-hidden">
        <p className="eyebrow">Affordability</p>
        <h1 className="font-display text-4xl text-[var(--color-ink)]">
          Turn insurance into a monthly budget choice, not a vague fear.
        </h1>
        <p className="mt-4 text-base text-[var(--color-muted)]">
          Use your city and habits to compare the cost of coverage against the ordinary numbers
          you already understand.
        </p>
      </section>

      <section className="panel-card">
        <div className="grid gap-4">
          <label>
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
          <label>
            <span className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">Rent</span>
            <input
              type="number"
              value={rent}
              onChange={(event) => setRent(Number(event.target.value) || 0)}
              className="w-full rounded-[1.5rem] border border-[var(--color-border)] bg-transparent px-4 py-3 text-[var(--color-ink)]"
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">
              Groceries
            </span>
            <input
              type="number"
              value={groceries}
              onChange={(event) => setGroceries(Number(event.target.value) || 0)}
              className="w-full rounded-[1.5rem] border border-[var(--color-border)] bg-transparent px-4 py-3 text-[var(--color-ink)]"
            />
          </label>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-[1.5rem] bg-[var(--color-paper)] p-4 shadow-[inset_0_0_0_1px_rgba(14,18,32,0.06)]">
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)]">
              Total monthly protection
            </p>
            <p className="mt-3 text-3xl font-bold text-[var(--color-ink)]">
              {formatCurrency(monthlyProtection, settings.language)}
            </p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              {percent}% of your income in {profile.state}
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-[var(--color-paper)] p-4 shadow-[inset_0_0_0_1px_rgba(14,18,32,0.06)]">
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)]">
              Comparison anchors
            </p>
            <ul className="mt-3 grid gap-2 text-sm text-[var(--color-muted)]">
              <li>Rent: {((monthlyProtection / rent) * 100).toFixed(1)}% of monthly rent</li>
              <li>Groceries: {safetyVsGroceries}× one month of groceries</li>
              <li>Uninsured auto fine: {formatCurrency(stateCosts.noAutoFine, settings.language)}</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
