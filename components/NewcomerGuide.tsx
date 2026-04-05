"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock3,
  FileText,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import { ReadAloud } from "@/components/ReadAloud";
import { WebsiteRailCard } from "@/components/website/WebsitePrimitives";
import { useAccessibility } from "@/hooks/useAccessibility";
import { buildGoogleMapsSearchUrl, pickText } from "@/lib/content";
import type {
  LocalizedText,
  NewcomerGuidePhase,
  NewcomerGuideStep,
  VisaType,
} from "@/lib/types";

export interface NewcomerGuideData {
  visa: VisaType;
  title: LocalizedText;
  steps: NewcomerGuideStep[];
  addon?: {
    title: LocalizedText;
    items: LocalizedText[];
  };
}

type GuideTask = NewcomerGuideStep & {
  index: number;
  taskId: string;
  isDone: boolean;
};

const PHASES: NewcomerGuidePhase[] = ["now", "week", "month"];

function getTaskId(visa: VisaType, index: number) {
  return `newcomer-${visa}-${index}`;
}

export function NewcomerGuide({
  guides,
  profileVisa,
  selectedVisa,
  onSelectVisa,
  zipCode,
  city,
  state,
  hasSsn,
  completedTaskIds,
  onToggleTask,
  isPreview,
}: {
  guides: NewcomerGuideData[];
  profileVisa: VisaType;
  selectedVisa: VisaType;
  onSelectVisa: (visa: VisaType) => void;
  zipCode: string;
  city: string;
  state: string;
  hasSsn: boolean;
  completedTaskIds: string[];
  onToggleTask: (taskId: string) => void;
  isPreview: boolean;
}) {
  const { settings } = useAccessibility();
  const [manualExpandedTaskId, setManualExpandedTaskId] = useState<string | null | undefined>(undefined);
  const isSpanish = settings.language === "es";

  const activeGuide = useMemo(
    () => guides.find((guide) => guide.visa === selectedVisa) ?? guides.find((guide) => guide.visa === profileVisa) ?? guides[0],
    [guides, profileVisa, selectedVisa],
  );

  const tasks = useMemo<GuideTask[]>(
    () =>
      activeGuide.steps.map((step, index) => {
        const taskId = getTaskId(activeGuide.visa, index);
        return {
          ...step,
          index,
          taskId,
          isDone: completedTaskIds.includes(taskId),
        };
      }),
    [activeGuide, completedTaskIds],
  );

  const lanes = useMemo(
    () =>
      PHASES.map((phase) => {
        const items = tasks
          .filter((task) => task.phase === phase)
          .sort((left, right) => {
            if (left.isDone !== right.isDone) {
              return Number(left.isDone) - Number(right.isDone);
            }

            return left.index - right.index;
          });

        return {
          phase,
          items,
        };
      }).filter((lane) => lane.items.length > 0),
    [tasks],
  );

  const nextTask = tasks.find((task) => !task.isDone) ?? tasks[0] ?? null;
  const completedCount = tasks.filter((task) => task.isDone).length;
  const progressPercent = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
  const defaultExpandedTaskId =
    lanes.find((lane) => lane.items.some((task) => !task.isDone))?.items.find((task) => !task.isDone)?.taskId ??
    lanes[0]?.items[0]?.taskId ??
    null;
  const taskIds = useMemo(() => new Set(tasks.map((task) => task.taskId)), [tasks]);
  const expandedTaskId =
    manualExpandedTaskId === undefined
      ? defaultExpandedTaskId
      : manualExpandedTaskId !== null && taskIds.has(manualExpandedTaskId)
        ? manualExpandedTaskId
        : defaultExpandedTaskId;

  const nextDocuments = useMemo(() => {
    const documentSet = new Set<string>();
    const pendingTasks = tasks.filter((task) => !task.isDone).slice(0, 2);

    for (const task of pendingTasks) {
      for (const doc of task.docs) {
        documentSet.add(doc);
      }
    }

    return Array.from(documentSet);
  }, [tasks]);

  const helpfulLinks = useMemo(() => {
    const linkMap = new Map<string, { href: string; label: string; detail: string }>();

    for (const task of tasks) {
      const taskTitle = pickText(task.step, settings.language);

      for (const resource of task.resources ?? []) {
        linkMap.set(resource.href, {
          href: resource.href,
          label: pickText(resource.label, settings.language),
          detail: taskTitle,
        });
      }

      if (task.link) {
        linkMap.set(task.link, {
          href: task.link,
          label: isSpanish ? "Abrir portal oficial" : "Open official portal",
          detail: taskTitle,
        });
      }

      if (task.mapsQuery) {
        const href = buildGoogleMapsSearchUrl(task.mapsQuery, zipCode);
        linkMap.set(href, {
          href,
          label: isSpanish ? "Buscar cerca de ti" : "Find nearby",
          detail: taskTitle,
        });
      }
    }

    return Array.from(linkMap.values()).slice(0, 6);
  }, [isSpanish, settings.language, tasks, zipCode]);

  const phaseLabels: Record<NewcomerGuidePhase, string> = {
    now: isSpanish ? "Empieza ahora" : "Start now",
    week: isSpanish ? "Esta semana" : "This week",
    month: isSpanish ? "Este mes" : "This month",
  };

  const headerSummary = nextTask
    ? isSpanish
      ? `Siguiente paso: ${pickText(nextTask.step, settings.language)}. ${pickText(nextTask.details, settings.language)}`
      : `Next step: ${pickText(nextTask.step, settings.language)}. ${pickText(nextTask.details, settings.language)}`
    : isSpanish
      ? "Tu guía principal ya está al día."
      : "Your core guide is up to date.";

  return (
    <div className="grid gap-6">
      <section className="web-card">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,24rem)] xl:items-start">
          <div>
            <p className="web-kicker">{isSpanish ? "Plan de llegada" : "Arrival plan"}</p>
            <h1 className="mt-3 max-w-[14ch] font-display text-4xl leading-none text-[var(--color-ink)] lg:text-6xl">
              {pickText(activeGuide.title, settings.language)}
            </h1>
            <p className="mt-4 max-w-[60ch] text-base leading-7 text-[var(--color-muted)] lg:text-lg">
              {isSpanish
                ? "Organiza lo urgente, lo que toca esta semana y lo que conviene cerrar este mes sin perder documentos ni enlaces clave."
                : "Organize what matters now, what belongs this week, and what is worth closing out this month without losing key documents or links."}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <span className="dashboard-chip">
                <MapPin className="size-4" />
                <span>
                  {city}, {state} {zipCode}
                </span>
              </span>
              <span className="dashboard-chip">
                <ShieldCheck className="size-4" />
                <span>{isSpanish ? `Visa guardada ${profileVisa}` : `Saved visa ${profileVisa}`}</span>
              </span>
              <span className="dashboard-chip">
                <Check className="size-4" />
                <span>
                  {isPreview
                    ? isSpanish
                      ? `Vista previa ${selectedVisa}`
                      : `Previewing ${selectedVisa}`
                    : isSpanish
                      ? `${completedCount} de ${tasks.length} pasos`
                      : `${completedCount} of ${tasks.length} steps`}
                </span>
              </span>
              <span className="dashboard-chip">
                <Clock3 className="size-4" />
                <span>{hasSsn ? (isSpanish ? "SSN listo" : "SSN ready") : (isSpanish ? "SSN pendiente" : "No SSN yet")}</span>
              </span>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-[rgba(59,58,57,0.12)] bg-[var(--color-accent-soft)]/75 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="dashboard-mini-kicker">
                  {isPreview ? (isSpanish ? "Guia en vista previa" : "Preview track") : (isSpanish ? "Siguiente mejor paso" : "Best next step")}
                </p>
                <p className="mt-3 text-xl font-semibold leading-tight text-[var(--color-ink)]">
                  {nextTask
                    ? pickText(nextTask.step, settings.language)
                    : isSpanish
                      ? "Todo al dia"
                      : "Everything is up to date"}
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                  {nextTask
                    ? pickText(nextTask.details, settings.language)
                    : isSpanish
                      ? "Ya completaste los pasos principales de esta guia."
                      : "You already completed the core steps in this guide."}
                </p>
              </div>
              {!isPreview ? (
                <div className="rounded-[1.1rem] bg-white px-3 py-2 text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                    {isSpanish ? "Progreso" : "Progress"}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-[var(--color-ink)]">{progressPercent}%</p>
                </div>
              ) : null}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <ReadAloud text={headerSummary} language={settings.language} />
              {nextTask?.timing ? (
                <span className="dashboard-status-pill">{pickText(nextTask.timing, settings.language)}</span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-[rgba(59,58,57,0.12)] bg-[rgba(255,255,255,0.82)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="dashboard-mini-kicker">{isSpanish ? "Cambiar guia" : "Switch guide"}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                {isSpanish
                  ? "Tu visa guardada sigue siendo la principal. Puedes comparar otras guias en modo vista previa."
                  : "Your saved visa stays as the working track. You can compare other guides in preview mode."}
              </p>
            </div>
            <div
              role="tablist"
              aria-label={isSpanish ? "Guias de visa" : "Visa guides"}
              className="grid w-full gap-2 sm:grid-cols-2 xl:w-auto xl:grid-cols-4"
            >
              {guides.map((guide) => {
                const active = guide.visa === activeGuide.visa;
                const isSaved = guide.visa === profileVisa;

                return (
                  <button
                    key={guide.visa}
                    role="tab"
                    type="button"
                    aria-selected={active}
                    onClick={() => onSelectVisa(guide.visa)}
                    className={`rounded-[1.1rem] border px-4 py-3 text-left text-sm font-semibold transition ${
                      active
                        ? "border-[rgba(211,60,39,0.28)] bg-[#fff7f4] text-[var(--color-accent)]"
                        : "border-[rgba(59,58,57,0.12)] bg-white text-[var(--color-ink)] hover:border-[rgba(211,60,39,0.3)]"
                    }`}
                  >
                    <span className="block">{guide.visa}</span>
                    <span className="mt-1 block text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-muted)]">
                      {isSaved
                        ? isSpanish
                          ? "Guia principal"
                          : "Working track"
                        : isSpanish
                          ? "Vista previa"
                          : "Preview"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem] xl:items-start">
        <section className="grid gap-4">
          {isPreview ? (
            <div className="rounded-[1.5rem] border border-[rgba(211,60,39,0.22)] bg-[rgba(211,60,39,0.08)] px-5 py-4">
              <p className="dashboard-mini-kicker text-[var(--color-accent)]">
                {isSpanish ? "Vista previa" : "Preview only"}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-ink)]">
                {isSpanish
                  ? `Estas viendo la guía ${activeGuide.visa}. Los pasos completados solo se guardan en tu visa principal ${profileVisa}.`
                  : `You are viewing the ${activeGuide.visa} guide. Completed steps are only saved on your main ${profileVisa} track.`}
              </p>
            </div>
          ) : null}

          {lanes.map((lane) => (
            <section key={lane.phase} className="web-section-panel">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="web-kicker">{phaseLabels[lane.phase]}</p>
                  <h2 className="mt-2 text-3xl leading-tight font-display text-[var(--color-ink)]">
                    {phaseLabels[lane.phase]}
                  </h2>
                </div>
                <span className="dashboard-plan-count">
                  {lane.items.filter((task) => !task.isDone).length}/{lane.items.length}
                </span>
              </div>

              <div className="mt-6 grid gap-3">
                {lane.items.map((task) => {
                  const isExpanded = task.taskId === expandedTaskId;
                  const taskTitle = pickText(task.step, settings.language);
                  const taskDetails = pickText(task.details, settings.language);
                  const narration = `${taskTitle}. ${taskDetails}`;
                  const mapsUrl = task.mapsQuery ? buildGoogleMapsSearchUrl(task.mapsQuery, zipCode) : null;
                  const taskLinks = task.resources ?? [];

                  return (
                    <article
                      key={task.taskId}
                      className={`rounded-[1.5rem] border px-4 py-4 transition ${
                        task.isDone
                          ? "border-[rgba(31,122,90,0.28)] bg-[rgba(31,122,90,0.06)]"
                          : "border-[rgba(59,58,57,0.12)] bg-white"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
                            <span>{isSpanish ? `Paso ${task.index + 1}` : `Task ${task.index + 1}`}</span>
                            {task.timing ? (
                              <span className="rounded-full bg-[var(--color-accent-soft)] px-2.5 py-1 text-[10px] tracking-[0.16em] text-[var(--color-accent)]">
                                {pickText(task.timing, settings.language)}
                              </span>
                            ) : null}
                          </p>
                          <h3 className="mt-2 text-lg font-semibold leading-7 text-[var(--color-ink)]">
                            {taskTitle}
                          </h3>
                        </div>

                        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onToggleTask(task.taskId)}
                            aria-pressed={task.isDone}
                            disabled={isPreview}
                            className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                              isPreview
                                ? "cursor-not-allowed border-[rgba(59,58,57,0.12)] bg-[rgba(59,58,57,0.05)] text-[var(--color-muted)]"
                                : task.isDone
                                  ? "border-[var(--color-success)] bg-[var(--color-success)] text-white"
                                  : "border-[rgba(59,58,57,0.12)] bg-white text-[var(--color-ink)] hover:border-[var(--color-success)] hover:text-[var(--color-success)]"
                            }`}
                          >
                            <Check className="size-4" />
                            <span>
                              {isPreview
                                ? isSpanish
                                  ? "Solo vista previa"
                                  : "Preview only"
                                : task.isDone
                                  ? isSpanish
                                    ? "Hecho"
                                    : "Done"
                                  : isSpanish
                                    ? "Marcar hecho"
                                    : "Mark done"}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setManualExpandedTaskId(isExpanded ? null : task.taskId)}
                            aria-expanded={isExpanded}
                            aria-controls={`${task.taskId}-details`}
                            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[rgba(59,58,57,0.12)] bg-[var(--color-paper)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[rgba(211,60,39,0.3)]"
                          >
                            <span>{isExpanded ? (isSpanish ? "Cerrar" : "Collapse") : (isSpanish ? "Abrir" : "Expand")}</span>
                            <ChevronDown className={`size-4 transition ${isExpanded ? "rotate-180" : ""}`} />
                          </button>
                        </div>
                      </div>

                      {isExpanded ? (
                        <div id={`${task.taskId}-details`} className="mt-4 space-y-4">
                          <p className="text-sm leading-6 text-[var(--color-muted)]">{taskDetails}</p>

                          <div>
                            <p className="dashboard-mini-kicker">
                              {isSpanish ? "Lleva contigo" : "Bring with you"}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {task.docs.map((doc) => (
                                <span
                                  key={doc}
                                  className="inline-flex min-h-10 items-center rounded-full border border-[rgba(59,58,57,0.12)] bg-[var(--color-paper)] px-3 text-sm font-semibold text-[var(--color-ink)]"
                                >
                                  {doc}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {mapsUrl ? (
                              <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[rgba(59,58,57,0.12)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[rgba(211,60,39,0.3)] hover:text-[var(--color-accent)]"
                              >
                                <MapPin className="size-4" />
                                <span>{isSpanish ? "Buscar ubicacion cercana" : "Find nearby location"}</span>
                              </a>
                            ) : null}
                            {taskLinks.map((resource) => (
                              <a
                                key={`${resource.href}-${resource.label.en}`}
                                href={resource.href}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[rgba(59,58,57,0.12)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-accent)] transition hover:border-[rgba(211,60,39,0.3)]"
                              >
                                <ArrowUpRight className="size-4" />
                                <span>{pickText(resource.label, settings.language)}</span>
                              </a>
                            ))}
                          </div>

                          <ReadAloud text={narration} language={settings.language} />
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </section>

        <aside className="grid gap-4 xl:sticky xl:top-6">
          <WebsiteRailCard
            eyebrow={isSpanish ? "Tu configuracion" : "Your setup"}
            title={isSpanish ? "Perfil activo" : "Active setup"}
            description={
              isSpanish
                ? "Estos son los datos base usados para priorizar tu guia principal."
                : "These are the core details used to prioritize your working guide."
            }
          >
            <div className="grid gap-3">
              <div className="web-stat-row">
                <span>{isSpanish ? "Ubicacion" : "Location"}</span>
                <span className="text-right font-semibold text-[var(--color-ink)]">
                  {city}, {state}
                </span>
              </div>
              <div className="web-stat-row">
                <span>ZIP</span>
                <span className="text-right font-semibold text-[var(--color-ink)]">{zipCode}</span>
              </div>
              <div className="web-stat-row">
                <span>{isSpanish ? "Visa principal" : "Working visa"}</span>
                <span className="text-right font-semibold text-[var(--color-ink)]">{profileVisa}</span>
              </div>
              <div className="web-stat-row">
                <span>{isSpanish ? "Guia abierta" : "Viewing"}</span>
                <span className="text-right font-semibold text-[var(--color-ink)]">{activeGuide.visa}</span>
              </div>
              <div className="web-stat-row">
                <span>SSN</span>
                <span className="text-right font-semibold text-[var(--color-ink)]">
                  {hasSsn ? (isSpanish ? "Listo" : "Ready") : (isSpanish ? "Pendiente" : "Not yet")}
                </span>
              </div>
            </div>
          </WebsiteRailCard>

          <WebsiteRailCard
            eyebrow={isSpanish ? "Proximos documentos" : "Next documents"}
            title={isSpanish ? "Ten esto a mano" : "Keep these ready"}
            description={
              nextDocuments.length
                ? isSpanish
                  ? "Reunidos de tus proximos pasos pendientes."
                  : "Pulled from your next unfinished steps."
                : isSpanish
                  ? "Ya no hay documentos urgentes pendientes."
                  : "There are no urgent documents left to gather."
            }
          >
            {nextDocuments.length ? (
              <div className="flex flex-wrap gap-2">
                {nextDocuments.map((document) => (
                  <span
                    key={document}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[rgba(59,58,57,0.12)] bg-white px-3 text-sm font-semibold text-[var(--color-ink)]"
                  >
                    <FileText className="size-4 text-[var(--color-accent)]" />
                    <span>{document}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-6 text-[var(--color-muted)]">
                {isSpanish
                  ? "Completa la vista principal para que aparezcan nuevos documentos sugeridos."
                  : "Finish the working track to surface a new document list here."}
              </p>
            )}
          </WebsiteRailCard>

          <WebsiteRailCard
            eyebrow={isSpanish ? "Enlaces utiles" : "Helpful links"}
            title={isSpanish ? "Portales y ubicaciones" : "Portals and nearby locations"}
            description={
              isSpanish
                ? "Accesos rapidos a tramites, oficinas y recursos relacionados con esta guia."
                : "Fast access to forms, offices, and related resources for this guide."
            }
          >
            <div className="grid gap-3">
              {helpfulLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="dashboard-plan-row"
                >
                  <div className="flex items-start gap-3">
                    <span className="dashboard-plan-icon">
                      <ArrowUpRight className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--color-ink)]">{link.label}</p>
                      <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">{link.detail}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="mt-1 size-4 shrink-0 text-[var(--color-accent)]" />
                </a>
              ))}
            </div>
          </WebsiteRailCard>

          {activeGuide.addon ? (
            <WebsiteRailCard
              eyebrow={isSpanish ? "Evita retrasos" : "Avoid delays"}
              title={pickText(activeGuide.addon.title, settings.language)}
              description={
                isSpanish
                  ? "Notas de apoyo para no perder tiempo en tramites frecuentes."
                  : "Support notes to help you avoid common paperwork slowdowns."
              }
            >
              <div className="grid gap-3">
                {activeGuide.addon.items.map((item) => (
                  <div key={item.en} className="dashboard-help-note">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[var(--color-accent)]" />
                    <p className="text-sm leading-6 text-[var(--color-ink)]">
                      {pickText(item, settings.language)}
                    </p>
                  </div>
                ))}
              </div>
            </WebsiteRailCard>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
