import type { Language } from "@/lib/types";

export interface DisasterSummary {
  title: string;
  date: string;
  incidentType?: string;
  area?: string;
  href?: string;
}

export interface DisasterHistoryPayload {
  items: DisasterSummary[];
  insight: string;
  source: "live" | "fallback";
}

function buildDisasterHref(disasterNumber: string | number, language: Language) {
  return language === "es"
    ? `https://www.fema.gov/es/disaster/${disasterNumber}`
    : `https://www.fema.gov/disaster/${disasterNumber}`;
}

function getLiveInsight(city: string, state: string, language: Language) {
  if (language === "es") {
    return `Estas declaraciones muestran eventos en ${city} o cerca de ${city}, ${state}. Perdidas mas pequenas por agua, calor o robo aun pueden afectar a los inquilinos.`;
  }

  return `These declarations show events in or near ${city}, ${state}. Smaller losses like water damage, heat issues, and theft can still affect renters.`;
}

function getLowDeclarationInsight(city: string, state: string, language: Language) {
  if (language === "es") {
    return `No encontramos declaraciones recientes de FEMA para ${city} o sus alrededores, pero las inundaciones repentinas, el calor extremo y los danos por agua siguen siendo riesgos reales para inquilinos.`;
  }

  return `We did not find recent FEMA declarations for ${city} or nearby areas, but flash floods, extreme heat, and everyday water losses still matter for renters.`;
}

function getUnavailableInsight(language: Language) {
  if (language === "es") {
    return "La fuente en vivo de FEMA no esta disponible en este momento. Usa los riesgos locales y los limites de cobertura para estimar lo que podria pasar en este ZIP.";
  }

  return "The live FEMA feed is unavailable right now. Use the local risks and the coverage limits below to estimate what could happen in this ZIP.";
}

export function buildFallbackDisasterHistory(
  city: string,
  state: string,
  language: Language,
  reason: "no-results" | "fetch-failed",
): DisasterHistoryPayload {
  return {
    items: [],
    insight:
      reason === "no-results"
        ? getLowDeclarationInsight(city, state, language)
        : getUnavailableInsight(language),
    source: "fallback",
  };
}

export async function fetchDisasterHistory(
  city: string,
  state: string,
  areaMatches: string[],
  language: Language,
): Promise<DisasterHistoryPayload> {
  const url = `https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries?$filter=state%20eq%20'${state}'&$orderby=declarationDate%20desc&$top=60`;

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
      title?: string;
      declarationDate?: string;
      incidentType?: string;
      designatedArea?: string;
      declaredCountyArea?: string;
      disasterNumber?: string | number;
    }>;
  };

  const normalizedAreaMatches = areaMatches.map((value) => value.toLowerCase());

  const items = (payload.DisasterDeclarationsSummaries ?? [])
    .map((item) => ({
      title:
        item.title ??
        item.declarationTitle ??
        (language === "es" ? "Declaracion de desastre" : "Disaster declaration"),
      date: item.declarationDate ?? "",
      incidentType: item.incidentType ?? "",
      area: item.declaredCountyArea ?? item.designatedArea ?? "",
      href: item.disasterNumber ? buildDisasterHref(item.disasterNumber, language) : undefined,
    }))
    .filter((item) => {
      const areaText = `${item.title} ${item.area}`.toLowerCase();
      return normalizedAreaMatches.some((match) => areaText.includes(match));
    })
    .slice(0, 5)
    .filter((item) => Boolean(item.date || item.title));

  if (!items.length) {
    return buildFallbackDisasterHistory(city, state, language, "no-results");
  }

  return {
    items,
    insight: getLiveInsight(city, state, language),
    source: "live",
  };
}
