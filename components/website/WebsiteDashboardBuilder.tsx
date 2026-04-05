"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

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

export type DashboardBuilderBuildState = "idle" | "building" | "ready";

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
  mode = "standard",
  onBuildStateChange,
}: {
  initialSeed: DashboardBuilderSeed;
  mode?: "standard" | "workspace";
  onBuildStateChange?: (state: DashboardBuilderBuildState) => void;
}) {
  const router = useRouter();
  const t = useTranslations();
  const [, setIsDashboardBuilt] = useDashboardAccess();
  const { settings } = useAccessibility();
  const [profile, setProfile] = useState<UserProfile>(() => profileFromSeed(initialSeed));
  const [buildState, setBuildState] = useState<DashboardBuilderBuildState>("idle");
  const readyTimerRef = useRef<number | null>(null);
  const redirectTimerRef = useRef<number | null>(null);
  const locationPreview = deriveProfileLocation(profile.zip);
  const isWorkspace = mode === "workspace";

  useEffect(() => {
    onBuildStateChange?.(buildState);
  }, [buildState, onBuildStateChange]);

  useEffect(() => {
    return () => {
      if (readyTimerRef.current) {
        window.clearTimeout(readyTimerRef.current);
      }

      if (redirectTimerRef.current) {
        window.clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  function completeIntake() {
    const nextProfile = {
      ...profile,
      ...locationPreview,
    };

    saveStoredProfile(nextProfile);
    saveStoredDashboardAccess(true);
    setIsDashboardBuilt(true);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (buildState !== "idle") {
      return;
    }

    setBuildState("building");

    readyTimerRef.current = window.setTimeout(() => {
      completeIntake();
      setBuildState("ready");

      redirectTimerRef.current = window.setTimeout(() => {
        startTransition(() => {
          router.push("/dashboard");
        });
      }, settings.reducedMotion ? 80 : 420);
    }, settings.reducedMotion ? 80 : 900);
  }

  if (!isWorkspace) {
    return null;
  }

  return (
    <section className="home-builder-card">
      <div>
        <div>
          <p className="web-kicker">{t("homeBuilderEyebrow")}</p>
          <h2 className="mt-2 font-display text-3xl leading-tight text-[var(--color-ink)]">
            {t("homeBuilderTitle")}
          </h2>
          <p className="mt-3 max-w-[34ch] text-sm leading-6 text-[var(--color-muted)]">
            {t("homeBuilderDescription")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
        <section>
          <span className="web-field-label">{t("homeBuilderVisaQuestion")}</span>
          <div role="radiogroup" aria-required="true" className="grid grid-cols-2 gap-2">
            {visaOptions.map((visa) => (
              <label
                key={visa}
                className={`home-builder-choice ${profile.visaStatus === visa ? "home-builder-choice-active" : ""}`}
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
                  className="sr-only"
                  disabled={buildState !== "idle"}
                />
                <span>{visa}</span>
              </label>
            ))}
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <section>
            <span className="web-field-label">{t("homeBuilderSsnQuestion")}</span>
            <div role="radiogroup" aria-required="true" className="grid grid-cols-2 gap-2">
              {[true, false].map((value) => (
                <label
                  key={String(value)}
                  className={`home-builder-choice ${profile.hasSsn === value ? "home-builder-choice-active" : ""}`}
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
                    className="sr-only"
                    disabled={buildState !== "idle"}
                  />
                  <span>{value ? t("homeBuilderYes") : t("homeBuilderNo")}</span>
                </label>
              ))}
            </div>
          </section>

          <section>
            <span className="web-field-label">{t("homeBuilderCoverageQuestion")}</span>
            <div className="grid gap-2">
              <label
                className={`home-builder-toggle ${profile.drives ? "home-builder-choice-active" : ""}`}
              >
                <div>
                  <p className="font-semibold text-[var(--color-ink)]">{t("homeBuilderDriveLabel")}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
                    {t("homeBuilderDriveDetail")}
                  </p>
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
                  className="h-4 w-4 accent-[var(--color-accent)]"
                  disabled={buildState !== "idle"}
                />
              </label>

              <label
                className={`home-builder-toggle ${profile.rents ? "home-builder-choice-active" : ""}`}
              >
                <div>
                  <p className="font-semibold text-[var(--color-ink)]">{t("homeBuilderRentLabel")}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
                    {t("homeBuilderRentDetail")}
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
                  className="h-4 w-4 accent-[var(--color-accent)]"
                  disabled={buildState !== "idle"}
                />
              </label>
            </div>
          </section>
        </div>

        <section className="grid gap-3 md:grid-cols-2">
          <label>
            <span className="web-field-label">{t("homeBuilderZipCode")}</span>
            <input
              value={profile.zip}
              onChange={(event) =>
                setProfile((current) => ({
                  ...current,
                  zip: event.target.value.replace(/\D/g, "").slice(0, 5),
                }))
              }
              className="web-input"
              inputMode="numeric"
              placeholder="85281"
              disabled={buildState !== "idle"}
            />
          </label>

          <label>
            <span className="web-field-label">{t("homeBuilderIncome")}</span>
            <input
              type="number"
              min="0"
              value={profile.monthlyIncome}
              onChange={(event) =>
                setProfile((current) => ({
                  ...current,
                  monthlyIncome: Number(event.target.value) || 0,
                }))
              }
              className="web-input"
              disabled={buildState !== "idle"}
            />
          </label>
        </section>

        <button type="submit" className="web-primary-button w-full" disabled={buildState !== "idle"}>
          {buildState === "building"
            ? t("homeBuilderBuildingCta")
            : buildState === "ready"
              ? t("homeBuilderReadyCta")
              : t("homeBuilderBuild")}
        </button>
      </form>
    </section>
  );
}
