"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeAlert, CheckCircle2, Shield, Sparkles, Upload } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { ReadAloud } from "@/components/ReadAloud";

export default function Home() {
  const locale = useLocale();
  const t = useTranslations();
  const isSpanish = locale === "es";
  const features = [
    t("homeFeatureSsn"),
    t("homeFeatureDecode"),
    t("homeFeatureClaim"),
  ];
  const cards = [
    {
      href: "/simulate",
      title: t("homeShockTitle"),
      copy: t("homeShockCopy"),
      icon: Sparkles,
    },
    {
      href: "/coverage",
      title: t("homeCoverageTitle"),
      copy: t("homeCoverageCopy"),
      icon: Shield,
    },
    {
      href: "/claim",
      title: t("homeClaimTitle"),
      copy: t("homeClaimCopy"),
      icon: Upload,
    },
  ];

  return (
    <div className="website-page">
      <section className="sf-main-grid xl:grid-cols-[minmax(0,1.12fr)_minmax(340px,0.88fr)]">
        <section className="page-hero p-6 sm:p-8 lg:p-10">
          <div>
            <p className="eyebrow">{t("homeEyebrow")}</p>
            <h1 className="sf-hero-title mt-4 max-w-[10ch]">
              {isSpanish
                ? "Ayuda clara para tus primeras decisiones de seguro en Estados Unidos."
                : "Clear help for your first insurance decisions in the United States."}
            </h1>
            <p className="sf-body-copy mt-5 max-w-[39rem]">
              {t("homeHeroCopy")}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/intake" className="button-ink px-5 text-sm font-semibold">
              {t("getStarted")}
              <ArrowRight className="size-4" />
            </Link>
            <ReadAloud
              text={`FirstCover. ${t("homeHeroCopy")}`}
              className="!border-[var(--color-accent)] !text-[var(--color-accent)]"
            />
          </div>

          <div className="mt-6 sf-chip-row">
            {features.map((item) => (
              <div key={item} className="sf-chip inline-flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[var(--color-accent)]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="sf-band grid gap-6 p-6 sm:p-8">
          <div className="sf-visual-wrap min-h-[22rem]">
            <div className="sf-visual-oval" />
            <div className="sf-visual-mascot">
              <Image
                src="/mascot/calm.png"
                alt={isSpanish ? "Mascota de FirstCover" : "FirstCover mascot"}
                width={380}
                height={380}
                className="h-auto max-h-[20rem] w-auto object-contain"
                priority
              />
            </div>
          </div>

          <div className="sf-quote-box">
            <p className="eyebrow">{t("homeWhyNow")}</p>
            <h2 className="mt-2 text-3xl font-semibold text-[var(--color-ink)]">
              {t("homeWhyNowTitle")}
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--color-muted)]">
              {t("homeWhyNowCopy")}
            </p>
          </div>
        </section>
      </section>

      <section className="mt-6 sf-main-grid xl:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)]">
        <section className="sf-band p-6 sm:p-8">
          <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div>
              <p className="eyebrow">{t("homeToolkit")}</p>
              <h2 className="sf-section-title mt-2">
                {isSpanish
                  ? "Explora la misma experiencia como un sitio de servicio."
                  : "Explore the same experience as a service-first website."}
              </h2>
            </div>
            <p className="sf-body-copy">
              {t("homePitchCopy")}
            </p>
          </div>

          <div className="sf-product-grid mt-6 md:grid-cols-3">
            {cards.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.href} href={feature.href} className="sf-product-tile">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-ink)]">{feature.title}</p>
                      <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{feature.copy}</p>
                    </div>
                    <Icon className="mt-1 size-5 text-[var(--color-accent)]" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <aside className="sf-rail xl:sticky xl:top-28">
          <section className="sf-side-panel">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">{t("homePitch")}</p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">
                  {t("homePitchTitle")}
                </h2>
              </div>
              <BadgeAlert className="mt-1 size-5 text-[var(--color-accent)]" />
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
              {isSpanish
                ? "Empieza con cuatro preguntas, guarda tu perfil y cambia entre cobertura, reclamos y decodificacion sin perder contexto."
                : "Start with four questions, save your profile, and move between coverage, claims, and decoding without losing context."}
            </p>
          </section>

          <section className="panel-card">
            <p className="eyebrow">{isSpanish ? "Siguientes pasos" : "Next steps"}</p>
            <div className="sf-side-list mt-4 text-sm text-[var(--color-muted)]">
              <Link href="/intake" className="sf-text-link">
                {isSpanish ? "Completa tu ingreso guiado" : "Complete your guided intake"}
              </Link>
              <Link href="/decode" className="sf-text-link">
                {isSpanish ? "Sube una poliza para decodificarla" : "Upload a policy to decode it"}
              </Link>
              <Link href="/claim" className="sf-text-link">
                {isSpanish ? "Practica un reclamo antes de llamar" : "Practice a claim before you call"}
              </Link>
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
