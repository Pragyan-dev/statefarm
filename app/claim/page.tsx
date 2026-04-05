"use client";

import {
  startTransition,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ArrowRight, RefreshCcw } from "lucide-react";

import claimVideos from "@/data/claim-videos.json";
import { ReadAloud } from "@/components/ReadAloud";
import { ClaimStatusTracker } from "@/components/claim/ClaimStatusTracker";
import { ClaimTimeline } from "@/components/claim/ClaimTimeline";
import { ClaimVideoSection } from "@/components/claim/ClaimVideoSection";
import { DocumentChecklist } from "@/components/claim/DocumentChecklist";
import { DosDontsCards } from "@/components/claim/DosDontsCards";
import { EvidenceCollector } from "@/components/claim/EvidenceCollector";
import { IncidentSelector } from "@/components/claim/IncidentSelector";
import { QuickActions } from "@/components/claim/QuickActions";
import { UrgencyBanner } from "@/components/claim/UrgencyBanner";
import { VoiceInputBar } from "@/components/claim/VoiceInputBar";
import { useAccessibility } from "@/hooks/useAccessibility";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useViewMode } from "@/hooks/useViewMode";
import {
  CLAIM_PROGRESS_STORAGE_KEY,
  getClaimGuide,
  getIncidentCategories,
  getInitialClaimProgressStore,
} from "@/lib/claimContent";
import { SafiCharacter } from "@/components/simulator/SafiCharacter";
import type { Language } from "@/lib/types";
import type {
  ClaimGuidePersonalization,
  ClaimProgressState,
  IncidentType,
} from "@/types/claim";

type ClaimPhase = "select" | "loading" | "guide";
type ClaimProgressStore = Record<IncidentType, ClaimProgressState>;
type EvidencePreviewStore = Partial<Record<IncidentType, Record<string, string>>>;

interface ClaimVideosData {
  statefarmLinks: {
    fileClaim: string;
    autoClaims: string;
    homeClaims: string;
    phone: string;
    appIos: string;
    appAndroid: string;
  };
}

