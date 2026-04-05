"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowRight, RefreshCcw } from "lucide-react";

import { CoverageShield } from "@/components/decoder/CoverageShield";
import { DeductibleReality } from "@/components/decoder/DeductibleReality";
import { GapWarningCard } from "@/components/decoder/GapWarningCard";
import { PolicyHealthGauge } from "@/components/decoder/PolicyHealthGauge";
import { PolicySummaryHeader } from "@/components/decoder/PolicySummaryHeader";
import {
  formatDocumentSize,
  type DecoderSelectedDocument,
  UploadZone,
} from "@/components/decoder/UploadZone";
import { ScanningAnimation } from "@/components/decoder/ScanningAnimation";
import { useAccessibility } from "@/hooks/useAccessibility";
import { useAutoRead } from "@/hooks/useAutoRead";
import { useViewMode } from "@/hooks/useViewMode";
import type { DecoderAnalysisResponse } from "@/types/policy";

type DecodePhase = "upload" | "scanning" | "results";
const STATE_FARM_COVERAGE_URL = "https://www.statefarm.com/insurance";

export default function DecodePage() {
  const { settings } = useAccessibility();
  const { resolvedMode } = useViewMode();
  const isSpanish = settings.language === "es";
  const [phase, setPhase] = useState<DecodePhase>("upload");
  const [selectedDocument, setSelectedDocument] = useState<DecoderSelectedDocument | null>(null);
  const [analysis, setAnalysis] = useState<DecoderAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [scanVisualComplete, setScanVisualComplete] = useState(false);
  const isWebsite = resolvedMode === "website";
  const shouldFillViewport = isWebsite && phase !== "results";
  const uploadLayoutClass = isWebsite
    ? "mx-auto mt-2 grid w-full max-w-[72rem] gap-3 xl:grid-cols-[minmax(0,1.08fr)_minmax(23rem,0.92fr)] xl:items-center"
    : "mt-6";
  const primaryActionClass =
    "inline-flex min-h-[3.35rem] w-full items-center justify-center gap-2 rounded-full border border-[rgba(212,96,58,0.18)] bg-[#d4603a] px-5 text-sm font-semibold text-[#fff7ef] shadow-[0_14px_28px_rgba(212,96,58,0.24)] transition hover:-translate-y-px hover:bg-[#c95731] hover:shadow-[0_18px_34px_rgba(212,96,58,0.28)]";
  const secondaryActionClass =
    "inline-flex min-h-[3.35rem] w-full items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-white/80 px-5 text-sm font-semibold text-[var(--color-ink)] shadow-[0_10px_22px_rgba(17,24,39,0.06)] transition hover:-translate-y-px hover:bg-white";

  const narration = useMemo(() => {
    if (!analysis) {
      return "";
    }

    const firstGap = analysis.gaps[0]?.scenario ?? "";

    return [
      analysis.provider,
      isSpanish
        ? `Puntaje de salud ${analysis.healthScore} de 100.`
        : `Policy health score ${analysis.healthScore} out of 100.`,
      firstGap,
    ].join(" ");
  }, [analysis, isSpanish]);

  useAutoRead(narration);

  useEffect(() => {
    return () => {
      if (selectedDocument?.file && selectedDocument.previewSrc.startsWith("blob:")) {
        URL.revokeObjectURL(selectedDocument.previewSrc);
      }
    };
  }, [selectedDocument]);

  useEffect(() => {
    if (phase === "scanning" && analysis && scanVisualComplete) {
      setPhase("results");
    }
  }, [analysis, phase, scanVisualComplete]);

  function resetDecoder() {
    setPhase("upload");
    setAnalysis(null);
    setError(null);
    setProgress(0);
    setScanVisualComplete(false);
    setSelectedDocument((current) => {
      if (current?.file && current.previewSrc.startsWith("blob:")) {
        URL.revokeObjectURL(current.previewSrc);
      }

      return null;
    });
  }

  function handleResetKeepSelection() {
    setPhase("upload");
    setAnalysis(null);
    setError(null);
    setProgress(0);
    setScanVisualComplete(false);
  }

  function handleFileSelected(file: File) {
    setSelectedDocument((current) => {
      if (current?.file && current.previewSrc.startsWith("blob:")) {
        URL.revokeObjectURL(current.previewSrc);
      }

      return {
        file,
        kind: file.type.startsWith("image/") ? "image" : "pdf",
        name: file.name,
        sizeLabel: formatDocumentSize(file.size, settings.language),
        previewSrc: URL.createObjectURL(file),
      };
    });
    handleResetKeepSelection();
  }

  function handleUseSample() {
    setSelectedDocument((current) => {
      if (current?.file && current.previewSrc.startsWith("blob:")) {
        URL.revokeObjectURL(current.previewSrc);
      }

      return {
        file: null,
        kind: "pdf",
        name: "sample-policy.pdf",
        sizeLabel: isSpanish ? "Documento demo" : "Demo document",
        previewSrc: "/sample-policy.pdf",
        isSample: true,
      };
    });
    handleResetKeepSelection();
  }

  async function handleAnalyze() {
    if (!selectedDocument) {
      return;
    }

    setPhase("scanning");
    setProgress(settings.reducedMotion ? 100 : 4);
    setScanVisualComplete(false);
    setError(null);
    setAnalysis(null);

    const formData = new FormData();
    formData.append("language", settings.language);

    if (selectedDocument.file) {
      formData.append("file", selectedDocument.file);
    } else {
      formData.append("demo", "true");
    }

    let progressTimer: number | null = null;

    if (!settings.reducedMotion) {
      progressTimer = window.setInterval(() => {
        setProgress((current) => (current >= 94 ? current : current + Math.max(1, (96 - current) / 10)));
      }, 120);
    }

    try {
      const response = await fetch("/api/decode", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(isSpanish ? "La decodificacion fallo" : "Decode failed");
      }

      const payload = (await response.json()) as DecoderAnalysisResponse;
      setAnalysis(payload);
      setProgress(100);

      if (settings.reducedMotion) {
        setScanVisualComplete(true);
      }
    } catch (submissionError) {
      setPhase("upload");
      setProgress(0);
      setScanVisualComplete(false);
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : isSpanish
            ? "No pudimos analizar la poliza."
            : "We could not analyze the policy.",
      );
    } finally {
      if (progressTimer) {
        window.clearInterval(progressTimer);
      }
    }
  }

  function goToStateFarmCoverage() {
    window.location.assign(STATE_FARM_COVERAGE_URL);
  }

  const websiteResultsLayout = phase === "results" && analysis && isWebsite;
  const appResultsLayout = phase === "results" && analysis && !isWebsite;

  return (
    <div
      className={`${shouldFillViewport ? "website-centered-intake min-h-full" : ""} py-3 lg:py-4 ${
        isWebsite ? "mx-auto max-w-[72rem] lg:-mt-2" : ""
      } ${
        shouldFillViewport ? "flex flex-1 flex-col justify-center" : ""
      }`}
    >
      {phase === "upload" ? (
        <div className={uploadLayoutClass}>
          <section className="panel-blend hero-ambient overflow-hidden xl:mt-0 xl:flex xl:min-h-[25.5rem] xl:flex-col xl:justify-between xl:px-7 xl:py-6">
            <div>
              <p className="eyebrow">{isSpanish ? "Decodificador visual de polizas" : "Visual policy decoder"}</p>
              <h1 className="mt-2 max-w-[15ch] font-display text-[clamp(2.7rem,4.1vw,4.2rem)] leading-[0.9] text-[var(--color-ink)]">
                {isSpanish
                  ? "Sube una poliza. Mira la salud real de esa cobertura."
                  : "Upload a policy. See the real health of that coverage."}
              </h1>
              <p className="mt-3 max-w-[34rem] text-[0.96rem] leading-relaxed text-[var(--color-muted)] xl:max-w-[32rem]">
                {isSpanish
                  ? "La pagina convierte PDFs y fotos en un puntaje, un escudo de cobertura, comparaciones del deducible y alertas concretas de riesgo."
                  : "This page turns PDFs and photos into a policy score, a coverage shield, deductible comparisons, and concrete gap alerts."}
              </p>
            </div>

            <div className="mt-4 grid gap-2.5 text-sm text-[var(--color-muted)] sm:grid-cols-3 xl:mt-5 xl:grid-cols-3 xl:gap-2.5">
              <div className="rounded-[1.2rem] border border-[var(--color-border)] bg-white/72 px-3.5 py-3">
                <p className="font-semibold text-[var(--color-ink)]">
                  {isSpanish ? "Puntaje rapido" : "Fast policy score"}
                </p>
                <p className="mt-1">
                  {isSpanish ? "Lee limites y deducible en segundos." : "See limits and deductible in seconds."}
                </p>
              </div>
              <div className="rounded-[1.2rem] border border-[var(--color-border)] bg-white/72 px-3.5 py-3">
                <p className="font-semibold text-[var(--color-ink)]">
                  {isSpanish ? "Brechas claras" : "Clear gap flags"}
                </p>
                <p className="mt-1">
                  {isSpanish ? "Detecta donde la cobertura se queda corta." : "Spot where coverage falls short."}
                </p>
              </div>
              <div className="rounded-[1.2rem] border border-[var(--color-border)] bg-white/72 px-3.5 py-3">
                <p className="font-semibold text-[var(--color-ink)]">
                  {isSpanish ? "Listo para comparar" : "Ready to compare"}
                </p>
                <p className="mt-1">
                  {isSpanish ? "Usa una foto, PDF o demo." : "Use a photo, PDF, or demo file."}
                </p>
              </div>
            </div>
          </section>

          <UploadZone
            selectedDocument={selectedDocument}
            onFileSelected={handleFileSelected}
            onAnalyze={handleAnalyze}
            onReset={resetDecoder}
            onUseSample={handleUseSample}
            compact={isWebsite}
          />
          {error ? (
            <p className="xl:col-start-2 xl:mx-0 mx-auto mt-4 max-w-[34rem] text-center text-sm text-[var(--color-danger)] xl:mt-0 xl:text-left">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}

      {phase === "scanning" && selectedDocument ? (
        <div className="mt-6">
          <ScanningAnimation
            documentSrc={selectedDocument.previewSrc}
            documentKind={selectedDocument.kind}
            documentName={selectedDocument.name}
            isScanning
            progress={Math.round(progress)}
            onComplete={() => {
              startTransition(() => {
                setScanVisualComplete(true);
              });
            }}
          />
        </div>
      ) : null}

      {websiteResultsLayout ? (
        <div className="mt-6 grid gap-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(280px,0.76fr)_minmax(0,1.24fr)]">
            <StaggeredFadeIn delay={0} immediate={settings.reducedMotion}>
              <PolicyHealthGauge score={analysis.healthScore} layout="website" />
            </StaggeredFadeIn>

            <StaggeredFadeIn delay={180} immediate={settings.reducedMotion}>
              <PolicySummaryHeader analysis={analysis} layout="website" />
            </StaggeredFadeIn>
          </div>

          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.72fr)]">
            <div className="grid min-w-0 gap-6">
              <StaggeredFadeIn delay={360} immediate={settings.reducedMotion}>
                <CoverageShield
                  analysis={analysis}
                  onFixGap={goToStateFarmCoverage}
                  layout="website"
                />
              </StaggeredFadeIn>

              <StaggeredFadeIn delay={540} immediate={settings.reducedMotion}>
                <DeductibleReality
                  amount={analysis.deductible.amount}
                  comparisons={analysis.deductible.comparisons}
                  layout="website"
                />
              </StaggeredFadeIn>
            </div>

            <div className="grid gap-4 xl:sticky xl:top-28">
              {analysis.gaps.map((gap, index) => (
                <StaggeredFadeIn
                  key={`${gap.title}-${index}`}
                  delay={720 + index * 160}
                  immediate={settings.reducedMotion}
                >
                  <GapWarningCard
                    gap={gap}
                    onFixGap={goToStateFarmCoverage}
                  />
                </StaggeredFadeIn>
              ))}

              <StaggeredFadeIn
                delay={720 + analysis.gaps.length * 160}
                immediate={settings.reducedMotion}
              >
                <section className="panel-card w-full">
                  <p className="eyebrow">{isSpanish ? "Siguiente movimiento" : "Next move"}</p>
                  <h2 className="mt-2 font-display text-[2rem] leading-tight text-[var(--color-ink)]">
                    {isSpanish ? "Compara esta poliza con una cobertura mejor." : "Compare this policy against better coverage."}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                    {isSpanish
                      ? "Sube otra poliza o salta directo a State Farm para revisar una opcion mas fuerte."
                      : "Upload another policy or jump straight to State Farm to review a stronger option."}
                  </p>

                  <div className="mt-5 grid gap-3">
                    <button
                      type="button"
                      onClick={resetDecoder}
                      className={secondaryActionClass}
                    >
                      <RefreshCcw className="size-4" />
                      {isSpanish ? "Subir otra poliza" : "Upload another policy"}
                    </button>
                    <Link href={STATE_FARM_COVERAGE_URL} className={primaryActionClass}>
                      {isSpanish ? "Conseguir mejor cobertura" : "Get better coverage"}
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </section>
              </StaggeredFadeIn>
            </div>
          </div>
        </div>
      ) : null}

      {appResultsLayout ? (
        <div className="mt-6 grid gap-5">
          <StaggeredFadeIn delay={0} immediate={settings.reducedMotion}>
            <PolicyHealthGauge score={analysis.healthScore} />
          </StaggeredFadeIn>

          <StaggeredFadeIn delay={300} immediate={settings.reducedMotion}>
            <PolicySummaryHeader analysis={analysis} />
          </StaggeredFadeIn>

          <StaggeredFadeIn delay={600} immediate={settings.reducedMotion}>
            <CoverageShield
              analysis={analysis}
              onFixGap={goToStateFarmCoverage}
            />
          </StaggeredFadeIn>

          <StaggeredFadeIn delay={900} immediate={settings.reducedMotion}>
            <DeductibleReality
              amount={analysis.deductible.amount}
              comparisons={analysis.deductible.comparisons}
            />
          </StaggeredFadeIn>

          <div className="grid gap-4">
            {analysis.gaps.map((gap, index) => (
              <StaggeredFadeIn
                key={`${gap.title}-${index}`}
                delay={1200 + index * 200}
                immediate={settings.reducedMotion}
              >
                <GapWarningCard
                  gap={gap}
                  onFixGap={goToStateFarmCoverage}
                />
              </StaggeredFadeIn>
            ))}
          </div>

          <StaggeredFadeIn delay={1600} immediate={settings.reducedMotion}>
            <section className="panel-card mx-auto w-full max-w-[36rem]">
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={resetDecoder}
                  className={secondaryActionClass}
                >
                  <RefreshCcw className="size-4" />
                  {isSpanish ? "Subir otra poliza" : "Upload another policy"}
                </button>
                <Link href={STATE_FARM_COVERAGE_URL} className={primaryActionClass}>
                  {isSpanish ? "Conseguir mejor cobertura" : "Get better coverage"}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </section>
          </StaggeredFadeIn>
        </div>
      ) : null}
    </div>
  );
}

function StaggeredFadeIn({
  delay,
  immediate = false,
  children,
}: {
  delay: number;
  immediate?: boolean;
  children: ReactNode;
}) {
  const [visible, setVisible] = useState(immediate);

  useEffect(() => {
    if (immediate) {
      return;
    }

    const timer = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(timer);
  }, [delay, immediate]);

  return (
    <div
      className={`transition-all duration-500 ${
        immediate || visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}
