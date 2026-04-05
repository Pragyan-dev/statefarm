import {
  getOpenRouterHeaders,
  getOpenRouterModel,
  OPENROUTER_URL,
} from "@/lib/openrouter";
import type {
  ClaimGuideResult,
  Language,
  PolicySummaryResult,
} from "@/lib/types";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown OpenRouter error";
}

function logAiEvent(level: "info" | "warn" | "error", feature: string, message: string) {
  console[level](`[arrivesafe-ai:${feature}] ${message}`);
}

async function requestOpenRouterJson<T>({
  feature,
  system,
  user,
}: {
  feature: string;
  system: string;
  user: string;
}) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY missing");
  }

  const model = getOpenRouterModel();

  logAiEvent("info", feature, `Requesting OpenRouter model ${model}`);

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: getOpenRouterHeaders(apiKey),
    body: JSON.stringify({
      model,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content: system,
        },
        {
          role: "user",
          content: user,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter request failed: ${errorText}`);
  }

  logAiEvent("info", feature, `OpenRouter request succeeded with ${model}`);

  const payload = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string | Array<{ type?: string; text?: string }>;
      };
    }>;
  };

  const rawContent = payload.choices?.[0]?.message?.content;
  const text =
    typeof rawContent === "string"
      ? rawContent
      : rawContent?.map((item) => item.text ?? "").join("") ?? "{}";

  return JSON.parse(text) as T;
}

export async function decodePolicyText({
  text,
  language,
}: {
  text: string;
  language: Language;
}) {
  try {
    const result = await requestOpenRouterJson<PolicySummaryResult>({
      feature: "decode",
      system:
        "You are an insurance policy translator for immigrants. Return JSON with provider, type, covered, notCovered, deductible { amount, analogy }, monthlyCost, expires, score, gaps, summary. Use 6th grade reading level. Short sentences. No jargon.",
      user: `Language: ${language}. Policy text:\n${text.slice(0, 16000)}`,
    });

    return {
      ...result,
      demoMode: false,
      aiSource: "openrouter",
      sourceText: text,
    };
  } catch (error) {
    const fallbackReason = getErrorMessage(error);
    logAiEvent("warn", "decode", `Using local fallback. ${fallbackReason}`);
    const lower = text.toLowerCase();
    const covered = [];
    const notCovered = [];

    if (lower.includes("theft")) covered.push(language === "es" ? "Robo" : "Theft");
    if (lower.includes("fire")) covered.push(language === "es" ? "Incendio" : "Fire");
    if (lower.includes("water")) covered.push(language === "es" ? "Dano por agua" : "Water damage");
    if (lower.includes("flood")) notCovered.push(language === "es" ? "Inundacion" : "Flood");
    if (lower.includes("earthquake")) notCovered.push(language === "es" ? "Terremoto" : "Earthquake");

    return {
      provider: lower.includes("state farm") ? "State Farm" : "Sample insurer",
      type: lower.includes("auto") ? "auto" : "renters",
      covered: covered.length ? covered : [language === "es" ? "Robo" : "Theft", language === "es" ? "Incendio" : "Fire"],
      notCovered: notCovered.length ? notCovered : [language === "es" ? "Inundacion" : "Flood"],
      deductible: {
        amount: 500,
        analogy: language === "es" ? "Como dos semanas de comida" : "About two weeks of groceries",
      },
      monthlyCost: 17,
      expires: "2026-12-01",
      score: "good",
      gaps: [
        language === "es"
          ? "No vemos evidencia de cobertura contra inundacion."
          : "We do not see evidence of flood coverage.",
      ],
      summary:
        language === "es"
          ? "Esta poliza cubre las perdidas comunes del apartamento pero no parece cubrir inundacion."
          : "This policy covers common apartment losses but does not appear to cover flood damage.",
      sourceText: text,
      demoMode: true,
      aiSource: "local",
      fallbackReason,
    } satisfies PolicySummaryResult;
  }
}

export async function coachClaim({
  description,
  language,
}: {
  description: string;
  language: Language;
}) {
  try {
    const result = await requestOpenRouterJson<ClaimGuideResult>({
      feature: "claim",
      system:
        "You are a claim filing assistant for immigrants who may not speak English fluently. Return JSON with immediateActions, documents, whatNotToDo, timeline, followUpSteps, claimType. Simple English. Short sentences.",
      user: `Language: ${language}. Incident: ${description}`,
    });

    return {
      ...result,
      demoMode: false,
      aiSource: "openrouter",
    };
  } catch (error) {
    const fallbackReason = getErrorMessage(error);
    logAiEvent("warn", "claim", `Using local fallback. ${fallbackReason}`);
    const lower = description.toLowerCase();
    const claimType = lower.includes("car") || lower.includes("accident")
      ? "auto_accident"
      : lower.includes("stole") || lower.includes("break")
        ? "theft"
        : "renters_claim";

    return {
      immediateActions:
        language === "es"
          ? ["Asegura tu seguridad primero.", "Toma fotos claras.", "Llama al seguro lo antes posible."]
          : ["Make sure you are safe first.", "Take clear photos.", "Call the insurer as soon as possible."],
      documents:
        language === "es"
          ? ["Fotos del dano", "Numero de poliza", "Reporte policial si aplica"]
          : ["Photos of the damage", "Policy number", "Police report if needed"],
      whatNotToDo:
        language === "es"
          ? ["No tires evidencia.", "No aceptes culpa sin entender el caso."]
          : ["Do not throw away evidence.", "Do not admit fault before you understand the situation."],
      timeline:
        language === "es"
          ? "La mayoria de los reclamos iniciales reciben seguimiento en 24 a 72 horas."
          : "Most first updates arrive within 24 to 72 hours.",
      followUpSteps:
        language === "es"
          ? ["Guarda cada correo y numero de referencia.", "Confirma el deducible antes de reparar o comprar."]
          : ["Save every email and reference number.", "Confirm the deductible before repairs or replacements."],
      claimType,
      demoMode: true,
      aiSource: "local",
      fallbackReason,
    } satisfies ClaimGuideResult;
  }
}
