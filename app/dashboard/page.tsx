"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeAlert,
  BadgeCheck,
  BookOpenCheck,
  ClipboardList,
  Clock3,
  IdCard,
  MapPin,
  PhoneCall,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { type NewcomerGuideData } from "@/components/NewcomerGuide";
import { ClearDataButton } from "@/components/ClearDataButton";
import { ReadAloud } from "@/components/ReadAloud";
import { WebsiteActionLink, WebsiteRailCard, WebsiteSectionPanel, WebsiteStatRow } from "@/components/website/WebsitePrimitives";
import f1Guide from "@/data/newcomer-guides/f1.json";
import h1bGuide from "@/data/newcomer-guides/h1b.json";
import j1Guide from "@/data/newcomer-guides/j1.json";
import o1Guide from "@/data/newcomer-guides/o1.json";
import { useAccessibility } from "@/hooks/useAccessibility";
import { useAutoRead } from "@/hooks/useAutoRead";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getProfileHeadline, pickText } from "@/lib/content";

type DashboardMetric = {
  label: string;
  value: string;
  status: string;
  detail: string;
};

type DashboardPriority = {
  id: string;
  title: string;
  description: string;
  reason: string;
  status: string;
  href: string;
  ctaLabel: string;
  icon: LucideIcon;
  timeline: "now" | "week" | "month";
  score: number;
};

type DashboardTimeline = DashboardPriority["timeline"];

function getProtectionFocus({
  drives,
  rents,
  isSpanish,
}: {
  drives: boolean;
  rents: boolean;
  isSpanish: boolean;
}) {
  if (drives && rents) {
    return isSpanish ? "Auto + inquilino" : "Auto + renters";
  }

  if (drives) {
    return "Auto";
  }

  if (rents) {
    return isSpanish ? "Inquilino" : "Renters";
  }

  return isSpanish ? "Basico" : "Core setup";
}

function createPriority(priority: DashboardPriority) {
  return priority;
}

function DashboardMetricCard({
  metric,
  icon: Icon,
}: {
  metric: DashboardMetric;
  icon: LucideIcon;
}) {
  return (
    <article className="dashboard-metric-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="dashboard-mini-kicker">{metric.label}</p>
          <p className="mt-2 text-2xl font-semibold leading-tight text-[var(--color-ink)]">
            {metric.value}
          </p>
        </div>
        <span className="dashboard-icon-badge">
          <Icon className="size-4" />
        </span>
      </div>
      <p className="dashboard-status-pill mt-4">{metric.status}</p>
      <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{metric.detail}</p>
    </article>
  );
}

function DashboardPriorityCard({
  priority,
}: {
  priority: DashboardPriority;
}) {
  const Icon = priority.icon;

  return (
    <article className="dashboard-priority-card">
      <div className="flex items-start justify-between gap-3">
        <span className="dashboard-icon-badge">
          <Icon className="size-4" />
        </span>
        <span className="dashboard-status-pill shrink-0">{priority.status}</span>
      </div>

      <div className="mt-5">
        <h3 className="text-xl font-semibold leading-tight text-[var(--color-ink)]">
          {priority.title}
        </h3>
        <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
          {priority.description}
        </p>
      </div>

      <div className="mt-5 rounded-[1.2rem] bg-[var(--color-accent-soft)]/70 px-4 py-3 text-sm leading-6 text-[var(--color-ink)]">
        {priority.reason}
      </div>

      <Link href={priority.href} className="dashboard-inline-link mt-5">
        <span>{priority.ctaLabel}</span>
        <ArrowRight className="size-4" />
      </Link>
    </article>
  );
}

