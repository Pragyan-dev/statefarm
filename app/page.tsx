"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, Sparkles, Volume2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { LanguageToggle } from "@/components/LanguageToggle";

export default function Home() {
  const t = useTranslations();
  const features = [
    t("homeFeatureSsn"),
    t("homeFeatureDecode"),
    t("homeFeatureClaim"),
  ];
  const cards = [
    {
      title: t("homeShockTitle"),
      copy: t("homeShockCopy"),
      icon: Sparkles,
    },
    {
      title: t("homeCoverageTitle"),
      copy: t("homeCoverageCopy"),
      icon: Shield,
    },
    {
      title: t("homeClaimTitle"),
      copy: t("homeClaimCopy"),
      icon: ArrowRight,
    },
  ];

  return (
    <div className="py-6 lg:py-10">
      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="hero-grid hero-surface-dark panel-card hero-ambient overflow-hidden text-white">
          <div className="relative z-10">
            <div className="flex items-start justify-between gap-3">
              <p className="eyebrow text-white/65">{t("homeEyebrow")}</p>
              <div className="lg:hidden">
                <LanguageToggle />
              </div>
            </div>
            <h1 className="mt-3 font-display text-5xl leading-[0.95] sm:text-6xl lg:max-w-[8ch] lg:text-7xl">
              ArriveSafe
            </h1>
            <p className="mt-4 max-w-[34ch] text-base text-white/76 lg:text-lg">
              {t("homeHeroCopy")}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/intake"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--color-accent)] px-5 text-sm font-semibold text-white"
              >
                {t("getStarted")}
                <ArrowRight className="size-4" />
              </Link>
              <div className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 bg-white/6 px-4 text-sm font-semibold text-white/80">
                <Volume2 className="size-4" />
                {t("homeVoiceGuidance")}
              </div>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3 lg:grid-cols-1">
              {features.map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-white/76">
                  <CheckCircle2 className="size-4 text-[var(--color-highlight)]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <section className="panel-card bg-[linear-gradient(180deg,rgba(212,96,58,0.1),rgba(255,255,255,0.8))]">
            <p className="eyebrow">{t("homeWhyNow")}</p>
            <h2 className="font-display text-3xl text-[var(--color-ink)]">
              {t("homeWhyNowTitle")}
            </h2>
            <p className="mt-4 text-base text-[var(--color-muted)]">
              {t("homeWhyNowCopy")}
            </p>
          </section>

          <section className="panel-card">
            <p className="eyebrow">{t("homeToolkit")}</p>
            <div className="mt-5 grid gap-3">
              {cards.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="rounded-[1.75rem] border border-[var(--color-border)] px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-[var(--color-ink)]">{feature.title}</h3>
                        <p className="mt-2 text-sm text-[var(--color-muted)]">{feature.copy}</p>
                      </div>
                      <Icon className="size-5 text-[var(--color-accent)]" />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </section>

      <section className="panel-card mt-6">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="eyebrow">{t("homePitch")}</p>
            <h2 className="font-display text-3xl text-[var(--color-ink)]">
              {t("homePitchTitle")}
            </h2>
          </div>
          <p className="text-base text-[var(--color-muted)]">
            {t("homePitchCopy")}
          </p>
        </div>
      </section>
    </div>
  );
}