export default function ClaimPage() {
  const { settings } = useAccessibility();
  const { resolvedMode } = useViewMode();
  const isSpanish = settings.language === "es";
  const isAppMode = resolvedMode === "app";
  const categories = useMemo(() => getIncidentCategories(settings.language), [settings.language]);
  const claimVideosData = useMemo(() => claimVideos as ClaimVideosData, []);
  const [phase, setPhase] = useState<ClaimPhase>("select");
  const [selectedIncident, setSelectedIncident] = useState<IncidentType | null>(null);
  const [description, setDescription] = useState("");
  const [guideIncident, setGuideIncident] = useState<IncidentType | null>(null);
  const [personalization, setPersonalization] = useState<ClaimGuidePersonalization | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [progressStore, setProgressStore] = useLocalStorage<ClaimProgressStore>(
    CLAIM_PROGRESS_STORAGE_KEY,
    getInitialClaimProgressStore(),
  );
  const [evidencePreviews, setEvidencePreviews] = useState<EvidencePreviewStore>({});
  const evidencePreviewsRef = useRef<EvidencePreviewStore>({});
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    evidencePreviewsRef.current = evidencePreviews;
  }, [evidencePreviews]);

  useEffect(() => {
    return () => {
      Object.values(evidencePreviewsRef.current).forEach((incidentPreviews) => {
        Object.values(incidentPreviews ?? {}).forEach((url) => URL.revokeObjectURL(url));
      });
    };
  }, []);

  const guide = useMemo(() => {
    if (!guideIncident) {
      return null;
    }

    return getClaimGuide(
      guideIncident,
      settings.language,
      progressStore[guideIncident],
      personalization,
    );
  }, [guideIncident, personalization, progressStore, settings.language]);

  const categoryLabels = useMemo(
    () => new Map(categories.map((category) => [category.type, category.label])),
    [categories],
  );

  async function buildGuide() {
    if (!selectedIncident && !description.trim()) {
      return;
    }

    setSubmitError(null);
    setPhase("loading");
    startTimeRef.current = Date.now();

    let nextIncident = selectedIncident;
    let nextPersonalization: ClaimGuidePersonalization | null = null;

    if (!selectedIncident) {
      try {
        const response = await fetch("/api/claim", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description,
            language: settings.language,
          }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(
            payload?.error ||
              (isSpanish
                ? "No pudimos clasificar el incidente."
                : "We could not classify the incident."),
          );
        }

        nextPersonalization = (await response.json()) as ClaimGuidePersonalization;
        nextIncident = nextPersonalization.incidentType;
      } catch (error) {
        nextPersonalization = buildClientFallbackPersonalization({
          description,
          language: settings.language,
          fallbackReason: error instanceof Error ? error.message : "Claim route failed",
        });
        nextIncident = nextPersonalization.incidentType;
      }
    }

    const elapsed = Date.now() - startTimeRef.current;
    if (elapsed < 1200) {
      await new Promise((resolve) => window.setTimeout(resolve, 1200 - elapsed));
    }

    startTransition(() => {
      setGuideIncident(nextIncident ?? "other");
      setPersonalization(nextPersonalization);
      setPhase("guide");
    });
  }

  function clearIncidentProgress(incidentType: IncidentType) {
    setProgressStore((current) => ({
      ...current,
      [incidentType]: getInitialClaimProgressStore()[incidentType],
    }));

    setEvidencePreviews((current) => {
      const incidentPreviews = current[incidentType];
      Object.values(incidentPreviews ?? {}).forEach((url) => URL.revokeObjectURL(url));

      return {
        ...current,
        [incidentType]: {},
      };
    });
  }

  function resetGuideFlow() {
    if (guideIncident) {
      clearIncidentProgress(guideIncident);
    }

    setPhase("select");
    setSelectedIncident(null);
    setGuideIncident(null);
    setPersonalization(null);
    setDescription("");
    setSubmitError(null);
  }

  function updateIncidentProgress(
    incidentType: IncidentType,
    updater: (current: ClaimProgressState) => ClaimProgressState,
  ) {
    setProgressStore((current) => {
      const fallback = getInitialClaimProgressStore()[incidentType];
      return {
        ...current,
        [incidentType]: updater(current[incidentType] ?? fallback),
      };
    });
  }

  function handleCompleteStep(stepId: string) {
    if (!guideIncident) {
      return;
    }

    updateIncidentProgress(guideIncident, (current) => ({
      ...current,
      completedStepIds: current.completedStepIds.includes(stepId)
        ? current.completedStepIds
        : [...current.completedStepIds, stepId],
    }));
  }

  function handleToggleDocument(documentId: string) {
    if (!guideIncident) {
      return;
    }

    updateIncidentProgress(guideIncident, (current) => ({
      ...current,
      collectedDocumentIds: current.collectedDocumentIds.includes(documentId)
        ? current.collectedDocumentIds.filter((id) => id !== documentId)
        : [...current.collectedDocumentIds, documentId],
    }));
  }

  function handleCaptureEvidence(itemId: string, file: File) {
    if (!guideIncident) {
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    setEvidencePreviews((current) => {
      const incidentPreviews = current[guideIncident] ?? {};
      const previousUrl = incidentPreviews[itemId];

      if (previousUrl) {
        URL.revokeObjectURL(previousUrl);
      }

      return {
        ...current,
        [guideIncident]: {
          ...incidentPreviews,
          [itemId]: nextUrl,
        },
      };
    });

    updateIncidentProgress(guideIncident, (current) => ({
      ...current,
      capturedEvidenceIds: current.capturedEvidenceIds.includes(itemId)
        ? current.capturedEvidenceIds
        : [...current.capturedEvidenceIds, itemId],
    }));
  }

  const canBuildGuide = Boolean(selectedIncident || description.trim());
  const useCompactIntakeLayout = resolvedMode === "website";
  const shouldFillViewport = useCompactIntakeLayout && phase !== "guide";
  const selectedLabel =
    (selectedIncident ? categoryLabels.get(selectedIncident) : undefined) ??
    (guideIncident ? categoryLabels.get(guideIncident) : undefined) ??
    (guideIncident
      ? isSpanish
        ? guideIncident === "medical_emergency"
          ? "Emergencia medica"
          : "Otro incidente"
        : guideIncident === "medical_emergency"
          ? "Medical emergency"
          : "Other incident"
      : undefined) ??
    (isSpanish ? "Incidente" : "Incident");
  const guideNarration = useMemo(() => {
    if (!guide) {
      return "";
    }

    const parts = [
      selectedLabel,
      guide.urgencyMessage,
      guide.steps.slice(0, 4).map((step) => `${step.title}. ${step.description}`).join(" "),
      personalization?.personalizedTips?.slice(0, 2).join(" ") ?? "",
      guide.donts[0]?.text ?? "",
      guide.donts[0]?.explanation ?? "",
    ];

    return parts.filter(Boolean).join(" ").trim();
  }, [guide, personalization, selectedLabel]);

  return (
    <div
      className={`${
        phase === "select" && useCompactIntakeLayout ? "py-4 lg:py-5" : "py-6 lg:py-10"
      } ${phase === "guide" && isAppMode ? "pb-28" : ""} ${
        shouldFillViewport ? "flex flex-1 flex-col justify-center" : ""
      }`}
    >
      {phase === "select" ? (
        <div className={`mx-auto ${useCompactIntakeLayout ? "max-w-[72rem]" : "grid max-w-[56rem] gap-5"}`}>
          {useCompactIntakeLayout ? (
            <section className="panel-card hero-ambient overflow-hidden">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(21rem,0.92fr)] lg:gap-5">
                <IncidentSelector
                  categories={categories}
                  selectedType={selectedIncident}
                  onSelect={setSelectedIncident}
                  compact
                  embedded
                />

                <div className="flex flex-col gap-4 lg:pt-1">
                  <VoiceInputBar value={description} onChange={setDescription} compact embedded />

                  <section className="rounded-[1.45rem] border border-[var(--color-border)] bg-[var(--color-paper)]/85 p-4 shadow-[0_12px_24px_rgba(17,24,39,0.06)]">
                    <div className="flex flex-col gap-3">
                      <div className="rounded-[1rem] border border-[var(--color-border)] bg-white/75 px-3.5 py-3 text-sm leading-6 text-[var(--color-muted)]">
                        {selectedIncident
                          ? isSpanish
                            ? `Seleccionado: ${selectedLabel}`
                            : `Selected: ${selectedLabel}`
                          : isSpanish
                            ? "Puedes elegir una categoria o solo describirlo."
                            : "You can choose a category or just describe it."}
                      </div>

                      <button
                        type="button"
                        onClick={() => void buildGuide()}
                        disabled={!canBuildGuide}
                        className="inline-flex min-h-[3.2rem] w-full items-center justify-center gap-2 rounded-full border border-[rgba(212,96,58,0.18)] bg-[#d4603a] px-5 text-sm font-semibold text-[#fff7ef] shadow-[0_14px_28px_rgba(212,96,58,0.24)] transition hover:-translate-y-px hover:bg-[#c95731] hover:shadow-[0_18px_34px_rgba(212,96,58,0.28)] disabled:cursor-not-allowed disabled:opacity-55"
                      >
                        {isSpanish ? "Crear mi guia" : "Build my guide"}
                        <ArrowRight className="size-4" />
                      </button>
                    </div>

                    {submitError ? (
                      <p className="mt-3 text-sm text-[var(--color-danger)]">{submitError}</p>
                    ) : null}
                  </section>
                </div>
              </div>
            </section>
          ) : (
            <>
              <IncidentSelector
                categories={categories}
                selectedType={selectedIncident}
                onSelect={setSelectedIncident}
              />

              <VoiceInputBar value={description} onChange={setDescription} />

              <section className="panel-card mx-auto w-full max-w-[34rem]">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => void buildGuide()}
                    disabled={!canBuildGuide}
                    className="inline-flex min-h-[3.35rem] flex-1 items-center justify-center gap-2 rounded-full border border-[rgba(212,96,58,0.18)] bg-[#d4603a] px-5 text-sm font-semibold text-[#fff7ef] shadow-[0_14px_28px_rgba(212,96,58,0.24)] transition hover:-translate-y-px hover:bg-[#c95731] hover:shadow-[0_18px_34px_rgba(212,96,58,0.28)] disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    {isSpanish ? "Crear mi guia" : "Build my guide"}
                    <ArrowRight className="size-4" />
                  </button>

                  <div className="rounded-full border border-[var(--color-border)] bg-white/75 px-4 py-3 text-sm text-[var(--color-muted)]">
                    {selectedIncident
                      ? isSpanish
                        ? `Seleccionado: ${selectedLabel}`
                        : `Selected: ${selectedLabel}`
                      : isSpanish
                        ? "Puedes elegir una categoria o solo describirlo."
                        : "You can choose a category or just describe it."}
                  </div>
                </div>

                {submitError ? (
                  <p className="mt-3 text-sm text-[var(--color-danger)]">{submitError}</p>
                ) : null}
              </section>
            </>
          )}
        </div>
      ) : null}

      {phase === "loading" ? (
        <section className="panel-card mx-auto flex max-w-[34rem] flex-col items-center gap-5 px-6 py-10 text-center">
          <div className="h-32 w-32">
            <SafiCharacter emotion="worried" />
          </div>
          <div className="space-y-3">
            <p className="eyebrow">{isSpanish ? "Construyendo la guia" : "Building your guide"}</p>
            <h2 className="font-display text-4xl leading-[0.98] text-[var(--color-ink)]">
              {isSpanish ? "No te preocupes. Voy contigo." : "Don't worry. I’ll walk with you."}
            </h2>
            <p className="text-base leading-relaxed text-[var(--color-muted)]">
              {isSpanish
                ? "Estamos ordenando los pasos, las pruebas y los documentos que mas importan ahora."
                : "We’re organizing the steps, evidence, and documents that matter most right now."}
            </p>
          </div>
        </section>
      ) : null}

      {phase === "guide" && guide ? (
        <div className={`mx-auto grid gap-5 ${resolvedMode === "website" ? "max-w-[58rem]" : ""}`}>
          <section className="panel-card hero-ambient overflow-hidden">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-[40rem]">
                <p className="eyebrow">
                  {isSpanish ? "Guia visual de reclamo" : "Visual claim guide"}
                </p>
                <h1 className="mt-2 font-display text-4xl leading-[0.98] text-[var(--color-ink)] sm:text-5xl">
                  {selectedLabel}
                </h1>
                <p className="mt-3 text-base leading-relaxed text-[var(--color-muted)]">
                  {isSpanish
                    ? "Sigue este recorrido calmado y visual. Todo esta ordenado para ayudarte a actuar sin perder pasos."
                    : "Follow this calm, visual guide. Everything is ordered so you can act without missing steps."}
                </p>
                <div className="mt-4">
                  <ReadAloud text={guideNarration} language={settings.language} />
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-3 self-start">
                <button
                  type="button"
                  onClick={resetGuideFlow}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-white/80 px-4 text-sm font-semibold text-[var(--color-ink)] shadow-[0_10px_22px_rgba(17,24,39,0.06)] transition hover:-translate-y-px"
                >
                  <RefreshCcw className="size-4" />
                  {isSpanish ? "Empezar de nuevo" : "Start over"}
                </button>
              </div>
            </div>
          </section>

          <RevealOnScroll delay={0} reducedMotion={settings.reducedMotion}>
            <UrgencyBanner level={guide.urgencyLevel} message={guide.urgencyMessage} />
          </RevealOnScroll>

          <RevealOnScroll delay={80} reducedMotion={settings.reducedMotion}>
            <ClaimStatusTracker
              steps={guide.steps}
              documents={guide.documents}
              estimatedTimeline={guide.estimatedTimeline}
            />
          </RevealOnScroll>

          {personalization?.personalizedTips?.length ? (
            <RevealOnScroll delay={120} reducedMotion={settings.reducedMotion}>
              <section className="panel-card">
                <p className="eyebrow">
                  {isSpanish ? "Consejos personalizados" : "Personalized tips"}
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {personalization.personalizedTips.map((tip, index) => (
                    <article
                      key={`${tip}-${index}`}
                      className="rounded-[1.3rem] border border-[var(--color-border)] bg-white/70 p-4"
                    >
                      <p className="text-sm font-semibold text-[var(--color-ink)]">
                        {tip}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            </RevealOnScroll>
          ) : null}

          <RevealOnScroll delay={160} reducedMotion={settings.reducedMotion}>
            <ClaimTimeline steps={guide.steps} onCompleteStep={handleCompleteStep} />
          </RevealOnScroll>

          <RevealOnScroll delay={220} reducedMotion={settings.reducedMotion}>
            <EvidenceCollector
              items={guide.evidence}
              imageUrls={evidencePreviews[guide.incidentType] ?? {}}
              onCapture={handleCaptureEvidence}
            />
          </RevealOnScroll>

          <RevealOnScroll delay={300} reducedMotion={settings.reducedMotion}>
            <DosDontsCards dos={guide.dos} donts={guide.donts} />
          </RevealOnScroll>

          <RevealOnScroll delay={360} reducedMotion={settings.reducedMotion}>
            <ClaimVideoSection />
          </RevealOnScroll>

          <RevealOnScroll delay={440} reducedMotion={settings.reducedMotion}>
            <DocumentChecklist items={guide.documents} onToggle={handleToggleDocument} />
          </RevealOnScroll>

          <RevealOnScroll delay={520} reducedMotion={settings.reducedMotion}>
            <QuickActions
              phone={guide.stateFarmPhone}
              claimUrl={guide.stateFarmClaimUrl}
              iosUrl={claimVideosData.statefarmLinks.appIos}
              androidUrl={claimVideosData.statefarmLinks.appAndroid}
              sticky={isAppMode}
            />
          </RevealOnScroll>
        </div>
      ) : null}
    </div>
  );
}

function RevealOnScroll({
  children,
  delay = 0,
  reducedMotion,
}: {
  children: ReactNode;
  delay?: number;
  reducedMotion: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion || !ref.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <div
      ref={ref}
      style={reducedMotion ? undefined : { transitionDelay: `${delay}ms` }}
      className={`transition-all duration-500 ${
        reducedMotion || visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}

function buildClientFallbackPersonalization({
  description,
  language,
  fallbackReason,
}: {
  description: string;
  language: Language;
  fallbackReason?: string;
}): ClaimGuidePersonalization {
  const lower = description.toLowerCase();
  const incidentType = detectIncidentType(lower);
  const urgency =
    incidentType === "car_accident" ||
    incidentType === "apartment_flood" ||
    incidentType === "fire" ||
    incidentType === "medical_emergency"
      ? "immediate"
      : incidentType === "theft" || incidentType === "weather_damage"
        ? "within_24h"
        : "within_week";

  return {
    incidentType,
    urgency,
    urgencyMessage:
      language === "es"
        ? "No perdamos tiempo. Empecemos por lo mas importante."
        : "Let’s not lose time. Start with the most important steps first.",
    personalizedTips:
      language === "es"
        ? [
            "Haz una lista corta de hechos: que paso, cuando, donde y quien estaba ahi.",
            "Toma fotos antes de mover o limpiar algo importante.",
          ]
        : [
            "Write a short facts list: what happened, when, where, and who was there.",
            "Take photos before you move or clean anything important.",
          ],
    estimatedTimeline:
      language === "es"
        ? incidentType === "car_accident"
          ? "2 a 4 semanas"
          : "1 a 3 semanas"
        : incidentType === "car_accident"
          ? "2 to 4 weeks"
          : "1 to 3 weeks",
    aiSource: "local",
    demoMode: false,
    fallbackReason,
  };
}

function detectIncidentType(lower: string): IncidentType {
  if (/\b(car|auto|vehicle|collision|crash|rear[- ]?end|hit)\b/.test(lower)) {
    return "car_accident";
  }

  if (/\b(flood|flooded|water damage|burst|pipe|leak|ceiling)\b/.test(lower)) {
    return "apartment_flood";
  }

  if (/\b(theft|stolen|break[- ]?in|burglar|robbed)\b/.test(lower)) {
    return "theft";
  }

  if (/\b(fire|smoke|burn)\b/.test(lower)) {
    return "fire";
  }

  if (/\b(storm|weather|hail|wind|lightning)\b/.test(lower)) {
    return "weather_damage";
  }

  if (/\b(hospital|doctor|injury|ambulance|medical|er)\b/.test(lower)) {
    return "medical_emergency";
  }

  return "other";
}
