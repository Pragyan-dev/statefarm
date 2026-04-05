"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { WebsiteRailCard, WebsiteSectionHeader, WebsiteSectionPanel, WebsiteStatRow } from "@/components/website/WebsitePrimitives";
import { useAccessibility } from "@/hooks/useAccessibility";
import { useDashboardAccess } from "@/hooks/useDashboardAccess";
import { deriveProfileLocation } from "@/lib/content";
import { saveStoredDashboardAccess } from "@/lib/dashboardAccess";
import { defaultUserProfile, saveStoredProfile } from "@/lib/userProfile";
import type { UserProfile, VisaType } from "@/lib/types";

const visaOptions: VisaType[] = ["F1", "H1B", "J1", "O1"];

export type DashboardBuilderSeed = {
  product: "auto" | "renters" | "auto-renters";
  zip: string;
};

export function profileFromSeed(seed: DashboardBuilderSeed): UserProfile {
  const nextProfile = { ...defaultUserProfile, zip: seed.zip || defaultUserProfile.zip };

  if (seed.product === "auto") {
    nextProfile.drives = true;
    nextProfile.rents = false;
  } else if (seed.product === "renters") {
    nextProfile.drives = false;
    nextProfile.rents = true;
  } else {
    nextProfile.drives = true;
    nextProfile.rents = true;
  }

  return nextProfile;
}

