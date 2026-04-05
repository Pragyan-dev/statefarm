import { NextRequest, NextResponse } from "next/server";

import { buildFallbackDisasterHistory, fetchDisasterHistory } from "@/lib/fema";
import type { Language } from "@/lib/types";

export async function GET(request: NextRequest) {
  const state = request.nextUrl.searchParams.get("state") ?? "AZ";
  const language = (request.nextUrl.searchParams.get("language") ?? "en") as Language;

  try {
    return NextResponse.json(await fetchDisasterHistory(state, language));
  } catch {
    return NextResponse.json(buildFallbackDisasterHistory(state, language, "fetch-failed"));
  }
}
