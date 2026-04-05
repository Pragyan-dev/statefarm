import {
  getOpenRouterHeaders,
  getOpenRouterImageModel,
  getOpenRouterModel,
  OPENROUTER_URL,
} from "@/lib/openrouter";
import type { Language } from "@/lib/types";
import type {
  CoverageCategory,
  CoverageGap,
  CoverageItem,
  DecoderAnalysisResponse,
  PolicyAnalysis,
} from "@/types/policy";

const REQUEST_TIMEOUT_MS = 8_000;
const VALID_POLICY_TYPES = new Set(["auto", "renters", "home", "health", "other"]);
const VALID_CATEGORIES = new Set<CoverageCategory>([
  "theft",
  "fire",
  "water",
  "liability",
  "medical",
  "natural_disaster",
  "property",
  "collision",
  "comprehensive",
  "uninsured_motorist",
]);
const VALID_SEVERITIES = new Set(["high", "medium", "low"]);
const MOCK_EXPIRATION_DATE = "2026-10-01";

export const MOCK_POLICY_ANALYSIS = buildMockPolicyAnalysis("en");

export function getMockPolicyAnalysis(
  language: Language,
  metadata?: Partial<Pick<DecoderAnalysisResponse, "aiSource" | "fallbackReason" | "demoMode">>,
): DecoderAnalysisResponse {
  return buildMockPolicyAnalysis(language, metadata);
}

export async function parsePolicyDocument(
  content: string,
  contentType: "text" | "image",
  language: Language,
): Promise<DecoderAnalysisResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return buildMockPolicyAnalysis(language, {
      aiSource: "local",
      demoMode: true,
      fallbackReason: "OPENROUTER_API_KEY missing",
    });
  }

  const model = contentType === "image" ? getOpenRouterImageModel() : getOpenRouterModel();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: getOpenRouterHeaders(apiKey),
      signal: controller.signal,
      body: JSON.stringify({
        model,
        response_format: {
          type: "json_object",
        },
        max_tokens: 2000,
        messages: buildMessages(content, contentType, language),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter request failed: ${errorText}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string | Array<{ type?: string; text?: string }>;
        };
      }>;
    };

    const raw = payload.choices?.[0]?.message?.content;
    const contentText =
      typeof raw === "string"
        ? raw
        : raw?.map((item) => item.text ?? "").join("") ?? "{}";
    const cleaned = contentText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(cleaned) as Partial<PolicyAnalysis>;

    return {
      ...normalizePolicyAnalysis(parsed, language),
      aiSource: "openrouter",
      demoMode: false,
    };
  } catch (error) {
    return buildMockPolicyAnalysis(language, {
      aiSource: "local",
      demoMode: true,
      fallbackReason: error instanceof Error ? error.message : "OpenRouter request failed",
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildMessages(content: string, contentType: "text" | "image", language: Language) {
  const systemPrompt = `You are an insurance policy analyzer for immigrants. Respond ONLY with valid JSON and no markdown.

Return this exact structure:
{
  "provider": "company name",
  "policyType": "auto|renters|home|health|other",
  "policyNumber": "if visible",
  "expirationDate": "YYYY-MM-DD if visible",
  "monthlyCost": number or null,
  "healthScore": number from 0 to 100,
  "covered": [
    {
      "category": "theft|fire|water|liability|medical|natural_disaster|property|collision|comprehensive|uninsured_motorist",
      "label": "short plain-language label",
      "detail": "one short sentence",
      "limit": "$X,XXX if visible"
    }
  ],
  "notCovered": [
    {
      "category": "theft|fire|water|liability|medical|natural_disaster|property|collision|comprehensive|uninsured_motorist",
      "label": "short plain-language label",
      "detail": "one short sentence"
    }
  ],
  "deductible": {
    "amount": number,
    "comparisons": ["comparison one", "comparison two", "comparison three"]
  },
  "gaps": [
    {
      "category": "theft|fire|water|liability|medical|natural_disaster|property|collision|comprehensive|uninsured_motorist",
      "title": "short title",
      "description": "what is missing",
      "scenario": "If X happens, you pay $Y out of pocket",
      "estimatedRisk": number,
      "severity": "high|medium|low"
    }
  ]
}

Rules:
- Write all human-readable labels, descriptions, comparisons, and scenarios in ${language === "es" ? "Spanish" : "English"}
- Use 6th grade reading level
- Avoid insurance jargon in labels
- Always include at least 2 gaps
- Health score: 90+ only for broad coverage with a low deductible, 50-70 for basic coverage, below 50 for thin coverage
- If a value is unknown, use null
- Be conservative and realistic with dollar risks`;

  if (contentType === "image") {
    return [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              language === "es"
                ? "Analiza esta poliza de seguro y devuelve el JSON."
                : "Parse this insurance policy document and return the JSON.",
          },
          {
            type: "image_url",
            image_url: {
              url: content,
            },
          },
        ],
      },
    ];
  }

  return [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content:
        language === "es"
          ? `Analiza esta poliza de seguro:\n\n${content.slice(0, 18000)}`
          : `Parse this insurance policy document:\n\n${content.slice(0, 18000)}`,
    },
  ];
}

