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
}: {
  selectedDocument: DecoderSelectedDocument | null;
  onFileSelected: (file: File) => void;
  onAnalyze: () => void;
  onReset: () => void;
  onUseSample: () => void;
  disabled?: boolean;
}) {
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";
  const [dragActive, setDragActive] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const primaryActionClass = "button-ink w-full px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60";
  const secondaryActionClass = "button-secondary w-full px-5 text-sm font-semibold";

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
      <section className="panel-card mx-auto w-full max-w-[34rem] overflow-hidden">
        <div className="grid gap-5">
          <div className="rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-subtle)] p-4">
            <DocumentPreview
              src={selectedDocument.previewSrc}
              kind={selectedDocument.kind}
              name={selectedDocument.name}
              className="mx-auto h-[19rem] w-full max-w-[17.5rem]"
            />
          </div>

          <div className="service-card-soft px-4 py-4 text-center">
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
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(226,41,37,0.18)] bg-[var(--color-accent-soft)] px-4 py-2 font-medium text-[var(--color-accent)] transition hover:bg-[#fbe4e3]"
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
      className={`mx-auto w-full max-w-[34rem] rounded-[1rem] border-2 border-dashed bg-[var(--color-subtle)] p-5 shadow-[var(--shadow-md)] transition decoder-upload-pulse ${
        dragActive
          ? "border-[var(--color-accent)] bg-[#fff8f8]"
          : "border-[var(--color-border-strong)]"
      }`}
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
      <div className="flex min-h-[24rem] flex-col items-center justify-center text-center">
        <div className="flex size-24 items-center justify-center rounded-[1rem] bg-white text-[var(--color-ink)] shadow-[var(--shadow-sm)]">
          <div className="relative">
            <FileText className="size-12" strokeWidth={1.8} />
            <Camera className="absolute -bottom-2 -right-3 size-6 rounded-full bg-white p-1 text-[var(--color-accent)] shadow-[0_8px_16px_rgba(17,24,39,0.14)]" />
          </div>
        </div>

        <h1 className="mt-6 text-4xl font-semibold leading-[1] text-[var(--color-ink)]">
          {isSpanish ? "Sube tu documento de poliza" : "Upload your policy document"}
        </h1>
        <p className="mt-3 max-w-[24ch] text-base text-[var(--color-muted)]">
          {isSpanish ? "Toma una foto o sube un PDF" : "Take a photo or upload a PDF"}
        </p>

        <div className="mt-6 grid w-full gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="button-secondary rounded-[0.9rem] px-4 text-sm font-semibold"
          >
            <Camera className="size-4" />
            {isSpanish ? "Tomar foto" : "Take photo"}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={primaryActionClass}
          >
            <Upload className="size-4" />
            {isSpanish ? "Subir archivo" : "Upload file"}
          </button>
        </div>

        <button
          type="button"
          onClick={onUseSample}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-accent)] underline-offset-4 hover:underline"
        >
          <ImageUp className="size-4" />
          {isSpanish ? "Probar con la poliza de muestra" : "Try the sample policy"}
        </button>

        <p className="mt-4 text-xs uppercase tracking-[0.22em] text-[var(--color-muted)]">
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