export function WebsiteDashboardBuilder({
  initialSeed,
}: {
  initialSeed: DashboardBuilderSeed;
}) {
  const router = useRouter();
  const [, setIsDashboardBuilt] = useDashboardAccess();
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";
  const [profile, setProfile] = useState<UserProfile>(() => profileFromSeed(initialSeed));
  const locationPreview = deriveProfileLocation(profile.zip);
  const copy = {
    intake: isSpanish ? "Ingreso" : "Intake",
    websiteTitle: isSpanish
      ? "Completa tu plan de proteccion de 30 dias con una experiencia mas guiada."
      : "Complete your 30-day protection plan with a more guided intake.",
    introCopy: isSpanish
      ? "Vamos a personalizar el simulador, la guia de cobertura, la lista de visa y la ayuda para reclamos segun tus primeros meses en Estados Unidos."
      : "We will tailor the simulator, coverage guide, visa checklist, and claim help to your first months in the US.",
    visaQuestion: isSpanish ? "Cual es tu tipo de visa?" : "What is your visa status?",
    ssnQuestion: isSpanish ? "Ya tienes SSN?" : "Do you already have an SSN?",
    yes: isSpanish ? "Si" : "Yes",
    no: isSpanish ? "No" : "No",
    coverageQuestion: isSpanish ? "Que necesitas proteger?" : "What do you need covered?",
    driveLabel: isSpanish ? "Manejo" : "I drive",
    driveDetail: isSpanish ? "Mostrar escenarios de seguro de auto" : "Show auto insurance scenarios",
    rentLabel: isSpanish ? "Alquilo" : "I rent",
    rentDetail: isSpanish
      ? "Mostrar seguro de inquilino y riesgo del apartamento"
      : "Show renter's insurance and apartment risk",
    locationQuestion: isSpanish ? "Donde estas empezando?" : "Where are you starting?",
    zipCode: isSpanish ? "Codigo ZIP" : "ZIP code",
    income: isSpanish ? "Ingreso mensual" : "Monthly income",
    buildDashboard: isSpanish ? "Crear mi panel" : "Build my dashboard",
    preview: isSpanish ? "Resumen del perfil" : "Profile summary",
    previewTitle: isSpanish
      ? "Tu informacion ya esta moldeando la herramienta."
      : "Your information is already shaping the toolkit.",
    visaTrack: isSpanish ? "Ruta de visa" : "Visa track",
    ssnStatus: isSpanish ? "Estado del SSN" : "SSN status",
    hasSsn: isSpanish ? "Ya tienes uno" : "Already have one",
    noSsn: isSpanish ? "Todavia no tienes SSN" : "No SSN yet",
    locationPreview: isSpanish ? "Vista de ubicacion" : "Location preview",
    monthlyIncome: isSpanish ? "Ingreso mensual" : "Monthly income",
    unlocks: isSpanish ? "Lo que desbloqueas despues" : "What unlocks next",
    simulator: isSpanish ? "Simulador" : "Simulator",
    simulatorReady: isSpanish ? "Adaptado a tus riesgos" : "Tailored to your risks",
    simulatorFallback: isSpanish ? "Solo respaldo medico" : "Medical-only fallback",
    coverageFinder: isSpanish ? "Buscador de cobertura" : "Coverage finder",
    coverageReady: isSpanish ? "Apartamento + estimado de inquilino listo" : "Apartment + renter's estimate ready",
    coverageRules: isSpanish ? "Solo reglas estatales" : "State rules only",
    visaGuide: isSpanish ? "Guia de visa" : "Visa guide",
    visaGuideReady: isSpanish
      ? `${profile.visaStatus} checklist y tareas para los primeros 30 dias`
      : `${profile.visaStatus} checklist and first-30-day tasks`,
    desktopLead: isSpanish
      ? "Usa esta forma guiada para preparar el panel, los escenarios y la cobertura que veras despues."
      : "Use this guided form to prepare the dashboard, scenarios, and coverage tools you will see next.",
    desktopNote: isSpanish
      ? "Solo el sitio principal es publico hasta que termines este paso."
      : "Only the website overview stays public until you finish this step.",
  };

  function completeIntake() {
    const nextProfile = {
      ...profile,
      ...locationPreview,
    };
    saveStoredProfile(nextProfile);
    saveStoredDashboardAccess(true);
    setIsDashboardBuilt(true);
    router.push("/dashboard");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_22rem]">
      <div className="grid gap-5">
        <WebsiteSectionHeader
          eyebrow={copy.intake}
          title={copy.websiteTitle}
          description={copy.desktopLead}
          actions={<div className="web-feature-chip">{copy.desktopNote}</div>}
        />

        <form
          onSubmit={(event) => {
            event.preventDefault();
            completeIntake();
          }}
          className="grid gap-5"
        >
          <WebsiteSectionPanel eyebrow={isSpanish ? "Paso 1" : "Step 1"} title={copy.visaQuestion}>
            <div role="radiogroup" aria-required="true" className="grid gap-3 md:grid-cols-2">
              {visaOptions.map((visa) => (
                <label
                  key={visa}
                  className={`web-choice-card flex cursor-pointer items-center gap-3 ${
                    profile.visaStatus === visa ? "web-choice-card-active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="visa"
                    checked={profile.visaStatus === visa}
                    onChange={() =>
                      setProfile((current) => ({
                        ...current,
                        visaStatus: visa,
                      }))
                    }
                    className="h-5 w-5 accent-[var(--color-accent)]"
                  />
                  <span className="font-semibold text-[var(--color-ink)]">{visa}</span>
                </label>
              ))}
            </div>
          </WebsiteSectionPanel>

          <WebsiteSectionPanel eyebrow={isSpanish ? "Paso 2" : "Step 2"} title={copy.ssnQuestion}>
            <div role="radiogroup" aria-required="true" className="grid gap-3 md:grid-cols-2">
              {[true, false].map((value) => (
                <label
                  key={String(value)}
                  className={`web-choice-card flex cursor-pointer items-center gap-3 ${
                    profile.hasSsn === value ? "web-choice-card-active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="hasSsn"
                    checked={profile.hasSsn === value}
                    onChange={() =>
                      setProfile((current) => ({
                        ...current,
                        hasSsn: value,
                      }))
                    }
                    className="h-5 w-5 accent-[var(--color-accent)]"
                  />
                  <span className="font-semibold text-[var(--color-ink)]">{value ? copy.yes : copy.no}</span>
                </label>
              ))}
            </div>
          </WebsiteSectionPanel>

          <WebsiteSectionPanel eyebrow={isSpanish ? "Paso 3" : "Step 3"} title={copy.coverageQuestion}>
            <div className="grid gap-3 md:grid-cols-2">
              <label className={`web-choice-card flex cursor-pointer items-center justify-between gap-3 ${profile.drives ? "web-choice-card-active" : ""}`}>
                <div>
                  <p className="font-semibold text-[var(--color-ink)]">{copy.driveLabel}</p>
                  <p className="text-sm leading-6 text-[var(--color-muted)]">{copy.driveDetail}</p>
                </div>
                <input
                  type="checkbox"
                  checked={profile.drives}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      drives: event.target.checked,
                    }))
                  }
                  className="h-5 w-5 accent-[var(--color-accent)]"
                />
              </label>

              <label className={`web-choice-card flex cursor-pointer items-center justify-between gap-3 ${profile.rents ? "web-choice-card-active" : ""}`}>
                <div>
                  <p className="font-semibold text-[var(--color-ink)]">{copy.rentLabel}</p>
                  <p className="text-sm leading-6 text-[var(--color-muted)]">{copy.rentDetail}</p>
                </div>
                <input
                  type="checkbox"
                  checked={profile.rents}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      rents: event.target.checked,
                    }))
                  }
                  className="h-5 w-5 accent-[var(--color-accent)]"
                />
              </label>
            </div>
          </WebsiteSectionPanel>

          <WebsiteSectionPanel eyebrow={isSpanish ? "Paso 4" : "Step 4"} title={copy.locationQuestion}>
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="web-field-label">{copy.zipCode}</span>
                <input
                  value={profile.zip}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      zip: event.target.value.slice(0, 5),
                    }))
                  }
                  className="web-input"
                  inputMode="numeric"
                />
              </label>

              <label>
                <span className="web-field-label">{copy.income}</span>
                <input
                  type="number"
                  value={profile.monthlyIncome}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      monthlyIncome: Number(event.target.value) || 0,
                    }))
                  }
                  className="web-input"
                />
              </label>
            </div>
          </WebsiteSectionPanel>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="web-primary-button">
              {copy.buildDashboard}
            </button>
          </div>
        </form>
      </div>

      <aside className="grid gap-4 xl:sticky xl:top-32 xl:self-start">
        <WebsiteRailCard eyebrow={copy.preview} title={copy.previewTitle} description={copy.introCopy}>
          <div className="grid gap-4">
            <WebsiteStatRow label={copy.visaTrack} value={profile.visaStatus} />
            <WebsiteStatRow label={copy.ssnStatus} value={profile.hasSsn ? copy.hasSsn : copy.noSsn} />
            <WebsiteStatRow
              label={copy.locationPreview}
              value={`${locationPreview.city}, ${locationPreview.state} ${profile.zip}`}
            />
            <WebsiteStatRow label={copy.monthlyIncome} value={`$${profile.monthlyIncome || 0}`} />
          </div>
        </WebsiteRailCard>

        <WebsiteRailCard
          eyebrow={copy.unlocks}
          title={isSpanish ? "Tu panel se prepara con esto." : "This prepares your dashboard."}
        >
          <div className="grid gap-3">
            <div className="web-action-row">
              <div>
                <p className="font-semibold text-[var(--color-ink)]">{copy.simulator}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">
                  {profile.drives || profile.rents ? copy.simulatorReady : copy.simulatorFallback}
                </p>
              </div>
            </div>
            <div className="web-action-row">
              <div>
                <p className="font-semibold text-[var(--color-ink)]">{copy.coverageFinder}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">
                  {profile.rents ? copy.coverageReady : copy.coverageRules}
                </p>
              </div>
            </div>
            <div className="web-action-row">
              <div>
                <p className="font-semibold text-[var(--color-ink)]">{copy.visaGuide}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">{copy.visaGuideReady}</p>
              </div>
            </div>
          </div>
        </WebsiteRailCard>
      </aside>
    </div>
  );
}