function normalizePolicyAnalysis(raw: Partial<PolicyAnalysis>, language: Language): PolicyAnalysis {
  const policyType: PolicyAnalysis["policyType"] = VALID_POLICY_TYPES.has(raw.policyType ?? "")
    ? (raw.policyType as PolicyAnalysis["policyType"])
    : "other";
  const provider = sanitizeText(raw.provider, language === "es" ? "Proveedor no identificado" : "Unknown provider");
  const deductibleAmount = sanitizeNumber(raw.deductible?.amount) ?? 500;
  const covered = sanitizeCoverageItems(raw.covered, language);
  const notCovered = sanitizeCoverageItems(raw.notCovered, language);
  const gaps = sanitizeGaps(raw.gaps, language, notCovered, deductibleAmount);

  return {
    provider,
    policyType,
    policyNumber: sanitizeOptionalText(raw.policyNumber),
    expirationDate: sanitizeOptionalText(raw.expirationDate),
    monthlyCost: sanitizeNumber(raw.monthlyCost),
    healthScore: clampNumber(sanitizeNumber(raw.healthScore) ?? 62, 0, 100),
    covered,
    notCovered,
    deductible: {
      amount: deductibleAmount,
      comparisons: sanitizeComparisons(raw.deductible?.comparisons, deductibleAmount, language),
    },
    gaps,
  };
}

function sanitizeCoverageItems(items: unknown, language: Language): CoverageItem[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => sanitizeCoverageItem(item, language))
    .filter((item): item is CoverageItem => item !== null);
}

function sanitizeCoverageItem(item: unknown, language: Language): CoverageItem | null {
  if (!item || typeof item !== "object") {
    return null;
  }

  const value = item as Record<string, unknown>;
  const category = sanitizeCategory(value.category);
  const label = sanitizeText(
    value.label,
    language === "es" ? "Cobertura sin etiqueta" : "Coverage item",
  );

  return {
    category,
    label,
    detail: sanitizeOptionalText(value.detail),
    limit: sanitizeOptionalText(value.limit),
  };
}

function sanitizeGaps(
  gaps: unknown,
  language: Language,
  notCovered: CoverageItem[],
  deductibleAmount: number,
): CoverageGap[] {
  const normalized = Array.isArray(gaps)
    ? gaps
        .map((gap) => sanitizeGap(gap, language))
        .filter((gap): gap is CoverageGap => gap !== null)
    : [];

  if (normalized.length >= 2) {
    return normalized;
  }

  const fallbackGaps = buildFallbackGaps(language, notCovered, deductibleAmount);

  return [...normalized, ...fallbackGaps].slice(0, Math.max(2, normalized.length));
}

function sanitizeGap(gap: unknown, language: Language): CoverageGap | null {
  if (!gap || typeof gap !== "object") {
    return null;
  }

  const value = gap as Record<string, unknown>;
  const severity = VALID_SEVERITIES.has(String(value.severity))
    ? (value.severity as CoverageGap["severity"])
    : "medium";

  return {
    category: sanitizeCategory(value.category),
    title: sanitizeText(value.title, language === "es" ? "Falta de cobertura" : "Coverage gap"),
    description: sanitizeText(
      value.description,
      language === "es" ? "Falta una proteccion importante." : "An important protection is missing.",
    ),
    scenario: sanitizeText(
      value.scenario,
      language === "es"
        ? "Si pasa una perdida comun, pagarias de tu bolsillo."
        : "If a common loss happens, you would pay out of pocket.",
    ),
    estimatedRisk: clampNumber(sanitizeNumber(value.estimatedRisk) ?? 1500, 250, 25000),
    severity,
  };
}

function sanitizeComparisons(comparisons: unknown, amount: number, language: Language) {
  if (Array.isArray(comparisons) && comparisons.length >= 2) {
    return comparisons
      .map((item) => sanitizeOptionalText(item))
      .filter((item): item is string => Boolean(item))
      .slice(0, 4);
  }

  if (language === "es") {
    return [
      "2 semanas de comida",
      "casi 30 meses de seguro de inquilino de $17",
      "10 tanques llenos de gasolina",
      `un pago inesperado de ${amount} dolares`,
    ];
  }

  return [
    "2 weeks of groceries",
    "almost 30 months of $17 renter's insurance",
    "10 full gas tank fill-ups",
    `an unexpected $${amount} bill`,
  ];
}