function DashboardTimelineGroup({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: DashboardPriority[];
}) {
  return (
    <section className="dashboard-plan-group">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="dashboard-mini-kicker">{title}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{description}</p>
        </div>
        <span className="dashboard-plan-count">{items.length}</span>
      </div>

      <div className="mt-5 grid gap-3">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link key={item.id} href={item.href} className="dashboard-plan-row">
              <div className="flex items-start gap-3">
                <span className="dashboard-plan-icon">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-[var(--color-ink)]">{item.title}</p>
                    <span className="dashboard-status-pill">{item.status}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{item.description}</p>
                </div>
              </div>
              <ArrowRight className="mt-1 size-4 shrink-0 text-[var(--color-accent)]" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

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

  const guides = [f1Guide, h1bGuide, j1Guide, o1Guide] as NewcomerGuideData[];
  const selectedGuide = guides.find((guide) => guide.visa === profile.visaStatus) ?? guides[0];
  const totalGuideSteps = selectedGuide.steps.length;
  const pendingGuideSteps = selectedGuide.steps
    .map((step, index) => ({
      id: `newcomer-${selectedGuide.visa}-${index}`,
      title: pickText(step.step, settings.language),
      detail: pickText(step.details, settings.language),
    }))
    .filter((step) => !profile.checklist.includes(step.id));
  const newcomerTaskCount = totalGuideSteps - pendingGuideSteps.length;
  const guideProgressPercent = totalGuideSteps === 0 ? 0 : Math.round((newcomerTaskCount / totalGuideSteps) * 100);
  const needsSsnPacket =
    !profile.hasSsn &&
    (profile.visaStatus === "H1B" || profile.visaStatus === "O1" || profile.visaStatus === "J1");
  const protectionFocus = getProtectionFocus({
    drives: profile.drives,
    rents: profile.rents,
    isSpanish,
  });
  const coverageAreaCount = Number(profile.drives) + Number(profile.rents);
  const ssnStatus = profile.hasSsn
    ? isSpanish
      ? "SSN activo"
      : "SSN ready"
    : isSpanish
      ? "Sin SSN"
      : "No SSN yet";
  const primaryMarket = profile.drives
    ? isSpanish
      ? "Mercado de auto"
      : "Auto market"
    : profile.rents
      ? isSpanish
        ? "Mercado de inquilino"
        : "Renters market"
      : isSpanish
        ? "Base principal"
        : "Core setup";
  const topGuideStep = pendingGuideSteps[0];
  const ssnMessage = isSpanish
    ? `En ${profile.state}, normalmente puedes comprar seguro de auto sin SSN.`
    : `In ${profile.state}, you can usually buy auto insurance without an SSN.`;
  const heroDescription = isSpanish
    ? `Tu panel organiza cobertura, documentos y prioridades de llegada para ${profile.city}, ${profile.state}.`
    : `Your dashboard keeps your coverage, documents, and first steps in one place for ${profile.city}, ${profile.state}.`;
  const documentReadiness = needsSsnPacket
    ? {
        value: isSpanish ? "Paquete SSN" : "SSN packet",
        status: isSpanish ? "Preparacion abierta" : "Prep needed",
        detail: isSpanish
          ? "Ten lista la carta del empleador o patrocinador antes de visitar la SSA."
          : "Have your employer or sponsor letter ready before visiting the SSA office.",
      }
    : {
        value: isSpanish ? "Revision de poliza" : "Policy review",
        status: isSpanish ? "Un PDF pendiente" : "One PDF needed",
        detail: isSpanish
          ? "Guarda una foto o PDF para usar el decodificador cuando compares cobertura."
          : "Keep one photo or PDF ready for the decoder when you compare coverage.",
      };
  const guideTimeline: DashboardTimeline = newcomerTaskCount === 0 ? "now" : "week";
  const rentersTimeline: DashboardTimeline = profile.drives ? "week" : "now";

  const allPriorities: DashboardPriority[] = [
    ...(topGuideStep
      ? [
          createPriority({
            id: "guide-progress",
            title: isSpanish ? "Continua tu guia de llegada" : "Continue your newcomer guide",
            description: topGuideStep.detail,
            reason: isSpanish
              ? `${pendingGuideSteps.length} tareas todavia abiertas en tu plan de llegada.`
              : `${pendingGuideSteps.length} tasks are still open in your arrival plan.`,
            status: newcomerTaskCount === 0 ? (isSpanish ? "Empieza ahora" : "Start now") : (isSpanish ? "En progreso" : "In progress"),
            href: "/newcomer-guide",
            ctaLabel: isSpanish ? "Abrir guia" : "Open guide",
            icon: BookOpenCheck,
            timeline: guideTimeline,
            score: newcomerTaskCount === 0 ? 100 : 93,
          }),
        ]
      : []),
    ...(profile.drives
      ? [
          createPriority({
            id: "auto-coverage",
            title: isSpanish ? "Revisa tu cobertura de auto" : "Review your auto coverage",
            description: isSpanish
              ? `Usa ${profile.zip} para confirmar limites minimos y el tipo de proteccion que necesitas en ${profile.state}.`
              : `Use ${profile.zip} to confirm minimum limits and the type of protection you need in ${profile.state}.`,
            reason: isSpanish
              ? "Conduces ahora mismo, asi que esta es tu mayor exposicion financiera."
              : "You are driving now, so this is the biggest risk to address first.",
            status: isSpanish ? "Prioridad alta" : "High priority",
            href: "/coverage",
            ctaLabel: isSpanish ? "Revisar cobertura" : "Review coverage",
            icon: ShieldCheck,
            timeline: "now",
            score: profile.rents ? 92 : 97,
          }),
        ]
      : []),
    ...(profile.rents
      ? [
          createPriority({
            id: "renters-coverage",
            title: isSpanish ? "Confirma tu cobertura de inquilino" : "Confirm your renters coverage",
            description: isSpanish
              ? `Compara precios y riesgo local para ${profile.zip} antes de cerrar tu configuracion del apartamento.`
              : `Compare pricing and local risk for ${profile.zip} before you finalize your apartment setup.`,
            reason: isSpanish
              ? "Tu vivienda y tus pertenencias necesitan una proteccion separada del seguro de auto."
              : "Your home and belongings need coverage that is separate from auto insurance.",
            status: isSpanish ? "Esta semana" : "This week",
            href: "/coverage",
            ctaLabel: isSpanish ? "Ver cobertura" : "View coverage",
            icon: ShieldCheck,
            timeline: rentersTimeline,
            score: profile.drives ? 84 : 94,
          }),
        ]
      : []),
    ...(needsSsnPacket
      ? [
          createPriority({
            id: "ssn-paperwork",
            title: isSpanish ? "Prepara tu tramite de SSN" : "Prepare your SSN paperwork",
            description: isSpanish
              ? "Ten lista la carta del empleador o patrocinador antes de tu visita a la SSA."
              : "Have your employer or sponsor letter ready before your SSA visit.",
            reason: isSpanish
              ? "Tener este paquete listo reduce friccion cuando pases de orientacion a compra."
              : "Having this paperwork ready makes the next steps easier.",
            status: isSpanish ? "Importante" : "Important",
            href: "/newcomer-guide",
            ctaLabel: isSpanish ? "Preparar tramite" : "Prepare paperwork",
            icon: IdCard,
            timeline: "week",
            score: 91,
          }),
        ]
      : []),
    createPriority({
      id: "policy-review",
      title: isSpanish ? "Ten una poliza lista para revisar" : "Keep a policy ready to review",
      description: isSpanish
        ? "Sube una foto o PDF cuando compares opciones para traducir limites, deducibles y exclusiones."
        : "Upload a photo or PDF when comparing options so you can clearly read the limits, deductible, and exclusions.",
      reason: isSpanish
        ? "El decodificador te ayuda a evitar firmar algo que no entiendes por completo."
        : "The decoder helps you avoid signing something you do not fully understand.",
      status: isSpanish ? "Antes de firmar" : "Before you sign",
      href: "/decode",
      ctaLabel: isSpanish ? "Abrir decodificador" : "Open decoder",
      icon: ScanSearch,
      timeline: "month",
      score: 78,
    }),
    createPriority({
      id: "simulator",
      title: isSpanish ? "Corre un escenario real" : "Run a real-world scenario",
      description: isSpanish
        ? "Mira primero el golpe financiero mas probable para tu configuracion actual."
        : "See the most likely out-of-pocket cost for your current setup first.",
      reason: isSpanish
        ? "La comparacion en dolares te ayuda a decidir que cubrir primero."
        : "The dollar comparison helps you decide what to protect first.",
      status: isSpanish ? "Contexto rapido" : "Quick context",
      href: "/simulate",
      ctaLabel: t("dashboardRunSimulator"),
      icon: Sparkles,
      timeline: "week",
      score: 76,
    }),
    createPriority({
      id: "claim-readiness",
      title: isSpanish ? "Ten ayuda de reclamo a mano" : "Keep claim help nearby",
      description: isSpanish
        ? "Guarda la guia de reclamo para saber que hacer si algo pasa hoy."
        : "Keep the claim coach handy so you know what to do if something happens today.",
      reason: isSpanish
        ? "La respuesta temprana importa cuando necesitas documentar un incidente."
        : "Early response matters when you need to document an incident.",
      status: isSpanish ? "Listo por si acaso" : "Ready just in case",
      href: "/claim",
      ctaLabel: isSpanish ? "Abrir reclamos" : "Open claim coach",
      icon: ClipboardList,
      timeline: "month",
      score: 70,
    }),
  ];

  const rankedPriorities = [...allPriorities].sort((left, right) => right.score - left.score);
  const topPriorities = rankedPriorities.slice(0, 3);
  const topPriority = topPriorities[0];
  const groupedPlan = {
    now: rankedPriorities.filter((item) => item.timeline === "now").slice(0, 2),
    week: rankedPriorities.filter((item) => item.timeline === "week").slice(0, 3),
    month: rankedPriorities.filter((item) => item.timeline === "month").slice(0, 3),
  };
  const metricCards: Array<DashboardMetric & { icon: LucideIcon }> = [
    {
      label: isSpanish ? "Progreso de llegada" : "Arrival progress",
      value: `${guideProgressPercent}%`,
      status: isSpanish
        ? `${newcomerTaskCount} de ${totalGuideSteps} pasos`
        : `${newcomerTaskCount} of ${totalGuideSteps} steps`,
      detail: topGuideStep
        ? topGuideStep.title
        : isSpanish
          ? "Tu guia principal esta al dia."
          : "Your core guide is up to date.",
      icon: BookOpenCheck,
    },
    {
      label: isSpanish ? "Enfoque de proteccion" : "Protection focus",
      value: protectionFocus,
      status:
        coverageAreaCount > 1
          ? (isSpanish ? "Dos areas activas" : "Two active areas")
          : coverageAreaCount === 1
            ? (isSpanish ? "Una area activa" : "One active area")
            : (isSpanish ? "Base inicial" : "Starting point"),
      detail: isSpanish
        ? `${primaryMarket} para ${profile.city}.`
        : `${primaryMarket} for ${profile.city}.`,
      icon: ShieldCheck,
    },
    {
      label: isSpanish ? "Documentos" : "Documents",
      value: documentReadiness.value,
      status: documentReadiness.status,
      detail: documentReadiness.detail,
      icon: ScanSearch,
    },
    {
      label: isSpanish ? "Contexto local" : "Local context",
      value: `${profile.city}, ${profile.state}`,
      status: `${profile.zip} · ${ssnStatus}`,
      detail: ssnMessage,
      icon: MapPin,
    },
  ];

  const readAloudSummary = `${headline}. ${heroDescription} ${topPriority?.title ?? ""}. ${topPriority?.reason ?? ""}`;

  return (
    <div className="py-2 lg:py-4">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_22rem]">
        <div className="grid gap-6">
          <section className="dashboard-hero">
            <div className="dashboard-hero-grid">
              <div>
                <p className="web-kicker">{t("dashboardEyebrow")}</p>
                <h1 className="mt-3 max-w-[14ch] font-display text-4xl leading-none text-[var(--color-ink)] lg:text-[4.25rem]">
                  {headline}
                </h1>
                <p className="mt-5 max-w-[60ch] text-base leading-7 text-[var(--color-muted)] lg:text-lg">
                  {heroDescription}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="dashboard-chip">
                    <BadgeCheck className="size-3.5" />
                    <span>{profile.visaStatus}</span>
                  </span>
                  <span className="dashboard-chip">
                    <IdCard className="size-3.5" />
                    <span>{ssnStatus}</span>
                  </span>
                  <span className="dashboard-chip">
                    <ShieldCheck className="size-3.5" />
                    <span>{protectionFocus}</span>
                  </span>
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Link href="/simulate" className="web-primary-button">
                    {t("dashboardRunSimulator")}
                  </Link>
                  <Link href="/coverage" className="web-secondary-button">
                    {t("dashboardReviewCoverage")}
                  </Link>
                  <ReadAloud text={readAloudSummary} className="bg-white" />
                </div>
              </div>

              <aside className="dashboard-hero-focus">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="dashboard-mini-kicker">
                      {isSpanish ? "Enfoque principal" : "Primary focus"}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold leading-tight text-[var(--color-ink)]">
                      {topPriority?.title}
                    </h2>
                  </div>
                  <BadgeAlert className="mt-1 size-5 shrink-0 text-[var(--color-accent)]" />
                </div>

                <p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">
                  {topPriority?.description}
                </p>

                <div className="mt-5 rounded-[1.25rem] bg-white px-4 py-4">
                  <p className="dashboard-mini-kicker">
                    {isSpanish ? "Por que va primero" : "Why it is first"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-ink)]">{topPriority?.reason}</p>
                </div>

                <Link href={topPriority?.href ?? "/newcomer-guide"} className="dashboard-inline-link mt-5">
                  <span>{topPriority?.ctaLabel}</span>
                  <ArrowRight className="size-4" />
                </Link>
              </aside>
            </div>
          </section>

          <section className="dashboard-kpi-strip">
            {metricCards.map((metric) => (
              <DashboardMetricCard key={metric.label} metric={metric} icon={metric.icon} />
            ))}
          </section>

          <WebsiteSectionPanel
            eyebrow={isSpanish ? "Prioridades" : "Top priorities"}
            title={isSpanish ? "Lo que merece atencion primero" : "What deserves attention first"}
            description={
              isSpanish
                ? "Estas recomendaciones se ordenan por urgencia, riesgo y preparacion para tu perfil."
                : "These recommendations are ranked by urgency, risk, and readiness for your profile."
            }
          >
            <div className="grid gap-4 xl:grid-cols-3">
              {topPriorities.map((priority) => (
                <DashboardPriorityCard key={priority.id} priority={priority} />
              ))}
            </div>
          </WebsiteSectionPanel>

          <WebsiteSectionPanel
            eyebrow={isSpanish ? "Plan de 30 dias" : "30-day plan"}
            title={isSpanish ? "Una vista mas estructurada de lo que sigue" : "A more structured view of what comes next"}
            description={
              isSpanish
                ? "Agrupamos tus tareas por momento para que el panel se sienta claro y accionable."
                : "Your next steps are grouped by timing so the dashboard stays clear and actionable."
            }
          >
            <div className="grid gap-4 xl:grid-cols-3">
              <DashboardTimelineGroup
                title={isSpanish ? "Ahora" : "Now"}
                description={
                  isSpanish
                    ? "Los pasos que reducen riesgo de inmediato."
                    : "The steps that reduce risk right away."
                }
                items={groupedPlan.now}
              />
              <DashboardTimelineGroup
                title={isSpanish ? "Esta semana" : "This week"}
                description={
                  isSpanish
                    ? "Tareas que consolidan tu configuracion."
                    : "Tasks that tighten up your setup."
                }
                items={groupedPlan.week}
              />
              <DashboardTimelineGroup
                title={isSpanish ? "Este mes" : "This month"}
                description={
                  isSpanish
                    ? "Acciones para comprar con mas confianza."
                    : "Actions that make future decisions more confident."
                }
                items={groupedPlan.month}
              />
            </div>
          </WebsiteSectionPanel>
        </div>

        <aside className="grid gap-4 lg:sticky lg:top-32 lg:self-start">
          <WebsiteRailCard
            eyebrow={isSpanish ? "Perfil" : "Profile"}
            title={isSpanish ? "Tu configuracion de un vistazo" : "Your setup at a glance"}
            description={
              isSpanish
                ? "Un resumen limpio para revisar antes de comparar cobertura o documentos."
                : "A clean summary to review before you compare coverage or documents."
            }
          >
            <div className="grid gap-4">
              <WebsiteStatRow label={isSpanish ? "Visa" : "Visa"} value={profile.visaStatus} />
              <WebsiteStatRow label={isSpanish ? "Base" : "Home base"} value={`${profile.city}, ${profile.state}`} />
              <WebsiteStatRow label={isSpanish ? "Ingreso mensual" : "Monthly income"} value={`$${profile.monthlyIncome}`} />
              <WebsiteStatRow label={isSpanish ? "Enfoque" : "Focus"} value={protectionFocus} />
            </div>
            <div className="mt-5">
              <ClearDataButton />
            </div>
          </WebsiteRailCard>

          <WebsiteRailCard
            eyebrow={isSpanish ? "Herramientas" : "Key tools"}
            title={isSpanish ? "Abre las herramientas principales" : "Open the tools you will use most"}
            description={
              isSpanish
                ? "Cada acceso directo responde a una decision distinta."
                : "Each shortcut supports a different decision."
            }
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
            eyebrow={isSpanish ? "Ayuda ahora" : "Need help now?"}
            title={isSpanish ? "Usa apoyo rapido si algo cambio hoy" : "Use fast support if something changed today"}
            description={
              isSpanish
                ? "Empieza con la guia de reclamo y luego llama si necesitas respaldo humano."
                : "Start with the claim coach, then call if you need human backup."
            }
          >
            <div className="grid gap-3">
              <WebsiteActionLink
                href="/claim"
                title={t("claimCoach")}
                description={
                  isSpanish
                    ? "Sigue los pasos guiados para documentar un incidente."
                    : "Follow guided steps to document an incident."
                }
              />

              <a href="tel:8007325246" className="dashboard-help-call">
                <span className="dashboard-icon-badge">
                  <PhoneCall className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--color-ink)]">
                    {isSpanish ? "Llamar para apoyo" : "Call for support"}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">800-732-5246</p>
                </div>
              </a>

              <div className="dashboard-help-note">
                <Clock3 className="mt-0.5 size-4 shrink-0 text-[var(--color-accent)]" />
                <p className="text-sm leading-6 text-[var(--color-muted)]">
                  {isSpanish
                    ? "Ten listas fotos, fechas y una breve descripcion antes de reportar."
                    : "Have photos, dates, and a short description ready before you report."}
                </p>
              </div>
            </div>
          </WebsiteRailCard>
        </aside>
      </section>
    </div>
  );
}
