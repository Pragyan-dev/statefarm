import { NextRequest, NextResponse } from "next/server";

import { fetchDisasterHistory } from "@/lib/fema";
import type { Language } from "@/lib/types";

export async function GET(request: NextRequest) {
  const state = request.nextUrl.searchParams.get("state") ?? "AZ";
  const language = (request.nextUrl.searchParams.get("language") ?? "en") as Language;

  try {
    const items = await fetchDisasterHistory(state, language);
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