function buildFallbackGaps(
  language: Language,
  notCovered: CoverageItem[],
  deductibleAmount: number,
): CoverageGap[] {
  const seeded: CoverageGap[] = notCovered.slice(0, 2).map((item, index) => ({
    category: item.category,
    title:
      language === "es"
        ? `Riesgo sin cubrir: ${item.label}`
        : `Uncovered risk: ${item.label}`,
    description:
      item.detail ??
      (language === "es"
        ? "Esta perdida no aparece claramente cubierta."
        : "This loss does not show up as clearly covered."),
    scenario:
      language === "es"
        ? `Si este problema ocurre, podrias pagar ${index === 0 ? "$3,100" : "$1,800"} de tu bolsillo.`
        : `If this happens, you could pay ${index === 0 ? "$3,100" : "$1,800"} out of pocket.`,
    estimatedRisk: index === 0 ? 3100 : 1800,
    severity: index === 0 ? "high" : "medium",
  }));

  if (seeded.length >= 2) {
    return seeded;
  }

  const additional: CoverageGap[] = [
    ...seeded,
    {
      category: "water",
      title: language === "es" ? "El deducible sigue siendo real" : "The deductible still matters",
      description:
        language === "es"
          ? "Incluso con cobertura, tendrias que cubrir el deducible antes de que el seguro ayude."
          : "Even with coverage, you still have to absorb the deductible before insurance helps.",
      scenario:
        language === "es"
          ? `En un reclamo de agua de $3,000, primero pondrias ${deductibleAmount} dolares.`
          : `On a $3,000 water claim, you would still put in $${deductibleAmount} first.`,
      estimatedRisk: deductibleAmount,
      severity: "medium",
    },
    {
      category: "natural_disaster",
      title: language === "es" ? "Los desastres especiales suelen quedar fuera" : "Special disasters are often excluded",
      description:
        language === "es"
          ? "Las polizas base rara vez incluyen todo. Inundacion y terremoto suelen ser extras."
          : "Base policies rarely include everything. Flood and earthquake are often separate add-ons.",
      scenario:
        language === "es"
          ? "Si entra agua por una inundacion, esa factura podria caer totalmente sobre ti."
          : "If flood water enters the unit, that bill could land entirely on you.",
      estimatedRisk: 4200,
      severity: "high",
    },
  ];

  return additional.slice(0, 2);
}

