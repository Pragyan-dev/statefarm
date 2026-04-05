"use client";

import { useMemo, useState } from "react";

import { useAccessibility } from "@/hooks/useAccessibility";
import { useUserProfile } from "@/hooks/useUserProfile";
import { formatCurrency, getStateCosts } from "@/lib/content";

export default function AffordPage() {
  const [profile, setProfile, isReady] = useUserProfile();
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";
  const [rent, setRent] = useState(1250);
  const [groceries, setGroceries] = useState(320);

  const stateCosts = useMemo(() => getStateCosts(profile.state), [profile.state]);

  if (!isReady) {
    return <div className="py-10 text-sm text-[var(--color-muted)]">{isSpanish ? "Cargando asequibilidad..." : "Loading affordability..."}</div>;
  }

  const monthlyProtection =
    (profile.drives ? stateCosts.autoLiability : 0) +
    (profile.rents ? stateCosts.rentersMonthly : 0) +
    stateCosts.medicalMonthly;
  const percent = ((monthlyProtection / (profile.monthlyIncome || 1)) * 100).toFixed(1);
  const safetyVsGroceries = (monthlyProtection / groceries).toFixed(1);

  return (
    <div className="py-6 lg:py-10">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="panel-card hero-ambient overflow-hidden">
          <p className="eyebrow">{isSpanish ? "Asequibilidad" : "Affordability"}</p>
          <h1 className="font-display text-4xl text-[var(--color-ink)] lg:max-w-[10ch]">
            {isSpanish
              ? "Convierte el seguro en una decision mensual de presupuesto, no en un miedo vago."
              : "Turn insurance into a monthly budget choice, not a vague fear."}
          </h1>
          <p className="mt-4 max-w-[40ch] text-base text-[var(--color-muted)]">
            {isSpanish
              ? "Usa tu ciudad y tus habitos para comparar el costo de la cobertura con numeros cotidianos que ya entiendes."
              : "Use your city and habits to compare the cost of coverage against the ordinary numbers you already understand."}
          </p>
        </section>

        <section className="panel-card">
          <div className="grid gap-4">
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">
                {isSpanish ? "Ingreso mensual" : "Monthly income"}
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
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">{isSpanish ? "Alquiler" : "Rent"}</span>
                <input
                  type="number"
                  value={rent}
                  onChange={(event) => setRent(Number(event.target.value) || 0)}
                  className="w-full rounded-[1.5rem] border border-[var(--color-border)] bg-transparent px-4 py-3 text-[var(--color-ink)]"
                />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">
                  {isSpanish ? "Comida" : "Groceries"}
                </span>
                <input
                  type="number"
                  value={groceries}
                  onChange={(event) => setGroceries(Number(event.target.value) || 0)}
                  className="w-full rounded-[1.5rem] border border-[var(--color-border)] bg-transparent px-4 py-3 text-[var(--color-ink)]"
                />
              </label>
            </div>
          </div>
        </section>
      </section>

      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="panel-card">
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)]">
            {isSpanish ? "Proteccion mensual total" : "Total monthly protection"}
          </p>
          <p className="mt-3 text-4xl font-bold text-[var(--color-ink)]">
            {formatCurrency(monthlyProtection, settings.language)}
          </p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            {percent}% {isSpanish ? `de tu ingreso en ${profile.state}` : `of your income in ${profile.state}`}
          </p>
        </div>
        <div className="panel-card">
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)]">
            {isSpanish ? "Puntos de comparacion" : "Comparison anchors"}
          </p>
          <ul className="mt-3 grid gap-2 text-sm text-[var(--color-muted)]">
            <li>
              {isSpanish ? "Alquiler" : "Rent"}: {((monthlyProtection / rent) * 100).toFixed(1)}%
              {isSpanish ? " del alquiler mensual" : " of monthly rent"}
            </li>
            <li>
              {isSpanish ? "Comida" : "Groceries"}: {safetyVsGroceries}
              {isSpanish ? "× un mes de comida" : "× one month of groceries"}
            </li>
            <li>
              {isSpanish ? "Multa por manejar sin seguro" : "Uninsured auto fine"}:{" "}
              {formatCurrency(stateCosts.noAutoFine, settings.language)}
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
