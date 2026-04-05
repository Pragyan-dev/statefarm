import type { Language } from "@/lib/types";

export interface DisasterSummary {
  title: string;
  date: string;
  incidentType?: string;
  area?: string;
}

export interface DisasterHistoryPayload {
  items: DisasterSummary[];
  insight: string;
  source: "live" | "fallback";
}

function getLiveInsight(state: string, language: Language) {
  if (language === "es") {
    return `Estas declaraciones federales muestran los eventos grandes en ${state}. Los danos pequenos por agua, calor o robo aun pueden golpear a los inquilinos aunque no terminen en FEMA.`;
  }

  return `These federal declarations capture the biggest events in ${state}. Smaller renter losses like water damage, heat-related failures, and theft can still hurt you even when they never show up in FEMA.`;
}

function getLowDeclarationInsight(state: string, language: Language) {
  if (language === "es") {
    return `${state} no tiene muchas declaraciones federales recientes, pero las inundaciones repentinas, el calor extremo y los danos por agua todavia son riesgos reales para inquilinos.`;
  }

  return `${state} has few recent federal declarations, but flash floods, extreme heat, and everyday water losses still matter for renters.`;
}

function getUnavailableInsight(language: Language) {
  if (language === "es") {
    return "La fuente en vivo de FEMA no esta disponible en este momento. Usa los riesgos locales y los limites de cobertura para estimar lo que podria pasar en este ZIP.";
  }

  return "The live FEMA feed is unavailable right now. Use the local risks and the coverage limits below to estimate what could happen in this ZIP.";
}

export function buildFallbackDisasterHistory(
  state: string,
  language: Language,
  reason: "no-results" | "fetch-failed",
): DisasterHistoryPayload {
  return {
    items: [],
    insight:
      reason === "no-results"
        ? getLowDeclarationInsight(state, language)
        : getUnavailableInsight(language),
    source: "fallback",
  };
}

export async function fetchDisasterHistory(
  state: string,
  language: Language,
): Promise<DisasterHistoryPayload> {
  const url = `https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries?$filter=state%20eq%20'${state}'&$orderby=declarationDate%20desc&$top=5`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    next: {
      revalidate: 86400,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch FEMA data");
  }

  const payload = (await response.json()) as {
    DisasterDeclarationsSummaries?: Array<{
      declarationTitle?: string;
      declarationDate?: string;
      incidentType?: string;
      designatedArea?: string;
    }>;
  };

  const items = (payload.DisasterDeclarationsSummaries ?? [])
    .slice(0, 5)
    .map((item) => ({
      title:
        item.declarationTitle ??
        (language === "es" ? "Declaracion de desastre" : "Disaster declaration"),
      date: item.declarationDate ?? "",
      incidentType: item.incidentType ?? "",
      area: item.designatedArea ?? "",
    }))
    .filter((item) => Boolean(item.date || item.title));

  if (!items.length) {
    return buildFallbackDisasterHistory(state, language, "no-results");
  }

  return {
    items,
    insight: getLiveInsight(state, language),
    source: "live",
  };
}
