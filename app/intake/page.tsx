"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useDashboardAccess } from "@/hooks/useDashboardAccess";
import { useAccessibility } from "@/hooks/useAccessibility";
import { useViewMode } from "@/hooks/useViewMode";
import { deriveProfileLocation } from "@/lib/content";
import { saveStoredDashboardAccess } from "@/lib/dashboardAccess";
import { defaultUserProfile, saveStoredProfile } from "@/lib/userProfile";
import type { UserProfile, VisaType } from "@/lib/types";
import { WebsiteRailCard, WebsiteSectionHeader, WebsiteSectionPanel, WebsiteStatRow } from "@/components/website/WebsitePrimitives";

const visaOptions: VisaType[] = ["F1", "H1B", "J1", "O1"];

function getPrefilledProfile(searchParams: ReturnType<typeof useSearchParams>): UserProfile {
  const requestedProduct = searchParams.get("product");
  const requestedZip = searchParams.get("zip");
  const nextProfile = { ...defaultUserProfile };

  if (requestedProduct === "auto") {
    nextProfile.drives = true;
    nextProfile.rents = false;
  } else if (requestedProduct === "renters") {
    nextProfile.drives = false;
    nextProfile.rents = true;
  } else if (requestedProduct === "auto-renters") {
    nextProfile.drives = true;
    nextProfile.rents = true;
  }

  if (requestedZip) {
    const cleanZip = requestedZip.replace(/\D/g, "").slice(0, 5);
    if (cleanZip) {
      nextProfile.zip = cleanZip;
    }
  }

  return nextProfile;
}

