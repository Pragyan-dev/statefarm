"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useDashboardAccess } from "@/hooks/useDashboardAccess";
import { useAccessibility } from "@/hooks/useAccessibility";
import { useViewMode } from "@/hooks/useViewMode";
import { deriveProfileLocation } from "@/lib/content";
import { saveStoredDashboardAccess } from "@/lib/dashboardAccess";
import { defaultUserProfile, saveStoredProfile } from "@/lib/userProfile";
import type { UserProfile, VisaType } from "@/lib/types";

const visaOptions: VisaType[] = ["F1", "H1B", "J1", "O1"];

export default function IntakePage() {
  const router = useRouter();
  const [, setIsDashboardBuilt] = useDashboardAccess();
  const { settings } = useAccessibility();
  const { resolvedMode } = useViewMode();
  const isSpanish = settings.language === "es";
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>(defaultUserProfile);
  const locationPreview = deriveProfileLocation(profile.zip);
  const copy = {
    backHome: isSpanish ? "← Volver al inicio" : "← Back home",
    intake: isSpanish ? "Ingreso" : "Intake",
    websiteTitle: isSpanish
      ? "Construye tu plan de proteccion para los primeros 30 dias en una sola pasada."
      : "Build your first 30-day protection plan in one pass.",
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
    preview: isSpanish ? "Vista previa" : "Preview",
    previewTitle: isSpanish
      ? "Tu perfil ya esta dando forma a la herramienta."
      : "Your profile is shaping the toolkit already.",
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
      <div className="website-page">
        <div className="sf-main-grid lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <div className="grid gap-6">
            <Link href="/" className="button-quiet w-fit text-sm">
              {copy.backHome}
            </Link>

            <section className="page-hero p-6 sm:p-8 lg:p-10">
              <p className="eyebrow">{copy.intake}</p>
              <h1 className="sf-section-title mt-3 max-w-[12ch]">
                {copy.websiteTitle}
              </h1>
              <p className="sf-body-copy mt-4 max-w-[42rem]">
                {copy.introCopy}
              </p>
            </section>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                completeIntake();
              }}
              className="grid gap-6"
            >
              <fieldset className="panel-card">
                <legend className="text-2xl font-semibold text-[var(--color-ink)]">
                  {copy.visaQuestion}
                </legend>
                <div role="radiogroup" aria-required="true" className="mt-5 grid gap-3 md:grid-cols-2">
                  {visaOptions.map((visa) => (
                    <label
                      key={visa}
                      className={`choice-card flex cursor-pointer items-center gap-3 px-4 py-4 focus-within:ring-2 focus-within:ring-blue-500 ${
                        profile.visaStatus === visa ? "choice-card-active" : ""
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
              </fieldset>

              <fieldset className="panel-card">
                <legend className="text-2xl font-semibold text-[var(--color-ink)]">
                  {copy.ssnQuestion}
                </legend>
                <div role="radiogroup" aria-required="true" className="mt-5 grid gap-3 md:grid-cols-2">
                  {[true, false].map((value) => (
                    <label
                      key={String(value)}
                      className={`choice-card flex cursor-pointer items-center gap-3 px-4 py-4 focus-within:ring-2 focus-within:ring-blue-500 ${
                        profile.hasSsn === value ? "choice-card-active" : ""
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
              </fieldset>

              <fieldset className="panel-card">
                <legend className="text-2xl font-semibold text-[var(--color-ink)]">
                  {copy.coverageQuestion}
                </legend>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <label className={`choice-card flex cursor-pointer items-center justify-between px-4 py-4 ${profile.drives ? "choice-card-active" : ""}`}>
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

                  <label className={`choice-card flex cursor-pointer items-center justify-between px-4 py-4 ${profile.rents ? "choice-card-active" : ""}`}>
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

              <section className="panel-card">
                <h2 className="text-2xl font-semibold text-[var(--color-ink)]">{copy.locationQuestion}</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label>
                    <span className="field-label">{copy.zipCode}</span>
                    <input
                      value={profile.zip}
                      onChange={(event) =>
                        setProfile((current) => ({
                          ...current,
                          zip: event.target.value.slice(0, 5),
                        }))
                      }
                      className="field-input"
                      inputMode="numeric"
                    />
                  </label>

                  <label>
                    <span className="field-label">
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
                      className="field-input"
                    />
                  </label>
                </div>
              </section>

              <div className="flex flex-wrap gap-3 pb-6">
                <button
                  type="submit"
                  className="button-ink px-6 text-sm font-semibold"
                >
                  {copy.buildDashboard}
                </button>
                <Link href="/newcomer-guide" className="button-secondary px-6 text-sm font-semibold">
                  {isSpanish ? "Ver la guia de recien llegados" : "View the newcomer guide"}
                </Link>
              </div>
            </form>
          </div>

          <aside className="sf-rail lg:sticky lg:top-28 lg:self-start">
            <section className="sf-side-panel">
              <p className="eyebrow">{copy.preview}</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">
                {copy.previewTitle}
              </h2>
              <div className="sf-side-list mt-4 text-sm text-[var(--color-muted)]">
                <div>{copy.visaTrack}: {profile.visaStatus}</div>
                <div>{copy.ssnStatus}: {profile.hasSsn ? copy.hasSsn : copy.noSsn}</div>
                <div>{copy.locationPreview}: {locationPreview.city}, {locationPreview.state} {profile.zip}</div>
                <div>{copy.monthlyIncome}: ${profile.monthlyIncome || 0}</div>
              </div>
            </section>

            <section className="panel-card">
              <p className="eyebrow">{copy.unlocks}</p>
              <div className="mt-4 grid gap-3 text-sm text-[var(--color-muted)]">
                <div className="sf-stat-card">
                  {copy.simulator}: {profile.drives || profile.rents ? copy.simulatorReady : copy.simulatorFallback}
                </div>
                <div className="sf-stat-card">
                  {copy.coverageFinder}: {profile.rents ? copy.coverageReady : copy.coverageRules}
                </div>
                <div className="sf-stat-card">
                  {copy.visaGuide}: {copy.visaGuideReady}
                </div>
              </div>
            </section>
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
