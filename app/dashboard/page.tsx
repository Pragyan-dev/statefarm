"use client";

import Link from "next/link";
import { ArrowRight, BadgeAlert, ShieldCheck, Sparkles, Upload } from "lucide-react";
import { useTranslations } from "next-intl";

import { ProgressChecklist, type ChecklistItem } from "@/components/ProgressChecklist";
import { ReadAloud } from "@/components/ReadAloud";
import { ClearDataButton } from "@/components/ClearDataButton";
import { useAutoRead } from "@/hooks/useAutoRead";
import { useAccessibility } from "@/hooks/useAccessibility";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getProfileHeadline } from "@/lib/content";

function getChecklistItems(profile: {
  visaStatus: string;
  drives: boolean;
  rents: boolean;
}, isSpanish: boolean): ChecklistItem[] {
  const items: ChecklistItem[] = [
    {
      id: "bank-account",
      label: isSpanish ? "Abre una cuenta bancaria" : "Open a bank account",
      detail: isSpanish
        ? "Usa pasaporte y documentos de visa aunque todavia no tengas SSN."
        : "Use passport + visa paperwork even if you do not have an SSN yet.",
    },
    {
      id: "state-id",
      label: isSpanish ? "Empieza tu identificacion estatal" : "Start your state ID process",
      detail: isSpanish
        ? "Haz coincidir tus comprobantes de domicilio con tu primer contrato o carta escolar."
        : "Match your address documents with your first lease or school letter.",
    },
  ];

  if (profile.drives) {
    items.push({
      id: "auto-insurance",
      label: isSpanish ? "Consigue seguro de auto" : "Get auto insurance",
      detail: isSpanish
        ? "En la mayoria de los estados no necesitas SSN para comprar una poliza."
        : "Most states do not require an SSN to buy a policy.",
    });
  }

  if (profile.rents) {
    items.push({
      id: "renters-insurance",
      label: isSpanish ? "Consigue seguro de inquilino" : "Get renter's insurance",
      detail: isSpanish
        ? "Protege tu laptop, documentos y lo esencial de tu primer apartamento."
        : "Protect your laptop, documents, and first apartment essentials.",
    });
  }

  items.push({
    id: "visa-checklist",
    label: isSpanish
      ? `Sigue tu lista de visa ${profile.visaStatus}`
      : `Follow your ${profile.visaStatus} visa checklist`,
    detail: isSpanish
      ? "Mantiene organizados tus primeros 30 dias para que el papeleo no se acumule."
      : "Keep your first 30 days structured so paperwork does not pile up.",
  });

  return items;
}

export default function DashboardPage() {
  const t = useTranslations();
  const { settings } = useAccessibility();
  const [profile, setProfile, isReady] = useUserProfile();
  const isSpanish = settings.language === "es";
  const headline = getProfileHeadline(profile, settings.language);
  useAutoRead(headline);

  if (!isReady) {
    return (
      <div className="py-10 text-sm text-[var(--color-muted)]">
        {isSpanish ? "Cargando panel..." : "Loading dashboard..."}
      </div>
    );
  }

  const checklistItems = getChecklistItems(profile, isSpanish);
  const ssnMessage = isSpanish
    ? `En ${profile.state}, normalmente puedes comprar seguro de auto sin SSN.`
    : `In ${profile.state}, you can usually buy auto insurance without an SSN.`;
  const cards = [
    {
      href: "/simulate",
      title: t("dashboardShockTitle"),
      description: t("dashboardShockCopy"),
      icon: Sparkles,
    },
    {
      href: "/coverage",
      title: t("dashboardCoverageTitle"),
      description: t("dashboardCoverageCopy"),
      icon: ShieldCheck,
    },
    {
      href: "/decode",
      title: t("dashboardDecodeTitle"),
      description: t("dashboardDecodeCopy"),
      icon: Upload,
    },
    {
      href: "/newcomer-guide",
      title: t("dashboardGuideTitle"),
      description: t("dashboardGuideCopy"),
      icon: ArrowRight,
    },
  ];

  return (
    <div className="website-page">
      <section className="sf-main-grid xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div className="grid gap-6">
          <section className="page-hero p-6 sm:p-8 lg:p-10">
            <p className="eyebrow">{t("dashboardEyebrow")}</p>
            <h1 className="sf-section-title mt-3 max-w-[11ch]">{headline}</h1>
            <p className="sf-body-copy mt-4 max-w-[42rem]">
              {t("dashboardHeroCopy")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/simulate" className="button-ink px-5 py-3 text-sm font-semibold">
                {t("dashboardRunSimulator")}
              </Link>
              <ReadAloud text={`${headline} ${ssnMessage}`} />
            </div>
          </section>

          <section className="sf-band p-6 sm:p-8">
            <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
              <div>
                <p className="eyebrow">{t("dashboardToolkit")}</p>
                <h2 className="mt-2 text-3xl font-semibold text-[var(--color-ink)]">
                  {isSpanish ? "Tus siguientes tareas" : "Your next tasks"}
                </h2>
              </div>
              <p className="text-sm leading-7 text-[var(--color-muted)]">
                {isSpanish
                  ? "Este panel mantiene el simulador, la cobertura y las tareas de visa conectadas al mismo perfil."
                  : "This hub keeps your simulator, coverage, and visa tasks connected to the same profile."}
              </p>
            </div>
            <div className="sf-product-grid mt-6 md:grid-cols-2">
              {cards.map((card) => {
                const Icon = card.icon;
                return (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="sf-product-tile transition hover:border-[var(--color-accent)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-[var(--color-ink)]">{card.title}</h3>
                        <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{card.description}</p>
                      </div>
                      <Icon className="mt-1 size-5 text-[var(--color-accent)]" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <ProgressChecklist items={checklistItems} profile={profile} onProfileChange={setProfile} />
        </div>

        <aside className="sf-rail xl:sticky xl:top-28">
          <section className="sf-side-panel">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">{t("dashboardFastFact")}</p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">
                  {t("dashboardFastFactTitle")}
                </h2>
              </div>
              <BadgeAlert className="mt-1 size-6 text-[var(--color-accent)]" />
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">{ssnMessage}</p>
          </section>

          <section className="panel-card">
            <p className="eyebrow">{isSpanish ? "Tu perfil" : "Your profile"}</p>
            <div className="sf-side-list mt-4 text-sm text-[var(--color-muted)]">
              <div>
                <p className="font-semibold text-[var(--color-ink)]">{isSpanish ? "Visa" : "Visa"}</p>
                <p>{profile.visaStatus}</p>
              </div>
              <div>
                <p className="font-semibold text-[var(--color-ink)]">{isSpanish ? "Estado" : "State"}</p>
                <p>{profile.state}</p>
              </div>
              <div>
                <p className="font-semibold text-[var(--color-ink)]">{isSpanish ? "Ingreso mensual" : "Monthly income"}</p>
                <p>${profile.monthlyIncome}</p>
              </div>
            </div>
          </section>

          <section className="panel-card">
            <p className="eyebrow">{isSpanish ? "Administrar" : "Manage"}</p>
            <div className="mt-4 grid gap-3">
              <Link href="/claim" className="sf-text-link">
                {isSpanish ? "Abrir ayuda de reclamos" : "Open claim help"}
              </Link>
              <Link href="/coverage" className="sf-text-link">
                {isSpanish ? "Revisar cobertura estimada" : "Review estimated coverage"}
              </Link>
              <div className="pt-2">
                <ClearDataButton />
              </div>
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