function buildMockPolicyAnalysis(
  language: Language,
  metadata?: Partial<Pick<DecoderAnalysisResponse, "aiSource" | "fallbackReason" | "demoMode">>,
): DecoderAnalysisResponse {
  const covered: CoverageItem[] = language === "es"
    ? [
        {
          category: "property",
          label: "Tus cosas dentro del apartamento",
          detail: "La poliza protege ropa, muebles, laptop y otros bienes personales.",
          limit: "$20,000 por perdida",
        },
        {
          category: "liability",
          label: "Danos a otras personas o a su propiedad",
          detail: "Si alguien se lastima en tu apartamento o tu causas danos, hay ayuda hasta el limite.",
          limit: "$100,000 por reclamo",
        },
        {
          category: "water",
          label: "Tuberias rotas y dano accidental por agua",
          detail: "El agua accidental desde una tuberia cubierta normalmente entra en esta proteccion.",
          limit: "$20,000 por perdida",
        },
        {
          category: "fire",
          label: "Incendio y humo",
          detail: "El fuego y el humo estan cubiertos para tus pertenencias.",
          limit: "$20,000 por perdida",
        },
        {
          category: "medical",
          label: "Hospedaje temporal si no puedes vivir alli",
          detail: "La poliza ayuda con gastos de vida adicionales despues de una perdida cubierta.",
          limit: "$5,000",
        },
      ]
    : [
        {
          category: "property",
          label: "Your belongings inside the apartment",
          detail: "The policy protects clothes, furniture, a laptop, and other personal property.",
          limit: "$20,000 per loss",
        },
        {
          category: "liability",
          label: "Damage to other people or their property",
          detail: "If someone is hurt in your apartment or you cause damage, the policy helps up to the limit.",
          limit: "$100,000 per claim",
        },
        {
          category: "water",
          label: "Burst pipes and accidental water damage",
          detail: "Accidental water from a covered pipe event is usually included here.",
          limit: "$20,000 per loss",
        },
        {
          category: "fire",
          label: "Fire and smoke",
          detail: "Fire and smoke damage to your belongings is covered.",
          limit: "$20,000 per loss",
        },
        {
          category: "medical",
          label: "Temporary housing if you cannot stay there",
          detail: "The policy helps with extra living expenses after a covered loss.",
          limit: "$5,000",
        },
      ];

  const notCovered: CoverageItem[] = language === "es"
    ? [
        {
          category: "natural_disaster",
          label: "Inundacion",
          detail: "El agua que entra desde afuera del edificio no esta incluida.",
        },
        {
          category: "natural_disaster",
          label: "Terremoto",
          detail: "El dano por movimiento de tierra necesita cobertura separada.",
        },
        {
          category: "property",
          label: "Danos por chinches",
          detail: "Las plagas y la remediacion por chinches no aparecen cubiertas.",
        },
      ]
    : [
        {
          category: "natural_disaster",
          label: "Flood",
          detail: "Water entering from outside the building is not included.",
        },
        {
          category: "natural_disaster",
          label: "Earthquake",
          detail: "Damage from earth movement needs separate coverage.",
        },
        {
          category: "property",
          label: "Bed bug damage",
          detail: "Pest-related loss and remediation do not show up as covered.",
        },
      ];

  const gaps: CoverageGap[] = language === "es"
    ? [
        {
          category: "natural_disaster",
          title: "Sin cobertura contra inundacion",
          description: "La poliza cubre tuberias rotas, pero no agua que entra desde una inundacion real.",
          scenario: "Si tu apartamento se inunda despues de una tormenta, podrias pagar $3,100 de tu bolsillo.",
          estimatedRisk: 3100,
          severity: "high",
        },
        {
          category: "natural_disaster",
          title: "Terremoto fuera de la poliza",
          description: "Un sismo fuerte puede danar muebles, electronicos y el espacio temporal donde vivas.",
          scenario: "Si un terremoto danara tu unidad, podrias absorber mas de $4,600 en perdidas.",
          estimatedRisk: 4600,
          severity: "high",
        },
        {
          category: "property",
          title: "Las plagas siguen siendo tu problema",
          description: "Bed bugs, fumigacion y reemplazo de articulos afectados normalmente no entran.",
          scenario: "Si una infestacion arruina tu colchon y ropa de cama, podrias pagar $900 tu mismo.",
          estimatedRisk: 900,
          severity: "medium",
        },
      ]
    : [
        {
          category: "natural_disaster",
          title: "No flood protection",
          description: "The policy covers burst pipes, but not water entering from a real flood event.",
          scenario: "If your apartment floods after a storm, you could pay $3,100 out of pocket.",
          estimatedRisk: 3100,
          severity: "high",
        },
        {
          category: "natural_disaster",
          title: "Earthquake sits outside the policy",
          description: "A serious quake can damage furniture, electronics, and temporary living needs.",
          scenario: "If an earthquake damaged your unit, you could absorb more than $4,600 in losses.",
          estimatedRisk: 4600,
          severity: "high",
        },
        {
          category: "property",
          title: "Pest damage is still on you",
          description: "Bed bugs, extermination, and replacement of affected items usually stay outside the policy.",
          scenario: "If an infestation ruins your mattress and bedding, you could pay $900 yourself.",
          estimatedRisk: 900,
          severity: "medium",
        },
      ];

  return {
    provider: "SafeHome Insurance",
    policyType: "renters",
    policyNumber: "SH-2048-5521",
    expirationDate: MOCK_EXPIRATION_DATE,
    monthlyCost: 17,
    healthScore: 72,
    covered,
    notCovered,
    deductible: {
      amount: 500,
      comparisons:
        language === "es"
          ? [
              "2 semanas de comida",
              "casi 30 meses de seguro de inquilino de $17",
              "10 tanques llenos de gasolina",
              "2.5 meses de factura de telefono",
            ]
          : [
              "2 weeks of groceries",
              "almost 30 months of $17 renter's insurance",
              "10 full gas tank fill-ups",
              "2.5 months of a phone bill",
            ],
    },
    gaps,
    aiSource: metadata?.aiSource ?? "local",
    demoMode: metadata?.demoMode ?? true,
    fallbackReason: metadata?.fallbackReason,
  };
}

function sanitizeCategory(value: unknown): CoverageCategory {
  return VALID_CATEGORIES.has(value as CoverageCategory)
    ? (value as CoverageCategory)
    : "property";
}

function sanitizeText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function sanitizeOptionalText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function sanitizeNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const numeric = Number(value.replace(/[^\d.-]/g, ""));
    return Number.isFinite(numeric) ? numeric : undefined;
  }

  return undefined;
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