export default function IntakePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, setIsDashboardBuilt] = useDashboardAccess();
  const { settings } = useAccessibility();
  const { resolvedMode } = useViewMode();
  const isSpanish = settings.language === "es";
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>(() => getPrefilledProfile(searchParams));
  const locationPreview = deriveProfileLocation(profile.zip);
  const copy = {
    backHome: isSpanish ? "← Volver al inicio" : "← Back home",
    intake: isSpanish ? "Ingreso" : "Intake",
    websiteTitle: isSpanish
      ? "Completa tu plan de proteccion de 30 dias con una experiencia mas guiada."
      : "Complete your 30-day protection plan with a more guided intake.",
    mobileTitle: isSpanish
      ? "Cuatro preguntas rapidas. Luego tu plan de proteccion de 30 dias."
      : "Four fast questions. Then your first 30-day protection plan.",
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
    back: isSpanish ? "Atras" : "Back",
    next: isSpanish ? "Siguiente" : "Next",
    desktopLead: isSpanish
      ? "Usa esta forma guiada para preparar el panel, los escenarios y la cobertura que veras despues."
      : "Use this guided form to prepare the dashboard, scenarios, and coverage tools you will see next.",
    desktopNote: isSpanish
      ? "Puedes ajustar esta informacion mas tarde desde tu panel."
      : "You can adjust this information later from your dashboard.",
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

  function nextStep() {
    if (step === 3) {
      completeIntake();
      return;
    }

    setStep((current) => current + 1);
  }

  function previousStep() {
    setStep((current) => Math.max(0, current - 1));
  }

  if (resolvedMode === "website") {
    return (
      <div className="py-2 lg:py-4">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_22rem]">
          <div className="grid gap-6">
            <Link href="/" className="text-sm font-semibold text-[var(--color-muted)]">
              {copy.backHome}
            </Link>

            <WebsiteSectionHeader
              eyebrow={copy.intake}
              title={copy.websiteTitle}
              description={copy.desktopLead}
              actions={
                <div className="web-feature-chip">
                  {copy.desktopNote}
                </div>
              }
            />

            <form
              onSubmit={(event) => {
                event.preventDefault();
                completeIntake();
              }}
              className="grid gap-5"
            >
              <WebsiteSectionPanel
                eyebrow={isSpanish ? "Paso 1" : "Step 1"}
                title={copy.visaQuestion}
              >
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

              <WebsiteSectionPanel
                eyebrow={isSpanish ? "Paso 2" : "Step 2"}
                title={copy.ssnQuestion}
              >
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
                      <span className="font-semibold text-[var(--color-ink)]">
                        {value ? copy.yes : copy.no}
                      </span>
                    </label>
                  ))}
                </div>
              </WebsiteSectionPanel>

              <WebsiteSectionPanel
                eyebrow={isSpanish ? "Paso 3" : "Step 3"}
                title={copy.coverageQuestion}
              >
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

              <WebsiteSectionPanel
                eyebrow={isSpanish ? "Paso 4" : "Step 4"}
                title={copy.locationQuestion}
              >
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
                <Link href="/" className="web-secondary-button">
                  {copy.backHome}
                </Link>
              </div>
            </form>
          </div>

          <aside className="grid gap-4 xl:sticky xl:top-32 xl:self-start">
            <WebsiteRailCard
              eyebrow={copy.preview}
              title={copy.previewTitle}
              description={copy.introCopy}
            >
              <div className="grid gap-4">
                <WebsiteStatRow label={copy.visaTrack} value={profile.visaStatus} />
                <WebsiteStatRow
                  label={copy.ssnStatus}
                  value={profile.hasSsn ? copy.hasSsn : copy.noSsn}
                />
                <WebsiteStatRow
                  label={copy.locationPreview}
                  value={`${locationPreview.city}, ${locationPreview.state} ${profile.zip}`}
                />
                <WebsiteStatRow
                  label={copy.monthlyIncome}
                  value={`$${profile.monthlyIncome || 0}`}
                />
              </div>
            </WebsiteRailCard>

            <WebsiteRailCard
              eyebrow={copy.unlocks}
              title={isSpanish ? "Tu panel se prepara con esto." : "This prepares your dashboard."}
            >
              <div className="grid gap-3">
                <div className="web-action-row">
                  <div>
                    <p className="font-semibold text-[var(--color-ink)]">
                      {copy.simulator}
                    </p>
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
                    <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">
                      {copy.visaGuideReady}
                    </p>
                  </div>
                </div>
              </div>
            </WebsiteRailCard>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <Link href="/" className="text-sm font-semibold text-[var(--color-muted)]">
        {copy.backHome}
      </Link>

      <section className="panel-card hero-ambient mt-6 overflow-hidden">
        <p className="eyebrow">{copy.intake}</p>
        <h1 className="font-display text-4xl text-[var(--color-ink)]">
          {copy.mobileTitle}
        </h1>
        <p className="mt-4 max-w-[34ch] text-base text-[var(--color-muted)]">
          {copy.introCopy}
        </p>

        <div className="mt-6 flex gap-2">
          {[0, 1, 2, 3].map((index) => (
            <span
              key={index}
              className={`h-2 flex-1 rounded-full ${
                index <= step ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"
              }`}
            />
          ))}
        </div>
      </section>

      {step === 0 ? (
        <fieldset className="panel-card">
          <legend className="font-display text-2xl text-[var(--color-ink)]">
            {copy.visaQuestion}
          </legend>
          <div role="radiogroup" aria-required="true" className="mt-5 grid gap-3">
            {visaOptions.map((visa) => (
              <label
                key={visa}
                className="flex cursor-pointer items-center gap-3 rounded-[1.5rem] border border-[var(--color-border)] px-4 py-4 focus-within:ring-2 focus-within:ring-blue-500"
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
        </fieldset>
      ) : null}

      {step === 1 ? (
        <fieldset className="panel-card">
          <legend className="font-display text-2xl text-[var(--color-ink)]">
            {copy.ssnQuestion}
          </legend>
          <div role="radiogroup" aria-required="true" className="mt-5 grid gap-3">
            {[true, false].map((value) => (
              <label
                key={String(value)}
                className="flex cursor-pointer items-center gap-3 rounded-[1.5rem] border border-[var(--color-border)] px-4 py-4 focus-within:ring-2 focus-within:ring-blue-500"
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
        </fieldset>
      ) : null}

      {step === 2 ? (
        <fieldset className="panel-card">
          <legend className="font-display text-2xl text-[var(--color-ink)]">
            {copy.coverageQuestion}
          </legend>
          <div className="mt-5 grid gap-3">
            <label className="flex cursor-pointer items-center justify-between rounded-[1.5rem] border border-[var(--color-border)] px-4 py-4">
              <div>
                <p className="font-semibold text-[var(--color-ink)]">{copy.driveLabel}</p>
                <p className="text-sm text-[var(--color-muted)]">{copy.driveDetail}</p>
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

            <label className="flex cursor-pointer items-center justify-between rounded-[1.5rem] border border-[var(--color-border)] px-4 py-4">
              <div>
                <p className="font-semibold text-[var(--color-ink)]">{copy.rentLabel}</p>
                <p className="text-sm text-[var(--color-muted)]">{copy.rentDetail}</p>
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
        </fieldset>
      ) : null}

      {step === 3 ? (
        <section className="panel-card">
          <h2 className="font-display text-2xl text-[var(--color-ink)]">{copy.locationQuestion}</h2>
          <div className="mt-5 grid gap-4">
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">{copy.zipCode}</span>
              <input
                value={profile.zip}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    zip: event.target.value.slice(0, 5),
                  }))
                }
                className="w-full rounded-[1.5rem] border border-[var(--color-border)] bg-transparent px-4 py-3 text-[var(--color-ink)]"
                inputMode="numeric"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">
                {copy.income}
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
          </div>
        </section>
      ) : null}

      <div className="mt-6 flex gap-3 pb-6">
        <button
          type="button"
          onClick={previousStep}
          className="min-h-12 flex-1 rounded-full border border-[var(--color-border)] text-sm font-semibold text-[var(--color-ink)]"
          disabled={step === 0}
        >
          {copy.back}
        </button>
        <button
          type="button"
          onClick={nextStep}
          className="min-h-12 flex-1 rounded-full bg-[var(--color-ink)] text-sm font-semibold text-[var(--color-paper)]"
        >
          {step === 3 ? copy.buildDashboard : copy.next}
        </button>
      </div>
    </div>
  );
}
