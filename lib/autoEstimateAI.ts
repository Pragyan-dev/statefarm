import {
  getOpenRouterHeaders,
  getOpenRouterImageModel,
  OPENROUTER_URL,
} from "@/lib/openrouter";
import type { Language } from "@/lib/types";

export interface AutoEstimateInput {
  make?: string;
  model?: string;
  year?: number;
  accidents?: number;
  annualMileage?: number;
  useType?: "commute" | "student" | "family" | "occasional";
  state: string;
  zip: string;
}

export interface InferredVehicleProfile {
  make: string;
  model: string;
  year: number;
  bodyStyle?: string;
}

export interface AutoEstimateResult {
  monthlyEstimate: number;
  rangeLow: number;
  rangeHigh: number;
  riskLevel: "low" | "medium" | "high";
  recommendedCoverage: string;
  summary: string;
  factors: string[];
  aiVehicleNote?: string;
  inferredVehicle?: InferredVehicleProfile;
  aiSource?: "openrouter" | "local";
  fallbackReason?: string;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeInput(input: AutoEstimateInput, inferred?: Partial<InferredVehicleProfile>) {
  const currentYear = new Date().getFullYear();
  return {
    state: input.state,
    zip: input.zip,
    make: input.make?.trim() || inferred?.make || "Unknown",
    model: input.model?.trim() || inferred?.model || "Car",
    year: clamp(input.year ?? inferred?.year ?? currentYear - 7, currentYear - 25, currentYear),
    accidents: clamp(input.accidents ?? 0, 0, 3),
    annualMileage: clamp(input.annualMileage ?? 9000, 3000, 25000),
    useType: input.useType ?? "commute",
    bodyStyle: inferred?.bodyStyle,
  };
}

function buildLocalEstimate(
  input: ReturnType<typeof normalizeInput>,
  language: Language,
): AutoEstimateResult {
  const currentYear = new Date().getFullYear();
  const age = clamp(currentYear - input.year, 0, 25);
  const baselineByState: Record<string, number> = {
    AZ: 89,
    TX: 96,
    NY: 142,
  };
  const baseline = baselineByState[input.state] ?? 104;

  let multiplier = 1;
  multiplier += age <= 3 ? 0.22 : age <= 8 ? 0.08 : -0.04;
  multiplier += Math.min(input.accidents, 3) * 0.18;
  multiplier += input.annualMileage > 15000 ? 0.14 : input.annualMileage > 9000 ? 0.06 : -0.03;
  multiplier += input.useType === "commute" ? 0.08 : input.useType === "family" ? 0.05 : 0;
  multiplier += /tesla|bmw|mercedes|audi|lexus/i.test(`${input.make} ${input.model}`) ? 0.16 : 0;
  multiplier += /civic|corolla|camry|accord|elantra|sentra/i.test(`${input.make} ${input.model}`) ? -0.03 : 0;

  const monthlyEstimate = Math.round(baseline * multiplier);
  const rangeLow = Math.max(35, Math.round(monthlyEstimate * 0.82));
  const rangeHigh = Math.round(monthlyEstimate * 1.18);
  const riskLevel =
    input.accidents >= 2 || monthlyEstimate >= 145 ? "high" : monthlyEstimate >= 100 ? "medium" : "low";
  const recommendedCoverage =
    age <= 8
      ? language === "es"
        ? "Responsabilidad + colision + integral"
        : "Liability + collision + comprehensive"
      : language === "es"
        ? "Responsabilidad fuerte + considera integral"
        : "Strong liability + consider comprehensive";

  const factors = [
    language === "es"
      ? `Auto ${age <= 3 ? "mas nuevo" : age <= 10 ? "de media edad" : "mas antiguo"}: ${currentYear - age}`
      : `${age <= 3 ? "Newer" : age <= 10 ? "Mid-age" : "Older"} car: ${currentYear - age}`,
    language === "es"
      ? `${input.accidents} accidente${input.accidents === 1 ? "" : "s"} reportado${input.accidents === 1 ? "" : "s"}`
      : `${input.accidents} reported accident${input.accidents === 1 ? "" : "s"}`,
    language === "es"
      ? `${input.annualMileage.toLocaleString("es-US")} millas por ano`
      : `${input.annualMileage.toLocaleString("en-US")} miles per year`,
  ];

  return {
    monthlyEstimate,
    rangeLow,
    rangeHigh,
    riskLevel,
    recommendedCoverage,
    summary:
      language === "es"
        ? `Para ${input.make} ${input.model} en ${input.state}, una prima mensual razonable suele caer en este rango.`
        : `For a ${input.make} ${input.model} in ${input.state}, a reasonable monthly premium often lands in this range.`,
    factors,
    inferredVehicle: {
      make: input.make,
      model: input.model,
      year: input.year,
      bodyStyle: input.bodyStyle,
    },
    aiSource: "local",
  };
}

async function analyzeVehicleImages(
  dataUrls: string[],
  normalizedInput: ReturnType<typeof normalizeInput>,
  language: Language,
) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return {
      note:
        language === "es"
          ? "No pudimos leer la foto con IA, pero aun podemos darte un estimado base."
          : "We could not read the photo with AI, but we can still give you a baseline estimate.",
      inferredVehicle: {
        make: normalizedInput.make,
        model: normalizedInput.model,
        year: normalizedInput.year,
      },
      aiSource: "local" as const,
      fallbackReason: "OPENROUTER_API_KEY missing",
    };
  }

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: getOpenRouterHeaders(apiKey),
    body: JSON.stringify({
      model: getOpenRouterImageModel(),
      response_format: {
        type: "json_object",
      },
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content: `You analyze 1 or 2 car photos for insurance context. Respond only as JSON.
{
  "vehicle_note": "1-2 short sentences in ${language === "es" ? "Spanish" : "English"}",
  "condition_risk": "low|medium|high",
  "inferred_make": "best guess short string",
  "inferred_model": "best guess short string",
  "inferred_year": number,
  "body_style": "sedan|suv|truck|hatchback|coupe|van|other",
  "visible_damage": true
}
Rules:
- Use the images as the primary source. The user text is only a hint.
- Mention visible body style, condition, or likely repair-cost implications only if visually justified.
- Guess make/model/year conservatively. If uncertain, use broad but plausible guesses.
- Do not mention anything about drivers or protected traits.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                language === "es"
                  ? `Usa estas fotos para inferir marca, modelo aproximado, ano aproximado y condicion visible. Si hay datos escritos del usuario, usalos solo como referencia secundaria: ${normalizedInput.year} ${normalizedInput.make} ${normalizedInput.model}.`
                  : `Use these photos to infer make, approximate model, approximate year, and visible condition. If there are written user details, use them only as a secondary hint: ${normalizedInput.year} ${normalizedInput.make} ${normalizedInput.model}.`,
            },
            ...dataUrls.map((url) => ({
              type: "image_url",
              image_url: {
                url,
              },
            })),
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter vehicle image request failed: ${await response.text()}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string | Array<{ text?: string }>;
      };
    }>;
  };
  const raw = payload.choices?.[0]?.message?.content;
  const text = typeof raw === "string" ? raw : raw?.map((item) => item.text ?? "").join("") ?? "{}";
  const parsed = JSON.parse(text) as {
    vehicle_note?: string;
    condition_risk?: "low" | "medium" | "high";
    inferred_make?: string;
    inferred_model?: string;
    inferred_year?: number;
    body_style?: string;
    visible_damage?: boolean;
  };

  return {
    note: parsed.vehicle_note,
    conditionRisk: parsed.condition_risk,
    inferredVehicle: {
      make: parsed.inferred_make?.trim() || normalizedInput.make,
      model: parsed.inferred_model?.trim() || normalizedInput.model,
      year: clamp(parsed.inferred_year ?? normalizedInput.year, new Date().getFullYear() - 25, new Date().getFullYear()),
      bodyStyle: parsed.body_style?.trim() || undefined,
    },
    visibleDamage: parsed.visible_damage,
    aiSource: "openrouter" as const,
  };
}

export async function buildAutoEstimate({
  input,
  language,
  imageDataUrls,
}: {
  input: AutoEstimateInput;
  language: Language;
  imageDataUrls?: string[];
}): Promise<AutoEstimateResult> {
  const normalizedInput = normalizeInput(input);
  const base = buildLocalEstimate(normalizedInput, language);

  if (!imageDataUrls?.length) {
    return base;
  }

  try {
    const imageInsight = await analyzeVehicleImages(imageDataUrls, normalizedInput, language);
    const adjustedInput = normalizeInput(input, imageInsight.inferredVehicle);
    const adjusted = buildLocalEstimate(adjustedInput, language);

    if (imageInsight.conditionRisk === "high") {
      adjusted.monthlyEstimate += 9;
      adjusted.rangeLow += 7;
      adjusted.rangeHigh += 12;
    } else if (imageInsight.conditionRisk === "medium") {
      adjusted.monthlyEstimate += 4;
      adjusted.rangeLow += 3;
      adjusted.rangeHigh += 6;
    }
    if (imageInsight.visibleDamage) {
      adjusted.monthlyEstimate += 6;
      adjusted.rangeLow += 5;
      adjusted.rangeHigh += 8;
      adjusted.riskLevel =
        adjusted.riskLevel === "low" ? "medium" : "high";
    }

    return {
      ...adjusted,
      aiVehicleNote: imageInsight.note,
      inferredVehicle: imageInsight.inferredVehicle ?? adjusted.inferredVehicle,
      aiSource: imageInsight.aiSource,
      fallbackReason: imageInsight.aiSource === "local" ? imageInsight.fallbackReason : undefined,
    };
  } catch (error) {
    return {
      ...base,
      aiVehicleNote:
        language === "es"
          ? "La foto no pudo analizarse con IA, asi que mostramos un estimado base."
          : "The photo could not be analyzed with AI, so we are showing a baseline estimate.",
      aiSource: "local",
      fallbackReason: error instanceof Error ? error.message : "Vehicle image analysis failed",
    };
  }
}
