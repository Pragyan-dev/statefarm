"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeAlert,
  BadgeCheck,
  BookOpenCheck,
  Clock3,
  IdCard,
  MapPin,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { ClearDataButton } from "@/components/ClearDataButton";
import { ProgressChecklist, type ChecklistItem } from "@/components/ProgressChecklist";
import { ReadAloud } from "@/components/ReadAloud";
import { type NewcomerGuideData } from "@/components/NewcomerGuide";
import f1Guide from "@/data/newcomer-guides/f1.json";
import h1bGuide from "@/data/newcomer-guides/h1b.json";
import j1Guide from "@/data/newcomer-guides/j1.json";
import o1Guide from "@/data/newcomer-guides/o1.json";
import { useAutoRead } from "@/hooks/useAutoRead";
import { useAccessibility } from "@/hooks/useAccessibility";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getProfileHeadline, pickText } from "@/lib/content";

function getChecklistItems(
  profile: {
    visaStatus: string;
    drives: boolean;
    rents: boolean;
  },
  isSpanish: boolean,
): ChecklistItem[] {
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
  const deadlineCards = [...upcomingGuideDeadlines, ...profileDeadlines].slice(0, 4) as Array<{
    id: string;
    title: string;
    timing: string;
    detail: string;
    href: string;
    icon: typeof BookOpenCheck;
  }>;

  return (
    <div className="website-page">
      <section className="sf-main-grid xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div className="grid gap-6">
          <section className="page-hero p-6 sm:p-8 lg:p-10">
            <p className="eyebrow">{t("dashboardEyebrow")}</p>
            <h1 className="sf-section-title mt-3 max-w-[11ch]">{headline}</h1>
            <p className="sf-body-copy mt-4 max-w-[42rem]">{t("dashboardHeroCopy")}</p>
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

          <section className="grid gap-6 lg:grid-cols-[1fr_1fr] xl:grid-cols-[1.05fr_0.95fr]">
            <section className="panel-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="eyebrow">{isSpanish ? "Instantanea de llegada" : "Arrival snapshot"}</p>
                  <h2 className="font-display text-2xl text-[var(--color-ink)]">
                    {isSpanish ? "Lo importante para ti ahora" : "What matters for you right now"}
                  </h2>
                </div>
                <div className="rounded-full bg-[var(--color-accent-soft)] px-3 py-2 text-sm font-semibold text-[var(--color-accent)]">
                  {newcomerTaskCount}
                  {isSpanish ? " tareas hechas" : " tasks done"}
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {snapshotItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/75 px-4 py-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                          <Icon className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                            {item.label}
                          </p>
                          <p className="mt-2 font-semibold text-[var(--color-ink)]">{item.value}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 rounded-[1.6rem] border border-[var(--color-border)] bg-[var(--color-paper)] px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  {isSpanish ? "Siguientes mejores movimientos" : "Best next moves"}
                </p>
                <div className="mt-4 grid gap-3">
                  {nextMoves.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="rounded-[1.35rem] border border-[var(--color-border)] bg-white/80 px-4 py-4 transition hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-[var(--color-ink)]">{item.title}</p>
                            <p className="mt-1 text-sm text-[var(--color-muted)]">{item.description}</p>
                          </div>
                          <Icon className="mt-0.5 size-5 text-[var(--color-accent)]" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="panel-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="eyebrow">{isSpanish ? "Fechas proximas" : "Deadlines coming up"}</p>
                  <h2 className="font-display text-2xl text-[var(--color-ink)]">
                    {isSpanish ? "Lo que no deberias dejar pasar" : "What you should not let slip"}
                  </h2>
                </div>
                <Clock3 className="mt-1 size-6 text-[var(--color-accent)]" />
              </div>
              <p className="mt-4 max-w-[48ch] text-sm text-[var(--color-muted)]">
                {isSpanish
                  ? "Esta lista cambia segun tu visa, ZIP, SSN y las opciones que marcaste en el perfil."
                  : "This list changes based on your visa, ZIP code, SSN status, and the options you chose in your profile."}
              </p>

              <div className="mt-5 grid gap-3">
                {deadlineCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <Link
                      key={card.id}
                      href={card.href}
                      className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/75 px-4 py-4 transition hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
                    >
                      <div className="flex items-start gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                          <Icon className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-[var(--color-ink)]">{card.title}</p>
                            <span className="rounded-full bg-[var(--color-paper)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                              {card.timing}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-[var(--color-muted)]">{card.detail}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
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
                <p className="font-semibold text-[var(--color-ink)]">
                  {isSpanish ? "Ingreso mensual" : "Monthly income"}
                </p>
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
