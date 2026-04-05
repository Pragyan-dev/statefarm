"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Shield, Sparkles, Volume2 } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { WebsiteActionLink, WebsiteRailCard, WebsiteSectionHeader, WebsiteSectionPanel } from "@/components/website/WebsitePrimitives";
import { useAccessibility } from "@/hooks/useAccessibility";

type ProductOption = "auto" | "renters" | "auto-renters";

export default function Home() {
  const router = useRouter();
  const t = useTranslations();
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";
  const [product, setProduct] = useState<ProductOption>("auto-renters");
  const [zip, setZip] = useState("85281");

  const features = [
    t("homeFeatureSsn"),
    t("homeFeatureDecode"),
    t("homeFeatureClaim"),
  ];
  const toolkitCards = [
    {
      title: t("homeShockTitle"),
      copy: t("homeShockCopy"),
      icon: Sparkles,
      href: "/intake?product=auto",
    },
    {
      title: t("homeCoverageTitle"),
      copy: t("homeCoverageCopy"),
      icon: Shield,
      href: "/intake?product=renters",
    },
    {
      title: t("homeClaimTitle"),
      copy: t("homeClaimCopy"),
      icon: ArrowRight,
      href: "/intake?product=auto-renters",
    },
  ];
  const journeySteps = [
    isSpanish
      ? "Completa cuatro preguntas sobre visa, SSN, manejo, alquiler y ZIP."
      : "Answer four questions about visa, SSN, driving, renting, and ZIP code.",
    isSpanish
      ? "Desbloquea un panel con las rutas de cobertura, simulador y decodificador."
      : "Unlock a dashboard with coverage routes, the simulator, and the decoder.",
    isSpanish
      ? "Usa la herramienta para revisar escenarios, comparar documentos y prepararte para reclamos."
      : "Use the toolkit to review scenarios, compare documents, and prep for claims.",
  ];

  function handleQuickStart(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();
    params.set("product", product);
    const cleanZip = zip.replace(/\D/g, "").slice(0, 5);
    if (cleanZip) {
      params.set("zip", cleanZip);
    }

    router.push(`/intake?${params.toString()}`);
  }

  return (
    <div className="py-2 lg:py-4">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_23rem]">
        <div className="grid gap-6">
          <WebsiteSectionHeader
            eyebrow={t("homeEyebrow")}
            title={
              isSpanish
                ? "Proteccion clara para tus primeros meses en Estados Unidos."
                : "Plain-language protection for your first months in the U.S."
            }
            description={t("homeWhyNowCopy")}
            actions={
              <>
                <Link href="/intake" className="web-primary-button">
                  {t("getStarted")}
                  <ArrowRight className="size-4" />
                </Link>
                <div className="web-secondary-button">
                  <Volume2 className="size-4" />
                  <span>{t("homeVoiceGuidance")}</span>
                </div>
              </>
            }
          />

          <section className="web-showcase">
            <div>
              <p className="web-kicker">{t("homeWhyNow")}</p>
              <h2 className="mt-2 font-display text-4xl leading-tight text-[var(--color-ink)]">
                {t("homeWhyNowTitle")}
              </h2>
              <p className="mt-4 max-w-[58ch] text-base leading-7 text-[var(--color-muted)]">
                {t("homeHeroCopy")}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {features.map((item) => (
                  <span key={item} className="web-feature-chip">
                    <CheckCircle2 className="mr-2 size-4 text-[var(--color-accent)]" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="web-illustration flex items-end p-6">
              <div className="rounded-[1.35rem] bg-white/92 p-4 shadow-[0_18px_40px_rgba(59,58,57,0.12)]">
                <p className="web-kicker">{t("homePitch")}</p>
                <p className="mt-2 max-w-[18ch] font-display text-2xl leading-tight text-[var(--color-ink)]">
                  {isSpanish ? "Comienza con la mayor brecha de riesgo." : "Start with the highest-risk gap first."}
                </p>
              </div>
            </div>
          </section>

          <WebsiteSectionPanel
            eyebrow={t("homeToolkit")}
            title={isSpanish ? "Tres herramientas, una sola ruta de accion." : "Three tools, one action-ready flow."}
            description={t("homePitchCopy")}
          >
            <div className="grid gap-4 lg:grid-cols-3">
              {toolkitCards.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Link key={feature.title} href={feature.href} className="web-grid-card block">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-semibold text-[var(--color-ink)]">{feature.title}</h3>
                        <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{feature.copy}</p>
                      </div>
                      <Icon className="mt-1 size-5 shrink-0 text-[var(--color-accent)]" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </WebsiteSectionPanel>

          <WebsiteSectionPanel
            eyebrow={isSpanish ? "Como funciona" : "How it works"}
            title={isSpanish ? "Pasa del riesgo invisible a un plan utilizable." : "Move from invisible risk to a usable plan."}
          >
            <div className="grid gap-4 lg:grid-cols-3">
              {journeySteps.map((item, index) => (
                <div key={item} className="web-grid-card">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                    0{index + 1}
                  </p>
                  <p className="mt-3 text-base leading-7 text-[var(--color-ink)]">{item}</p>
                </div>
              ))}
            </div>
          </WebsiteSectionPanel>
        </div>

        <aside className="grid gap-4 xl:sticky xl:top-32 xl:self-start">
          <WebsiteRailCard
            eyebrow={isSpanish ? "Inicio rapido" : "Quick start"}
            title={isSpanish ? "Inicia tu plan personalizado." : "Start your personalized plan."}
            description={
              isSpanish
                ? "Elige tu enfoque de cobertura y tu ZIP para entrar a la herramienta con la configuracion correcta."
                : "Choose your coverage focus and ZIP code to enter the toolkit with the right starting setup."
            }
          >
            <form className="grid gap-4" onSubmit={handleQuickStart}>
              <label>
                <span className="web-field-label">
                  {isSpanish ? "Producto de seguro" : "Insurance product"}
                </span>
                <select
                  value={product}
                  onChange={(event) => setProduct(event.target.value as ProductOption)}
                  className="web-select"
                >
                  <option value="auto">{isSpanish ? "Auto" : "Auto"}</option>
                  <option value="renters">{isSpanish ? "Inquilino" : "Renters"}</option>
                  <option value="auto-renters">{isSpanish ? "Auto + inquilino" : "Auto + renters"}</option>
                </select>
              </label>

              <label>
                <span className="web-field-label">{isSpanish ? "Codigo ZIP" : "ZIP code"}</span>
                <input
                  value={zip}
                  onChange={(event) => setZip(event.target.value.slice(0, 5))}
                  className="web-input"
                  inputMode="numeric"
                  placeholder="85281"
                />
              </label>

              <button type="submit" className="web-primary-button w-full">
                {isSpanish ? "Inicia tu plan" : "Start your plan"}
              </button>
            </form>
          </WebsiteRailCard>

          <div className="grid gap-3">
            <Link href="/intake?product=auto" className="web-outline-button">
              {isSpanish ? "Plan para auto" : "Auto coverage plan"}
            </Link>
            <Link href="/intake?product=renters" className="web-outline-button">
              {isSpanish ? "Plan para inquilino" : "Renters plan"}
            </Link>
          </div>

          <WebsiteRailCard
            eyebrow={t("websiteOverview")}
            title={isSpanish ? "Lo que desbloqueas" : "What unlocks next"}
            description={
              isSpanish
                ? "Cuando completes el ingreso, podras navegar el panel, comparar escenarios y preparar documentos."
                : "Once intake is complete, you can navigate the dashboard, compare scenarios, and prepare documents."
            }
          >
            <div className="grid gap-3">
              <WebsiteActionLink
                href="/intake?product=auto-renters"
                title={t("homeShockTitle")}
                description={t("homeShockCopy")}
              />
              <WebsiteActionLink
                href="/intake?product=renters"
                title={t("homeCoverageTitle")}
                description={t("homeCoverageCopy")}
              />
              <WebsiteActionLink
                href="/intake?product=auto-renters"
                title={t("homeClaimTitle")}
                description={t("homeClaimCopy")}
              />
            </div>
          </WebsiteRailCard>
        </aside>
      </section>
    </div>
  );
}
