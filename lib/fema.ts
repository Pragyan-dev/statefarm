import type { Language } from "@/lib/types";

export interface DisasterSummary {
  title: string;
  date: string;
}

export async function fetchDisasterHistory(state: string, language: Language) {
  const url = `https://www.fema.gov/api/open/v1/DisasterDeclarationsSummaries?$filter=state%20eq%20'${state}'&$orderby=declarationDate%20desc&$top=5`;

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
    }>;
  };

  const items = payload.DisasterDeclarationsSummaries ?? [];

  return items.slice(0, 3).map((item) => ({
    title:
      item.declarationTitle ??
      (language === "es" ? "Declaracion de desastre" : "Disaster declaration"),
    date: item.declarationDate ?? "",
    incidentType: item.incidentType ?? "",
  }));
}
