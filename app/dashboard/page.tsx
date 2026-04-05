"use client";

import Link from "next/link";
import { ArrowRight, BadgeAlert, ShieldCheck, Sparkles, Upload, WalletCards } from "lucide-react";
import { useTranslations } from "next-intl";

import { ProgressChecklist, type ChecklistItem } from "@/components/ProgressChecklist";
import { ReadAloud } from "@/components/ReadAloud";
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
      href: "/afford",
      title: t("dashboardBudgetTitle"),
      description: t("dashboardBudgetCopy"),
      icon: WalletCards,
    },
    {
      href: "/guide",
      title: t("dashboardGuideTitle"),
      description: t("dashboardGuideCopy"),
      icon: ArrowRight,
    },
    {
      href: "/scam",
      title: t("dashboardScamTitle"),
      description: t("dashboardScamCopy"),
      icon: BadgeAlert,
    },
  ];

  return (
    <div className="py-6 lg:py-10">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="panel-card hero-ambient overflow-hidden">
          <p className="eyebrow">{t("dashboardEyebrow")}</p>
          <h1 className="font-display text-4xl text-[var(--color-ink)] lg:max-w-[11ch] lg:text-5xl">
            {headline}
          </h1>
          <p className="mt-4 max-w-[38ch] text-base text-[var(--color-muted)]">
            {t("dashboardHeroCopy")}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/simulate"
              className="button-ink px-5 py-3 text-sm font-semibold"
            >
              {t("dashboardRunSimulator")}
            </Link>
            <ReadAloud text={`${headline} ${ssnMessage}`} />
          </div>
        </section>

        <section className="panel-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">{t("dashboardFastFact")}</p>
              <h2 className="font-display text-2xl text-[var(--color-ink)]">
                {t("dashboardFastFactTitle")}
              </h2>
            </div>
            <BadgeAlert className="mt-1 size-6 text-[var(--color-accent)]" />
          </div>
          <p className="mt-4 text-base text-[var(--color-muted)]">{ssnMessage}</p>
        </section>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr] xl:grid-cols-[1.05fr_0.95fr]">
        <ProgressChecklist items={checklistItems} profile={profile} onProfileChange={setProfile} />

        <section className="panel-card">
          <p className="eyebrow">{t("dashboardToolkit")}</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-2">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className="rounded-[1.5rem] border border-[var(--color-border)] px-4 py-4 transition hover:border-[var(--color-accent)] hover:bg-[var(--color-paper)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-[var(--color-ink)]">{card.title}</h3>
                      <p className="mt-2 text-sm text-[var(--color-muted)]">{card.description}</p>
                    </div>
                    <Icon className="size-5 text-[var(--color-accent)]" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </section>
    </div>
  );
}
