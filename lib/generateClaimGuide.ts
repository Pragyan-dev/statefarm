import "server-only";

import {
  getOpenRouterHeaders,
  getOpenRouterModel,
  OPENROUTER_URL,
} from "@/lib/openrouter";
import type { Language } from "@/lib/types";
import type { ClaimGuidePersonalization, IncidentType } from "@/types/claim";

const REQUEST_TIMEOUT_MS = 8_000;
const INCIDENT_TYPES: IncidentType[] = [
  "car_accident",
  "apartment_flood",
  "theft",
  "fire",
  "weather_damage",
  "medical_emergency",
  "other",
];
const URGENCY_LEVELS = ["immediate", "within_24h", "within_week"] as const;

export async function generateClaimGuide({
  description,
  language,
}: {
  description: string;
  language: Language;
}): Promise<ClaimGuidePersonalization> {
  const trimmedDescription = description.trim();

  if (!trimmedDescription) {
    return buildLocalClaimPersonalization({
      description,
      language,
      fallbackReason: language === "es" ? "Falta descripcion" : "Missing incident description",
    });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return buildLocalClaimPersonalization({
      description,
      language,
      fallbackReason: "OPENROUTER_API_KEY missing",
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: getOpenRouterHeaders(apiKey),
      signal: controller.signal,
      body: JSON.stringify({
        model: getOpenRouterModel(),
        response_format: {
          type: "json_object",
        },
        max_tokens: 900,
        messages: buildMessages(trimmedDescription, language),
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
    const parsed = JSON.parse(cleaned) as Partial<ClaimGuidePersonalization>;
    const fallback = buildLocalClaimPersonalization({ description: trimmedDescription, language });

    return {
      incidentType: sanitizeIncidentType(parsed.incidentType) ?? fallback.incidentType,
      urgency: sanitizeUrgency(parsed.urgency) ?? fallback.urgency,
      urgencyMessage: sanitizeText(parsed.urgencyMessage) || fallback.urgencyMessage,
      personalizedTips: sanitizeTips(parsed.personalizedTips, fallback.personalizedTips),
      estimatedTimeline: sanitizeText(parsed.estimatedTimeline) || fallback.estimatedTimeline,
      aiSource: "openrouter",
      demoMode: false,
    };
  } catch (error) {
    return buildLocalClaimPersonalization({
      description: trimmedDescription,
      language,
      fallbackReason: error instanceof Error ? error.message : "Claim classification failed",
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export function buildLocalClaimPersonalization({
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
  const urgency = getUrgencyForIncident(incidentType);
  const visaMentioned =
    /visa|immigration|f-?1|h-?1b|j-?1|o-?1|student status|work permit/.test(lower);
  const uninsuredMentioned =
    /no insurance|uninsured|i don't have insurance|i do not have insurance|no policy|without insurance/.test(
      lower,
    );
  const tips = getBaseTips(incidentType, language);

  if (visaMentioned) {
    tips.push(
      language === "es"
        ? "Este reclamo no cambia tu visa ni tu estatus migratorio."
        : "This claim does not change your visa or immigration status.",
    );
  }

  if (uninsuredMentioned) {
    tips.push(
      language === "es"
        ? "Aunque no tengas seguro, aun debes guardar fotos, reportes y recibos para protegerte."
        : "Even without insurance, you should still save photos, reports, and receipts to protect yourself.",
    );
  }

  return {
    incidentType,
    urgency,
    urgencyMessage: getUrgencyMessage(incidentType, language),
    personalizedTips: Array.from(new Set(tips)).slice(0, 4),
    estimatedTimeline: getEstimatedTimeline(incidentType, language),
    aiSource: "local",
    demoMode: false,
    fallbackReason,
  };
}

function buildMessages(description: string, language: Language) {
  return [
    {
      role: "system",
      content: `You are an insurance claim assistant for immigrants in the US. The user just described an incident. Classify it and provide calm, specific guidance.

Respond ONLY with valid JSON:
{
  "incidentType": "car_accident|apartment_flood|theft|fire|weather_damage|medical_emergency|other",
  "urgency": "immediate|within_24h|within_week",
  "urgencyMessage": "one short sentence explaining why they should act now",
  "personalizedTips": [
    "specific tip one",
    "specific tip two"
  ],
  "estimatedTimeline": "how long this typically takes"
}

Rules:
- Write all human-readable text in ${language === "es" ? "Spanish" : "English"}
- Use simple language, about 6th grade reading level
- Be specific to what they described
- If they mention being on a visa or immigration status, reassure them this claim does not change that status
- If they mention not having insurance, still help them with realistic next steps
- Be calm, direct, and practical
- Always return at least 2 personalized tips`,
    },
    {
      role: "user",
      content: description,
    },
  ];
}

function detectIncidentType(lower: string): IncidentType {
  if (
    /\b(car|auto|vehicle|truck|rear[- ]?end|collision|crash|bumper|intersection|license plate)\b/.test(
      lower,
    )
  ) {
    return "car_accident";
  }

  if (/\b(pipe|burst|leak|ceiling|water damage|flood|flooded|flooding|apartment water)\b/.test(lower)) {
    return "apartment_flood";
  }

  if (/\b(theft|stolen|break[- ]?in|burglar|burglary|robbed|robbery|someone entered)\b/.test(lower)) {
    return "theft";
  }

  if (/\b(fire|smoke|burned|burnt|ash|soot)\b/.test(lower)) {
    return "fire";
  }

  if (/\b(storm|hail|wind|lightning|tree branch|weather|monsoon)\b/.test(lower)) {
    return "weather_damage";
  }

  if (/\b(ambulance|hospital|er|emergency room|injury|injured|doctor|bleeding|medical)\b/.test(lower)) {
    return "medical_emergency";
  }

  return "other";
}

function getUrgencyForIncident(
  incidentType: IncidentType,
): ClaimGuidePersonalization["urgency"] {
  switch (incidentType) {
    case "car_accident":
    case "apartment_flood":
    case "fire":
    case "medical_emergency":
      return "immediate";
    case "theft":
    case "weather_damage":
      return "within_24h";
    default:
      return "within_week";
  }
}

function getUrgencyMessage(incidentType: IncidentType, language: Language) {
  switch (incidentType) {
    case "car_accident":
      return language === "es"
        ? "Actua ahora: toma fotos y reporta el choque antes de irte del lugar."
        : "Act now: take photos and report the crash before you leave the scene.";
    case "apartment_flood":
      return language === "es"
        ? "Actua ahora: detiene el agua y protege tus documentos primero."
        : "Act now: stop the water and protect your documents first.";
    case "theft":
      return language === "es"
        ? "Reportalo dentro de 24 horas para proteger mejor tu reclamo."
        : "Report it within 24 hours to protect your claim.";
    case "fire":
      return language === "es"
        ? "Actua ahora: la seguridad y las fotos tempranas importan mucho."
        : "Act now: safety and early photos matter a lot.";
    case "weather_damage":
      return language === "es"
        ? "Documenta el dano dentro de 24 horas, antes de limpiar demasiado."
        : "Document the damage within 24 hours, before cleanup goes too far.";
    case "medical_emergency":
      return language === "es"
        ? "Busca ayuda medica primero y guarda cada registro desde el principio."
        : "Get medical help first and save every record from the start.";
    default:
      return language === "es"
        ? "Haz un resumen corto y junta pruebas antes de que se pierdan los detalles."
        : "Write a short summary and gather proof before details fade.";
  }
}

function getEstimatedTimeline(incidentType: IncidentType, language: Language) {
  const map: Record<IncidentType, string> = {
    car_accident: language === "es" ? "2 a 4 semanas" : "2 to 4 weeks",
    apartment_flood: language === "es" ? "1 a 3 semanas" : "1 to 3 weeks",
    theft: language === "es" ? "1 a 2 semanas" : "1 to 2 weeks",
    fire: language === "es" ? "3 a 8 semanas" : "3 to 8 weeks",
    weather_damage: language === "es" ? "2 a 6 semanas" : "2 to 6 weeks",
    medical_emergency: language === "es" ? "Depende del tratamiento" : "Depends on treatment and records",
    other: language === "es" ? "1 a 3 semanas" : "1 to 3 weeks",
  };

  return map[incidentType];
}

function getBaseTips(incidentType: IncidentType, language: Language) {
  switch (incidentType) {
    case "car_accident":
      return language === "es"
        ? [
            "Toma fotos de ambos autos, las placas y la calle.",
            "Pide el reporte policial y guarda el nombre del oficial.",
          ]
        : [
            "Take photos of both cars, the plates, and the road.",
            "Ask for the police report and save the officer name.",
          ];
    case "apartment_flood":
      return language === "es"
        ? [
            "Mueve pasaporte, visa, laptop y cargadores a un lugar seco.",
            "Avisa al mantenimiento o al landlord y pide un numero de reporte.",
          ]
        : [
            "Move your passport, visa papers, laptop, and chargers to a dry place.",
            "Notify maintenance or your landlord and ask for a report number.",
          ];
    case "theft":
      return language === "es"
        ? [
            "Llama a la policia y pide un numero de caso.",
            "Haz una lista de lo robado con marcas, seriales y recibos si existen.",
          ]
        : [
            "Call the police and ask for a case number.",
            "Make a list of stolen items with brands, serial numbers, and receipts if you have them.",
          ];
    case "fire":
      return language === "es"
        ? [
            "Solo vuelve a entrar cuando los bomberos digan que es seguro.",
            "Fotografia dano por fuego, humo y agua antes de limpiar.",
          ]
        : [
            "Only go back inside when firefighters say it is safe.",
            "Photograph fire, smoke, and water damage before cleanup.",
          ];
    case "weather_damage":
      return language === "es"
        ? [
            "Toma fotos del techo, ventanas y dano exterior antes de repararlo.",
            "Haz reparaciones temporales para evitar dano nuevo y guarda recibos.",
          ]
        : [
            "Take photos of the roof, windows, and outside damage before repairs.",
            "Make temporary repairs to stop new damage and keep the receipts.",
          ];
    case "medical_emergency":
      return language === "es"
        ? [
            "Pide ayuda medica primero y guarda todos los papeles de alta.",
            "Anota cuando empezaron los sintomas y a donde fuiste.",
          ]
        : [
            "Get medical help first and keep every discharge paper.",
            "Write down when the symptoms started and where you went.",
          ];
    default:
      return language === "es"
        ? [
            "Haz una lista corta de hechos: que paso, cuando, donde y quien estaba ahi.",
            "Toma fotos antes de mover o limpiar cualquier cosa importante.",
          ]
        : [
            "Write a short facts list: what happened, when, where, and who was there.",
            "Take photos before you move or clean anything important.",
          ];
  }
}

function sanitizeIncidentType(value: unknown): IncidentType | null {
  return typeof value === "string" && INCIDENT_TYPES.includes(value as IncidentType)
    ? (value as IncidentType)
    : null;
}

function sanitizeUrgency(
  value: unknown,
): ClaimGuidePersonalization["urgency"] | null {
  return typeof value === "string" &&
    (URGENCY_LEVELS as readonly string[]).includes(value)
    ? (value as ClaimGuidePersonalization["urgency"])
    : null;
}

function sanitizeTips(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const cleaned = value
    .map((item) => sanitizeText(item))
    .filter((item): item is string => Boolean(item))
    .slice(0, 4);

  return cleaned.length >= 2 ? cleaned : fallback;
}

function sanitizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}
