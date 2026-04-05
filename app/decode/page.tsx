"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function DecodePage() {
  const router = useRouter();
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

  return (
    <div className={`py-6 lg:py-10 ${isWebsite ? "mx-auto max-w-[68rem]" : ""}`}>
      <section className="panel-card hero-ambient overflow-hidden">
        <p className="eyebrow">{isSpanish ? "Decodificador visual de polizas" : "Visual policy decoder"}</p>
        <h1 className="mt-2 font-display text-4xl leading-[0.96] text-[var(--color-ink)] sm:text-5xl lg:text-6xl">
          {isSpanish
            ? "Sube una poliza. Mira la salud real de esa cobertura."
            : "Upload a policy. See the real health of that coverage."}
        </h1>
        <p className="mt-4 max-w-[38rem] text-base text-[var(--color-muted)]">
          {isSpanish
            ? "La pagina convierte PDFs y fotos en un puntaje, un escudo de cobertura, comparaciones del deducible y alertas concretas de riesgo."
            : "This page turns PDFs and photos into a policy score, a coverage shield, deductible comparisons, and concrete gap alerts."}
        </p>
      </section>

      {phase === "upload" ? (
        <div className="mt-6">
          <UploadZone
            selectedDocument={selectedDocument}
            onFileSelected={handleFileSelected}
            onAnalyze={handleAnalyze}
            onReset={resetDecoder}
            onUseSample={handleUseSample}
          />
          {error ? (
            <p className="mx-auto mt-4 max-w-[34rem] text-center text-sm text-[var(--color-danger)]">
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

      {phase === "results" && analysis ? (
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
              onFixGap={() => {
                router.push("/coverage");
              }}
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
                  onFixGap={() => {
                    router.push("/coverage");
                  }}
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
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-5 text-sm font-semibold text-[var(--color-ink)]"
                >
                  <RefreshCcw className="size-4" />
                  {isSpanish ? "Subir otra poliza" : "Upload another policy"}
                </button>
                <Link
                  href="/coverage"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] px-5 text-sm font-semibold text-[var(--color-paper)]"
                >
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
