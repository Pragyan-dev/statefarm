"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { CarFront, CheckCircle2, Shield, Sparkles, TriangleAlert, Upload, X } from "lucide-react";

import { useAccessibility } from "@/hooks/useAccessibility";
import { formatCurrency } from "@/lib/content";

interface AutoEstimateResult {
  monthlyEstimate: number;
  rangeLow: number;
  rangeHigh: number;
  riskLevel: "low" | "medium" | "high";
  recommendedCoverage: string;
  summary: string;
  factors: string[];
  aiVehicleNote?: string;
  inferredVehicle?: {
    make: string;
    model: string;
    year: number;
    bodyStyle?: string;
  };
  aiSource?: "openrouter" | "local";
  fallbackReason?: string;
}

const STATE_FARM_AUTO_INFO_URL = "https://www.statefarm.com/insurance/auto";

export function AutoInsuranceEstimator({
  state,
  zip,
}: {
  state: string;
  zip: string;
}) {
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";
  const currentYear = new Date().getFullYear();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(String(currentYear - 4));
  const [accidents, setAccidents] = useState("0");
  const [annualMileage, setAnnualMileage] = useState("9000");
  const [useType, setUseType] = useState<"commute" | "student" | "family" | "occasional">("commute");
  const [selectedImages, setSelectedImages] = useState<Array<{ file: File; preview: string }>>([]);
  const [result, setResult] = useState<AutoEstimateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const canEstimate = selectedImages.length > 0 || (make.trim() && model.trim() && year.length === 4);

  const age = useMemo(() => {
    const parsedYear = Number(year);
    return Number.isFinite(parsedYear) ? Math.max(0, currentYear - parsedYear) : 0;
  }, [currentYear, year]);

  async function handleEstimate() {
    setLoading(true);
    const formData = new FormData();
    formData.append("language", settings.language);
    formData.append("state", state);
    formData.append("zip", zip);
    formData.append("make", make);
    formData.append("model", model);
    formData.append("year", year);
    formData.append("accidents", accidents);
    formData.append("annualMileage", annualMileage);
    formData.append("useType", useType);
    selectedImages.forEach((image) => formData.append("images", image.file));

    try {
      const response = await fetch("/api/auto-estimate", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as AutoEstimateResult;
      setResult(payload);
    } finally {
      setLoading(false);
    }
  }

  function onSelectImages(fileList: FileList | null) {
    if (!fileList?.length) {
      return;
    }

    const nextFiles = Array.from(fileList)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, 2);

    setSelectedImages((current) => {
      current.forEach((image) => {
        if (image.preview.startsWith("blob:")) {
          URL.revokeObjectURL(image.preview);
        }
      });

      return nextFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
    });
  }

  function removeImage(index: number) {
    setSelectedImages((current) => {
      const target = current[index];
      if (target?.preview.startsWith("blob:")) {
        URL.revokeObjectURL(target.preview);
      }
      return current.filter((_, currentIndex) => currentIndex !== index);
    });
  }

  const riskTone =
    result?.riskLevel === "high"
      ? "text-[var(--color-danger)]"
      : result?.riskLevel === "medium"
        ? "text-[var(--color-warning)]"
        : "text-[var(--color-success)]";

  return (
    <section className="panel-card mt-0 overflow-hidden">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-[42rem]">
          <h2 className="font-display text-3xl leading-tight text-[var(--color-ink)] lg:text-4xl">
            {isSpanish ? "Cobertura de seguro de auto" : "Car insurance coverage"}
          </h2>
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            {isSpanish
              ? "Sube fotos de tu auto para obtener una estimacion rapida de cobertura y costo mensual."
              : "Upload photos of your car to get a quick estimate for coverage and monthly cost."}
          </p>
        </div>
        <div className="rounded-[1.4rem] border border-[var(--color-border)] bg-[var(--color-paper)] px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
            {isSpanish ? "Usando ubicacion" : "Using location"}
          </p>
          <p className="mt-2 font-semibold text-[var(--color-ink)]">
            {state} {zip}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.92fr)]">
        <div className="grid gap-4">
          <div className="rounded-[1.6rem] border border-[var(--color-border)] bg-[rgba(251,246,239,0.96)] p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--color-ink)]">
                  {isSpanish ? "Fotos del auto" : "Car photos"}
                </p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {isSpanish
                    ? "Sube una vista frontal o lateral. Si tienes una segunda foto desde otro angulo, mejor."
                    : "Upload a front or side view. If you have a second angle, even better."}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  <Upload className="size-4" />
                  {isSpanish ? "Subir 1-2 fotos" : "Upload 1-2 photos"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(event) => onSelectImages(event.target.files)}
                />
              </div>
            </div>

            {selectedImages.length ? (
              <div className={`mt-4 grid gap-4 ${selectedImages.length > 1 ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
                {selectedImages.map((image, index) => (
                  <div key={`${image.file.name}-${index}`} className="rounded-[1.2rem] border border-[var(--color-border)] bg-white/70 p-3">
                    <div className="relative h-40 overflow-hidden rounded-[1rem] border border-[var(--color-border)] bg-white">
                      <Image
                        src={image.preview}
                        alt={isSpanish ? `Vista del auto ${index + 1}` : `Car angle ${index + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--color-ink)]">{image.file.name}</p>
                        <p className="mt-1 text-xs text-[var(--color-muted)]">
                          {isSpanish ? `Angulo ${index + 1}` : `Angle ${index + 1}`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-ink)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                        aria-label={isSpanish ? "Eliminar foto" : "Remove photo"}
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="rounded-[1.4rem] border border-[var(--color-border)] bg-white/70 px-4 py-4">
            <p className="text-sm font-semibold text-[var(--color-ink)]">
              {isSpanish ? "Detalles opcionales para refinar" : "Optional details to refine"}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">
                {isSpanish ? "Marca" : "Make"}
              </span>
              <input
                value={make}
                onChange={(event) => setMake(event.target.value)}
                placeholder={isSpanish ? "Toyota" : "Toyota"}
                className="w-full rounded-[1.2rem] border border-[var(--color-border)] bg-white/80 px-4 py-3 text-base text-[var(--color-ink)]"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">
                {isSpanish ? "Modelo" : "Model"}
              </span>
              <input
                value={model}
                onChange={(event) => setModel(event.target.value)}
                placeholder={isSpanish ? "Corolla" : "Corolla"}
                className="w-full rounded-[1.2rem] border border-[var(--color-border)] bg-white/80 px-4 py-3 text-base text-[var(--color-ink)]"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">
                {isSpanish ? "Ano" : "Year"}
              </span>
              <input
                value={year}
                onChange={(event) => setYear(event.target.value.replace(/\D/g, "").slice(0, 4))}
                className="w-full rounded-[1.2rem] border border-[var(--color-border)] bg-white/80 px-4 py-3 text-base text-[var(--color-ink)]"
                inputMode="numeric"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">
                {isSpanish ? "Accidentes previos" : "Prior accidents"}
              </span>
              <select
                value={accidents}
                onChange={(event) => setAccidents(event.target.value)}
                className="w-full rounded-[1.2rem] border border-[var(--color-border)] bg-white/80 px-4 py-3 text-base text-[var(--color-ink)]"
              >
                {[0, 1, 2, 3].map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">
                {isSpanish ? "Millas por ano" : "Miles per year"}
              </span>
              <input
                value={annualMileage}
                onChange={(event) => setAnnualMileage(event.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full rounded-[1.2rem] border border-[var(--color-border)] bg-white/80 px-4 py-3 text-base text-[var(--color-ink)]"
                inputMode="numeric"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">
                {isSpanish ? "Uso principal" : "Primary use"}
              </span>
              <select
                value={useType}
                onChange={(event) => setUseType(event.target.value as typeof useType)}
                className="w-full rounded-[1.2rem] border border-[var(--color-border)] bg-white/80 px-4 py-3 text-base text-[var(--color-ink)]"
              >
                <option value="commute">{isSpanish ? "Trabajo diario" : "Daily commute"}</option>
                <option value="student">{isSpanish ? "Escuela / campus" : "School / campus"}</option>
                <option value="family">{isSpanish ? "Uso familiar" : "Family use"}</option>
                <option value="occasional">{isSpanish ? "Uso ocasional" : "Occasional use"}</option>
              </select>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleEstimate}
              disabled={loading || !canEstimate}
              className="button-ink px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles className="size-4" />
              {loading
                ? (isSpanish ? "Calculando..." : "Estimating...")
                : (isSpanish ? "Estimar desde fotos" : "Estimate from photos")}
            </button>
            {selectedImages.length ? (
              <div className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-muted)]">
                {isSpanish
                  ? `${selectedImages.length} foto${selectedImages.length === 1 ? "" : "s"} lista${selectedImages.length === 1 ? "" : "s"}`
                  : `${selectedImages.length} photo${selectedImages.length === 1 ? "" : "s"} ready`}
              </div>
            ) : (
              <div className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-muted)]">
                {isSpanish
                  ? `${age} anos de antiguedad`
                  : `${age} years old`}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[1.9rem] border border-[var(--color-border)] bg-[rgba(248,223,219,0.62)] p-5 shadow-[0_18px_42px_rgba(17,24,39,0.08)]">
          <p className="eyebrow">{isSpanish ? "Resultado rapido" : "Quick result"}</p>
          {result ? (
            <div className="mt-3 grid gap-4">
              <a
                href={STATE_FARM_AUTO_INFO_URL}
                target="_blank"
                rel="noreferrer"
                className="block rounded-[1.5rem] bg-white/88 px-4 py-4 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.06)] transition hover:bg-[var(--color-accent-soft)]"
              >
                <p className="text-sm text-[var(--color-muted)]">
                  {isSpanish ? "Rango mensual estimado" : "Estimated monthly range"}
                </p>
                <p className="mt-2 font-display text-5xl leading-none text-[var(--color-ink)]">
                  {formatCurrency(result.rangeLow, settings.language)}
                  <span className="mx-2 text-[var(--color-muted)]">-</span>
                  {formatCurrency(result.rangeHigh, settings.language)}
                </p>
                <p className={`mt-3 text-sm font-semibold ${riskTone}`}>
                  {isSpanish ? "Nivel de riesgo" : "Risk level"}: {result.riskLevel}
                </p>
              </a>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.3rem] border border-[var(--color-border)] bg-white/75 px-4 py-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
                    <Shield className="size-4 text-[var(--color-accent)]" />
                    <span>{isSpanish ? "Cobertura sugerida" : "Suggested coverage"}</span>
                  </div>
                  <p className="mt-3 font-semibold text-[var(--color-ink)]">{result.recommendedCoverage}</p>
                </div>
                <div className="rounded-[1.3rem] border border-[var(--color-border)] bg-white/75 px-4 py-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
                    <CarFront className="size-4 text-[var(--color-accent)]" />
                    <span>{isSpanish ? "Prima central" : "Center estimate"}</span>
                  </div>
                  <p className="mt-3 text-2xl font-bold text-[var(--color-ink)]">
                    {formatCurrency(result.monthlyEstimate, settings.language)}
                  </p>
                </div>
              </div>

              {result.inferredVehicle ? (
                <div className="rounded-[1.3rem] border border-[var(--color-border)] bg-white/75 px-4 py-4">
                  <p className="text-sm font-semibold text-[var(--color-ink)]">
                    {isSpanish ? "Vehiculo detectado o estimado" : "Detected or estimated vehicle"}
                  </p>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    {result.inferredVehicle.year} {result.inferredVehicle.make} {result.inferredVehicle.model}
                    {result.inferredVehicle.bodyStyle ? ` · ${result.inferredVehicle.bodyStyle}` : ""}
                  </p>
                </div>
              ) : null}

              <div className="rounded-[1.3rem] border border-[var(--color-border)] bg-white/75 px-4 py-4">
                <p className="text-sm text-[var(--color-muted)]">{result.summary}</p>
                <div className="mt-4 grid gap-2">
                  {result.factors.map((factor) => (
                    <div key={factor} className="flex items-start gap-2 text-sm text-[var(--color-ink)]">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--color-success)]" />
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              {result.aiVehicleNote ? (
                <div className="rounded-[1.3rem] border border-[var(--color-border)] bg-white/75 px-4 py-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
                    <TriangleAlert className="size-4 text-[var(--color-accent)]" />
                    <span>{isSpanish ? "Nota visual de IA" : "AI vehicle note"}</span>
                  </div>
                  <p className="mt-3 text-sm text-[var(--color-muted)]">{result.aiVehicleNote}</p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-4 rounded-[1.5rem] border border-[var(--color-border)] bg-white/75 px-5 py-6 text-sm text-[var(--color-muted)]">
              {isSpanish
                ? "Ingresa los detalles del auto para ver un rango mensual estimado y una recomendacion de cobertura."
                : "Enter your car details to see an estimated monthly range and a coverage recommendation."}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
