"use client";

import { useState } from "react";

import { PolicySummary } from "@/components/PolicySummary";
import { useAccessibility } from "@/hooks/useAccessibility";
import { useAutoRead } from "@/hooks/useAutoRead";
import type { PolicySummaryResult } from "@/lib/types";

export default function DecodePage() {
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<PolicySummaryResult | null>(null);
  useAutoRead(summary?.summary ?? "");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("language", settings.language);

      if (file) {
        formData.append("file", file);
      } else {
        formData.append("demo", "true");
      }

      const response = await fetch("/api/decode", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(isSpanish ? "La decodificacion fallo" : "Decode failed");
      }

      const payload = (await response.json()) as PolicySummaryResult;
      setSummary(payload);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : isSpanish
            ? "La carga fallo"
            : "Upload failed",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="py-6 lg:py-10">
      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="grid gap-6">
          <section className="panel-card hero-ambient overflow-hidden">
            <p className="eyebrow">{isSpanish ? "Decodificador de poliza" : "Policy decoder"}</p>
            <h1 className="font-display text-4xl text-[var(--color-ink)] lg:max-w-[10ch]">
              {isSpanish
                ? "Traduce una poliza a algo que realmente puedas usar."
                : "Translate a policy into something you can actually use."}
            </h1>
            <p className="mt-4 text-base text-[var(--color-muted)]">
              {isSpanish
                ? "Sube una foto, captura o PDF. Extraemos la cobertura, las protecciones faltantes y el deducible en lenguaje claro."
                : "Upload a photo, a screenshot, or a PDF. We pull out the covered items, missing protections, and deductible in plain language."}
            </p>
          </section>

          <form onSubmit={handleSubmit} className="panel-card">
            <label htmlFor="policy-upload" className="block">
              <span className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">
                {isSpanish ? "Sube una foto o PDF de la poliza" : "Upload policy photo or PDF"}
              </span>
              <input
                id="policy-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                capture="environment"
                aria-describedby="upload-help"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className="w-full rounded-[1.5rem] border border-[var(--color-border)] bg-transparent px-4 py-3 text-[var(--color-ink)]"
              />
            </label>
            <p id="upload-help" className="mt-2 text-sm text-[var(--color-muted)]">
              {isSpanish
                ? "La foto con camara suele ser la opcion mas rapida para la demo. Dejalo vacio para usar la poliza de ejemplo."
                : "Camera photo is usually the fastest input for the demo. Leave this blank to use the sample policy."}
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="min-h-12 flex-1 rounded-full bg-[var(--color-ink)] px-5 text-sm font-semibold text-[var(--color-paper)]"
              >
                {loading
                  ? isSpanish
                    ? "Decodificando..."
                    : "Decoding..."
                  : file
                    ? isSpanish
                      ? "Decodificar archivo"
                      : "Decode upload"
                    : isSpanish
                      ? "Usar poliza demo"
                      : "Use demo policy"}
              </button>
            </div>
            {error ? <p className="mt-3 text-sm text-[var(--color-danger)]">{error}</p> : null}
          </form>
        </div>

        <div className="grid gap-6">
          {summary ? (
            <PolicySummary summary={summary} />
          ) : (
            <section className="panel-card flex min-h-[320px] items-center justify-center text-center">
              <div className="max-w-[28ch]">
                <p className="eyebrow">{isSpanish ? "Vista previa" : "Preview"}</p>
                <h2 className="font-display text-3xl text-[var(--color-ink)]">
                  {isSpanish
                    ? "Tu resumen decodificado aparecera aqui."
                    : "Your decoded summary will appear here."}
                </h2>
                <p className="mt-4 text-sm text-[var(--color-muted)]">
                  {isSpanish
                    ? "Los elementos cubiertos, exclusiones, deducible, costo mensual y la explicacion simple apareceran en esta columna."
                    : "Covered items, exclusions, deductible, monthly cost, and the plain-language explanation all render in this column."}
                </p>
              </div>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}
