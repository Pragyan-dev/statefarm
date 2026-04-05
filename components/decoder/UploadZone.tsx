"use client";

import { useRef, useState } from "react";
import { Camera, FileText, ImageUp, RefreshCcw, Upload } from "lucide-react";

import { DocumentPreview } from "@/components/decoder/DocumentPreview";
import { useAccessibility } from "@/hooks/useAccessibility";

export interface DecoderSelectedDocument {
  file: File | null;
  kind: "image" | "pdf";
  name: string;
  sizeLabel: string;
  previewSrc: string;
  isSample?: boolean;
}

export function UploadZone({
  selectedDocument,
  onFileSelected,
  onAnalyze,
  onReset,
  onUseSample,
  disabled = false,
  compact = false,
}: {
  selectedDocument: DecoderSelectedDocument | null;
  onFileSelected: (file: File) => void;
  onAnalyze: () => void;
  onReset: () => void;
  onUseSample: () => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";
  const [dragActive, setDragActive] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const primaryActionClass =
    "inline-flex min-h-[3.35rem] w-full items-center justify-center gap-2 rounded-full border border-[rgba(212,96,58,0.18)] bg-[#d4603a] px-5 text-sm font-semibold text-[#fff7ef] shadow-[0_14px_28px_rgba(212,96,58,0.24)] transition hover:-translate-y-px hover:bg-[#c95731] hover:shadow-[0_18px_34px_rgba(212,96,58,0.28)] disabled:cursor-not-allowed disabled:opacity-60";
  const secondaryActionClass =
    "inline-flex min-h-[3.35rem] w-full items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-white/80 px-5 text-sm font-semibold text-[var(--color-ink)] shadow-[0_10px_22px_rgba(17,24,39,0.06)] transition hover:-translate-y-px hover:bg-white";

  function handleFiles(fileList: FileList | null) {
    const nextFile = fileList?.[0];

    if (!nextFile) {
      return;
    }

    onFileSelected(nextFile);
    setDragActive(false);

    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  if (selectedDocument) {
    return (
      <section
        className={`panel-card w-full overflow-hidden ${
          compact ? "max-w-none xl:mt-0 xl:min-h-[25.5rem] xl:px-5 xl:py-5" : "mx-auto max-w-[34rem]"
        }`}
      >
        <div className="grid gap-5">
          <div className="rounded-[1.85rem] border border-[rgba(17,24,39,0.08)] bg-[rgba(251,246,239,0.95)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
            <DocumentPreview
              src={selectedDocument.previewSrc}
              kind={selectedDocument.kind}
              name={selectedDocument.name}
              className={`mx-auto w-full ${
                compact ? "h-[15.5rem] max-w-[15rem] xl:h-[16.5rem] xl:max-w-[16rem]" : "h-[19rem] max-w-[17.5rem]"
              }`}
            />
          </div>

          <div className="rounded-[1.6rem] border border-[var(--color-border)] bg-white/60 px-4 py-4 text-center shadow-[0_10px_24px_rgba(17,24,39,0.05)]">
            <p className="eyebrow">{isSpanish ? "Documento listo" : "Document ready"}</p>
            <p className="mt-2 font-semibold text-[var(--color-ink)]">{selectedDocument.name}</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{selectedDocument.sizeLabel}</p>
            <p className="mt-3 text-sm text-[var(--color-muted)]">
              {isSpanish
                ? "Escanearemos limites, deducible y brechas de cobertura."
                : "We’ll scan limits, deductible, and coverage gaps."}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onAnalyze}
              disabled={disabled}
              className={primaryActionClass}
            >
              <FileText className="size-4" />
              {isSpanish ? "Analizar poliza" : "Analyze policy"}
            </button>
            <button
              type="button"
              onClick={onReset}
              className={secondaryActionClass}
            >
              <RefreshCcw className="size-4" />
              {isSpanish ? "Cambiar archivo" : "Change file"}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            <button
              type="button"
              onClick={onUseSample}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(212,96,58,0.16)] bg-[rgba(212,96,58,0.08)] px-4 py-2 font-medium text-[var(--color-accent)] transition hover:bg-[rgba(212,96,58,0.12)]"
            >
              <ImageUp className="size-4" />
              {isSpanish ? "Usar poliza de muestra" : "Use sample policy"}
            </button>
            {selectedDocument.isSample ? (
              <span className="inline-flex items-center rounded-full border border-[var(--color-border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                {isSpanish ? "Demo activa" : "Demo active"}
              </span>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`w-full rounded-[2rem] border-2 border-dashed bg-[rgba(251,246,239,0.82)] shadow-[0_22px_50px_rgba(17,24,39,0.08)] transition decoder-upload-pulse ${
        dragActive
          ? "border-[var(--color-accent)] bg-[rgba(240,217,182,0.4)]"
          : "border-[rgba(17,24,39,0.18)]"
      } ${compact ? "max-w-none p-4 xl:mt-0 xl:min-h-[25.5rem] xl:px-4 xl:py-3.5" : "mx-auto max-w-[34rem] p-5"}`}
      onDragEnter={(event) => {
        event.preventDefault();
        setDragActive(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
          return;
        }
        setDragActive(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        handleFiles(event.dataTransfer.files);
      }}
    >
      <div
        className={`flex flex-col items-center justify-center text-center ${
          compact ? "min-h-[21.5rem] xl:min-h-[22rem]" : "min-h-[24rem]"
        }`}
      >
        <div
          className={`flex items-center justify-center rounded-[2rem] bg-[rgba(212,96,58,0.12)] text-[var(--color-ink)] shadow-[inset_0_0_0_1px_rgba(17,24,39,0.08)] ${
            compact ? "size-16 xl:size-[4.5rem]" : "size-24"
          }`}
        >
          <div className="relative">
            <FileText className={compact ? "size-8 xl:size-9" : "size-12"} strokeWidth={1.8} />
            <Camera className={`absolute rounded-full bg-[var(--color-paper)] p-1 text-[var(--color-accent)] shadow-[0_8px_16px_rgba(17,24,39,0.14)] ${
              compact ? "-bottom-1.5 -right-2.5 size-5" : "-bottom-2 -right-3 size-6"
            }`} />
          </div>
        </div>

        <h1
          className={`font-display leading-[0.96] text-[var(--color-ink)] ${
            compact ? "mt-4 max-w-[11ch] text-[2.15rem] xl:text-[2.55rem]" : "mt-6 text-4xl"
          }`}
        >
          {isSpanish ? "Sube tu documento de poliza" : "Upload your policy document"}
        </h1>
        <p className={`text-[var(--color-muted)] ${compact ? "mt-2 max-w-[26ch] text-[0.95rem]" : "mt-3 max-w-[24ch] text-base"}`}>
          {isSpanish ? "Toma una foto o sube un PDF" : "Take a photo or upload a PDF"}
        </p>

        <div className={`grid w-full gap-3 sm:grid-cols-2 ${compact ? "mt-5" : "mt-6"}`}>
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className={`inline-flex items-center justify-center gap-2 rounded-[1.25rem] border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-ink)] shadow-sm ${
              compact ? "min-h-11" : "min-h-12"
            }`}
          >
            <Camera className="size-4" />
            {isSpanish ? "Tomar foto" : "Take photo"}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`${primaryActionClass} ${compact ? "min-h-11" : ""}`}
          >
            <Upload className="size-4" />
            {isSpanish ? "Subir archivo" : "Upload file"}
          </button>
        </div>

        <button
          type="button"
          onClick={onUseSample}
          className={`inline-flex items-center gap-2 text-sm font-medium text-[var(--color-accent)] underline-offset-4 hover:underline ${
            compact ? "mt-3" : "mt-4"
          }`}
        >
          <ImageUp className="size-4" />
          {isSpanish ? "Probar con la poliza de muestra" : "Try the sample policy"}
        </button>

        <p className={`text-xs uppercase tracking-[0.22em] text-[var(--color-muted)] ${compact ? "mt-3" : "mt-4"}`}>
          {isSpanish
            ? "Arrastra un PDF, JPG o PNG aqui"
            : "Drag a PDF, JPG, or PNG here"}
        </p>
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(event) => handleFiles(event.target.files)}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="sr-only"
        onChange={(event) => handleFiles(event.target.files)}
      />
    </section>
  );
}

export function formatDocumentSize(size: number, language: "en" | "es") {
  if (!Number.isFinite(size) || size <= 0) {
    return language === "es" ? "Documento demo" : "Demo document";
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(0)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
