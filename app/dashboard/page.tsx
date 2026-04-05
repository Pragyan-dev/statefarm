"use client";

import Link from "next/link";
import {
  BadgeAlert,
  BadgeCheck,
  BookOpenCheck,
  Clock3,
  IdCard,
  MapPin,
  ScanSearch,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { type NewcomerGuideData } from "@/components/NewcomerGuide";
import { ReadAloud } from "@/components/ReadAloud";
import { ClearDataButton } from "@/components/ClearDataButton";
import { WebsiteActionLink, WebsiteRailCard, WebsiteSectionHeader, WebsiteSectionPanel, WebsiteStatRow } from "@/components/website/WebsitePrimitives";
import f1Guide from "@/data/newcomer-guides/f1.json";
import h1bGuide from "@/data/newcomer-guides/h1b.json";
import j1Guide from "@/data/newcomer-guides/j1.json";
import o1Guide from "@/data/newcomer-guides/o1.json";
import { useAutoRead } from "@/hooks/useAutoRead";
import { useAccessibility } from "@/hooks/useAccessibility";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getProfileHeadline, pickText } from "@/lib/content";

export default function DashboardPage() {
  const t = useTranslations();
  const { settings } = useAccessibility();
  const [profile, , isReady] = useUserProfile();
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

  const ssnMessage = isSpanish
    ? `En ${profile.state}, normalmente puedes comprar seguro de auto sin SSN.`
    : `In ${profile.state}, you can usually buy auto insurance without an SSN.`;
  const guides = [f1Guide, h1bGuide, j1Guide, o1Guide] as NewcomerGuideData[];
  const selectedGuide = guides.find((guide) => guide.visa === profile.visaStatus) ?? guides[0];
  const newcomerTaskCount = profile.checklist.filter((item) => item.startsWith("newcomer-")).length;
  const protectionFocus = profile.drives && profile.rents
    ? isSpanish
      ? "Auto + inquilino"
      : "Auto + renters"
    : profile.drives
      ? "Auto"
      : profile.rents
        ? isSpanish
          ? "Inquilino"
          : "Renters"
        : isSpanish
          ? "Basico"
          : "Core setup";
  const snapshotItems = [
    {
      label: isSpanish ? "Estatus de visa" : "Visa status",
      value: profile.visaStatus,
      icon: BadgeCheck,
    },
    {
      label: isSpanish ? "Ubicacion base" : "Home base",
      value: `${profile.city}, ${profile.state} ${profile.zip}`,
      icon: MapPin,
    },
    {
      label: isSpanish ? "Estado SSN" : "SSN status",
      value: profile.hasSsn
        ? (isSpanish ? "Ya configurado" : "Already set up")
        : (isSpanish ? "Aun no" : "Not yet"),
      icon: IdCard,
    },
    {
      label: isSpanish ? "Enfoque de proteccion" : "Protection focus",
      value: protectionFocus,
      icon: ShieldCheck,
    },
  ];
  const nextMoves = [
    {
      href: "/newcomer-guide",
      title: isSpanish ? "Continua tu guia" : "Continue your guide",
      description: isSpanish
        ? `${newcomerTaskCount} tareas marcadas como hechas hasta ahora.`
        : `${newcomerTaskCount} tasks marked done so far.`,
      icon: BookOpenCheck,
    },
    {
      href: "/coverage",
      title: isSpanish ? "Revisa tu cobertura local" : "Check your local coverage",
      description: isSpanish
        ? `Usa ${profile.zip} para ver reglas y precios en ${profile.state}.`
        : `Use ${profile.zip} to see rules and pricing in ${profile.state}.`,
      icon: ShieldCheck,
    },
    {
      href: "/simulate",
      title: isSpanish ? "Prueba un escenario real" : "Run a real-world scenario",
      description: isSpanish
        ? "Mira primero el riesgo que mas puede afectar tu bolsillo."
        : "See which risk can hit your budget hardest first.",
      icon: Sparkles,
    },
  ];
  const upcomingGuideDeadlines = selectedGuide.steps
    .map((step, index) => ({
      id: `newcomer-${selectedGuide.visa}-${index}`,
      title: pickText(step.step, settings.language),
      timing: step.timing ? pickText(step.timing, settings.language) : (isSpanish ? "Pronto" : "Soon"),
      detail: pickText(step.details, settings.language),
      href: "/newcomer-guide",
      icon: BookOpenCheck,
    }))
    .filter((item) => !profile.checklist.includes(item.id))
    .slice(0, 2);
  const profileDeadlines = [
    profile.drives
      ? {
          id: "auto-coverage",
          title: isSpanish ? "Revisa la cobertura de auto" : "Review auto coverage",
          timing: isSpanish ? "Esta semana" : "This week",
          detail: isSpanish
            ? `Estas conduciendo en ${profile.state}. Verifica que entiendes la cobertura minima antes de un problema.`
            : `You drive in ${profile.state}. Check the minimum coverage rules before something goes wrong.`,
          href: "/coverage",
          icon: ShieldCheck,
        }
      : null,
    profile.rents
      ? {
          id: "renters-coverage",
          title: isSpanish ? "Comprueba la cobertura de inquilino" : "Check renter's coverage",
          timing: isSpanish ? "Antes del primer mes" : "Before your first month ends",
          detail: isSpanish
            ? `Usa tu ZIP ${profile.zip} para ver precios y riesgo local para tu apartamento.`
            : `Use your ZIP ${profile.zip} to see local pricing and risk for your apartment.`,
          href: "/coverage",
          icon: ShieldCheck,
        }
      : null,
    !profile.hasSsn && (profile.visaStatus === "H1B" || profile.visaStatus === "O1" || profile.visaStatus === "J1")
      ? {
          id: "ssn-paperwork",
          title: isSpanish ? "Prepara tu tramite de SSN" : "Prepare your SSN paperwork",
          timing: isSpanish ? "Despues de 10 dias en EE. UU." : "After 10 days in the U.S.",
          detail: isSpanish
            ? "Ten lista la carta del empleador o patrocinador antes de ir a la SSA."
            : "Have your employer or sponsor letter ready before you go to the SSA office.",
          href: "/newcomer-guide",
          icon: IdCard,
        }
      : null,
    {
      id: "policy-readiness",
      title: isSpanish ? "Guarda una poliza o PDF para revisar" : "Save a policy or PDF to review",
      timing: isSpanish ? "Antes de firmar algo" : "Before you sign anything",
      detail: isSpanish
        ? "Ten un documento listo para usar el decodificador cuando compares coberturas."
        : "Keep one document ready for the decoder when you start comparing coverage.",
      href: "/decode",
      icon: ScanSearch,
    },
  ].filter(Boolean);
  const deadlineCards = [...upcomingGuideDeadlines, ...profileDeadlines]
    .slice(0, 4) as Array<{
    id: string;
    title: string;
    timing: string;
    detail: string;
    href: string;
    icon: typeof BookOpenCheck;
  }>;

  return (
    <div className="py-2 lg:py-4">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_22rem]">
        <div className="grid gap-6">
          <WebsiteSectionHeader
            eyebrow={t("dashboardEyebrow")}
            title={headline}
            description={t("dashboardHeroCopy")}
            actions={
              <>
                <Link href="/simulate" className="web-primary-button">
                  {t("dashboardRunSimulator")}
                </Link>
                <ReadAloud text={`${headline} ${ssnMessage}`} className="bg-white" />
              </>
            }
          />

          <WebsiteSectionPanel
            eyebrow={isSpanish ? "Resumen" : "Snapshot"}
            title={isSpanish ? "Lo importante ahora mismo" : "What matters right now"}
            description={
              isSpanish
                ? "Tu panel combina tu visa, estado de SSN, ZIP y necesidades de cobertura para priorizar los siguientes pasos."
                : "Your dashboard combines visa, SSN status, ZIP code, and coverage needs to prioritize the next best steps."
            }
          >
            <div className="grid gap-4 md:grid-cols-2">
              {snapshotItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.label} className="web-grid-card">
                    <div className="flex items-start gap-3">
                      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                          {item.label}
                        </p>
                        <p className="mt-2 text-lg font-semibold text-[var(--color-ink)]">{item.value}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-[1.35rem] border border-[var(--color-border)] bg-white px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="web-kicker">{t("dashboardFastFact")}</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--color-ink)]">
                    {t("dashboardFastFactTitle")}
                  </p>
                </div>
                <BadgeAlert className="mt-1 size-5 shrink-0 text-[var(--color-accent)]" />
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{ssnMessage}</p>
            </div>
          </WebsiteSectionPanel>

          <WebsiteSectionPanel
            eyebrow={isSpanish ? "Siguientes pasos" : "Next actions"}
            title={isSpanish ? "Elige el siguiente mejor movimiento." : "Choose the next best move."}
          >
            <div className="grid gap-3">
              {nextMoves.map((item) => {
                const Icon = item.icon;

                return (
                  <Link key={item.href} href={item.href} className="web-action-row">
                    <div className="flex items-start gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                        <Icon className="size-4" />
                      </span>
                      <div>
                        <p className="font-semibold text-[var(--color-ink)]">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">{item.description}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </WebsiteSectionPanel>

          <WebsiteSectionPanel
            eyebrow={isSpanish ? "Fechas proximas" : "Deadlines"}
            title={isSpanish ? "Lo que no deberias dejar pasar" : "What you should not let slip"}
            description={
              isSpanish
                ? "Esta lista cambia segun tu visa, ZIP, SSN y las opciones que marcaste en el perfil."
                : "This list changes based on your visa, ZIP code, SSN status, and the options you chose in your profile."
            }
          >
            <div className="grid gap-3">
              {deadlineCards.map((card) => {
                const Icon = card.icon;

                return (
                  <Link key={card.id} href={card.href} className="web-action-row">
                    <div className="flex items-start gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-[var(--color-ink)]">{card.title}</p>
                          <span className="rounded-full bg-[var(--color-accent-soft)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                            {card.timing}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{card.detail}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </WebsiteSectionPanel>
        </div>

        <aside className="grid gap-4 lg:sticky lg:top-32 lg:self-start">
          <WebsiteRailCard
            eyebrow={isSpanish ? "Panel listo" : "Dashboard ready"}
            title={isSpanish ? "Tu llegada en una vista." : "Your arrival plan in one view."}
            description={ssnMessage}
          >
            <div className="grid gap-4">
              <WebsiteStatRow
                label={isSpanish ? "Tareas de recien llegado" : "Newcomer tasks done"}
                value={newcomerTaskCount}
              />
              <WebsiteStatRow
                label={isSpanish ? "Enfoque de cobertura" : "Coverage focus"}
                value={protectionFocus}
              />
              <WebsiteStatRow
                label={isSpanish ? "Ubicacion" : "Location"}
                value={`${profile.city}, ${profile.state}`}
              />
            </div>
          </WebsiteRailCard>

          <WebsiteRailCard
            eyebrow={isSpanish ? "Acciones rapidas" : "Quick actions"}
            title={isSpanish ? "Abre las herramientas principales." : "Open the main tools."}
          >
            <div className="grid gap-3">
              <WebsiteActionLink
                href="/coverage"
                title={t("dashboardCoverageTitle")}
                description={t("dashboardCoverageCopy")}
              />
              <WebsiteActionLink
                href="/decode"
                title={t("dashboardDecodeTitle")}
                description={t("dashboardDecodeCopy")}
              />
              <WebsiteActionLink
                href="/newcomer-guide"
                title={t("dashboardGuideTitle")}
                description={t("dashboardGuideCopy")}
              />
            </div>
          </WebsiteRailCard>

          <WebsiteRailCard
            eyebrow={isSpanish ? "Mantenimiento" : "Profile reset"}
            title={isSpanish ? "Empieza de nuevo si lo necesitas." : "Start fresh if you need to."}
            description={
              isSpanish
                ? "Borra tu perfil guardado y vuelve al ingreso inicial."
                : "Clear the saved profile and return to the intake flow."
            }
          >
            <div className="flex flex-wrap gap-3">
              <ClearDataButton />
            </div>
          </WebsiteRailCard>

          <div className="web-grid-card">
            <div className="flex items-start gap-3">
              <Clock3 className="mt-1 size-5 shrink-0 text-[var(--color-accent)]" />
              <p className="text-sm leading-6 text-[var(--color-muted)]">
                {isSpanish
                  ? "Tus prioridades cambian segun el progreso de la guia y los documentos que revises."
                  : "Your priorities update as you make progress through the guide and review documents."}
              </p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
