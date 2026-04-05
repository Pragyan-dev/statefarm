"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useViewMode } from "@/hooks/useViewMode";
import { deriveProfileLocation } from "@/lib/content";
import { defaultUserProfile, saveStoredProfile } from "@/lib/userProfile";
import type { UserProfile, VisaType } from "@/lib/types";

const visaOptions: VisaType[] = ["F1", "H1B", "J1", "O1"];

export default function IntakePage() {
  const router = useRouter();
  const { resolvedMode } = useViewMode();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>(defaultUserProfile);
  const locationPreview = deriveProfileLocation(profile.zip);

  function completeIntake() {
    const nextProfile = {
      ...profile,
      ...locationPreview,
    };
    saveStoredProfile(nextProfile);
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
      <div className="py-6 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="grid gap-6">
            <Link href="/" className="text-sm font-semibold text-[var(--color-muted)]">
              ← Back home
            </Link>

            <section className="panel-card hero-ambient overflow-hidden">
              <p className="eyebrow">Intake</p>
              <h1 className="font-display text-4xl text-[var(--color-ink)] lg:max-w-[12ch]">
                Build your first 30-day protection plan in one pass.
              </h1>
              <p className="mt-4 max-w-[42ch] text-base text-[var(--color-muted)]">
                We will tailor the simulator, coverage guide, visa checklist, and claim help to
                your first months in the US.
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
                <legend className="font-display text-2xl text-[var(--color-ink)]">
                  What is your visa status?
                </legend>
                <div role="radiogroup" aria-required="true" className="mt-5 grid gap-3 md:grid-cols-2">
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

              <fieldset className="panel-card">
                <legend className="font-display text-2xl text-[var(--color-ink)]">
                  Do you already have an SSN?
                </legend>
                <div role="radiogroup" aria-required="true" className="mt-5 grid gap-3 md:grid-cols-2">
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
                      <span className="font-semibold text-[var(--color-ink)]">{value ? "Yes" : "No"}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="panel-card">
                <legend className="font-display text-2xl text-[var(--color-ink)]">
                  What do you need covered?
                </legend>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <label className="flex cursor-pointer items-center justify-between rounded-[1.5rem] border border-[var(--color-border)] px-4 py-4">
                    <div>
                      <p className="font-semibold text-[var(--color-ink)]">I drive</p>
                      <p className="text-sm text-[var(--color-muted)]">Show auto insurance scenarios</p>
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
                      <p className="font-semibold text-[var(--color-ink)]">I rent</p>
                      <p className="text-sm text-[var(--color-muted)]">
                        Show renter&apos;s insurance and apartment risk
                      </p>
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
                <h2 className="font-display text-2xl text-[var(--color-ink)]">Where are you starting?</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">ZIP code</span>
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
                </div>
              </section>

              <div className="flex flex-wrap gap-3 pb-6">
                <button
                  type="submit"
                  className="min-h-12 rounded-full bg-[var(--color-ink)] px-6 text-sm font-semibold text-[var(--color-paper)]"
                >
                  Build my dashboard
                </button>
                <Link
                  href="/dashboard"
                  className="inline-flex min-h-12 items-center rounded-full border border-[var(--color-border)] px-6 text-sm font-semibold text-[var(--color-ink)]"
                >
                  Skip to demo dashboard
                </Link>
              </div>
            </form>
          </div>

          <aside className="grid gap-6 lg:sticky lg:top-28 lg:self-start">
            <section className="panel-card">
              <p className="eyebrow">Preview</p>
              <h2 className="font-display text-2xl text-[var(--color-ink)]">
                Your profile is shaping the toolkit already.
              </h2>
              <ul className="mt-4 grid gap-3 text-sm text-[var(--color-muted)]">
                <li>Visa track: {profile.visaStatus}</li>
                <li>SSN status: {profile.hasSsn ? "Already have one" : "No SSN yet"}</li>
                <li>Location preview: {locationPreview.city}, {locationPreview.state} {profile.zip}</li>
                <li>Monthly income: ${profile.monthlyIncome || 0}</li>
              </ul>
            </section>

            <section className="panel-card">
              <p className="eyebrow">What unlocks next</p>
              <div className="mt-4 grid gap-3 text-sm text-[var(--color-muted)]">
                <div className="rounded-[1.25rem] border border-[var(--color-border)] px-4 py-4">
                  Simulator: {profile.drives || profile.rents ? "Tailored to your risks" : "Medical-only fallback"}
                </div>
                <div className="rounded-[1.25rem] border border-[var(--color-border)] px-4 py-4">
                  Coverage finder: {profile.rents ? "Apartment + renter's estimate ready" : "State rules only"}
                </div>
                <div className="rounded-[1.25rem] border border-[var(--color-border)] px-4 py-4">
                  Visa guide: {profile.visaStatus} checklist and first-30-day tasks
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
        ← Back home
      </Link>

      <section className="panel-card hero-ambient mt-6 overflow-hidden">
        <p className="eyebrow">Intake</p>
        <h1 className="font-display text-4xl text-[var(--color-ink)]">
          Four fast questions. Then your first 30-day protection plan.
        </h1>
        <p className="mt-4 max-w-[34ch] text-base text-[var(--color-muted)]">
          We will tailor the simulator, coverage guide, visa checklist, and claim help to your
          first months in the US.
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
            What is your visa status?
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
            Do you already have an SSN?
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
                <span className="font-semibold text-[var(--color-ink)]">{value ? "Yes" : "No"}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {step === 2 ? (
        <fieldset className="panel-card">
          <legend className="font-display text-2xl text-[var(--color-ink)]">
            What do you need covered?
          </legend>
          <div className="mt-5 grid gap-3">
            <label className="flex cursor-pointer items-center justify-between rounded-[1.5rem] border border-[var(--color-border)] px-4 py-4">
              <div>
                <p className="font-semibold text-[var(--color-ink)]">I drive</p>
                <p className="text-sm text-[var(--color-muted)]">Show auto insurance scenarios</p>
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
                <p className="font-semibold text-[var(--color-ink)]">I rent</p>
                <p className="text-sm text-[var(--color-muted)]">
                  Show renter&apos;s insurance and apartment risk
                </p>
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
          <h2 className="font-display text-2xl text-[var(--color-ink)]">Where are you starting?</h2>
          <div className="mt-5 grid gap-4">
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">ZIP code</span>
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
          Back
        </button>
        <button
          type="button"
          onClick={nextStep}
          className="min-h-12 flex-1 rounded-full bg-[var(--color-ink)] text-sm font-semibold text-[var(--color-paper)]"
        >
          {step === 3 ? "Build my dashboard" : "Next"}
        </button>
      </div>
    </div>
  );
}
