import { NextRequest, NextResponse } from "next/server";

import { buildFallbackDisasterHistory, fetchDisasterHistory } from "@/lib/fema";
import type { Language } from "@/lib/types";

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get("city") ?? "Tempe";
  const state = request.nextUrl.searchParams.get("state") ?? "AZ";
  const language = (request.nextUrl.searchParams.get("language") ?? "en") as Language;
  const areaMatches = request.nextUrl.searchParams.getAll("area");

  try {
    return NextResponse.json(await fetchDisasterHistory(city, state, areaMatches, language));
  } catch {
    return NextResponse.json(buildFallbackDisasterHistory(city, state, language, "fetch-failed"));
  }
}
