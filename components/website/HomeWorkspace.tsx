"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { SafiCharacter } from "@/components/simulator/SafiCharacter";
import {
  WebsiteDashboardBuilder,
  type DashboardBuilderBuildState,
  type DashboardBuilderSeed,
} from "@/components/website/WebsiteDashboardBuilder";
import { useAccessibility } from "@/hooks/useAccessibility";
import type { Emotion } from "@/types/simulator";

function getSeedFromSearchParams(searchParams: { [key: string]: string | string[] | undefined }): DashboardBuilderSeed {
  const requestedProduct = Array.isArray(searchParams.product)
    ? searchParams.product[0]
    : searchParams.product;
  const requestedZip = Array.isArray(searchParams.zip) ? searchParams.zip[0] : searchParams.zip;

  return {
    product:
      requestedProduct === "auto" || requestedProduct === "renters" || requestedProduct === "auto-renters"
        ? requestedProduct
        : "auto-renters",
    zip: requestedZip?.replace(/\D/g, "").slice(0, 5) || "85281",
  };
}

export function HomeWorkspace({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const initialSeed = getSeedFromSearchParams(searchParams);
  const t = useTranslations();
  useAccessibility();
  const [buildState, setBuildState] = useState<DashboardBuilderBuildState>("idle");

  const mascotEmotion: Emotion = buildState === "ready" ? "celebrating" : "happy";

  return (
    <div className="home-workspace-shell">
      <section className="home-workspace-main">
        <section className="home-overview-panel">
          <div className="home-overview-layout">
            <div className="home-overview-copy">
              <h1 className="max-w-[11ch] font-display text-[2rem] leading-[0.98] text-[var(--color-ink)] sm:text-[2.3rem] xl:text-[2.95rem]">
                {t("homeWorkspaceHeadline")}
              </h1>
              <p className="mt-4 max-w-[28ch] text-[0.97rem] leading-6 text-[var(--color-muted)] xl:text-base">
                {t("homeWorkspaceIntro")}
              </p>
            </div>

            <div className="home-safi-figure">
              <SafiCharacter emotion={mascotEmotion} className="home-safi-character" />
            </div>
          </div>
        </section>

        <WebsiteDashboardBuilder
          initialSeed={initialSeed}
          mode="workspace"
          onBuildStateChange={setBuildState}
        />
      </section>
    </div>
  );
}
