import { NextRequest, NextResponse } from "next/server";

import { generateClaimGuide } from "@/lib/generateClaimGuide";
import type { Language } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { description, language } = (await request.json().catch(() => ({}))) as {
    description?: string;
    language?: Language;
  };

  if (!description?.trim()) {
    return NextResponse.json(
      { error: language === "es" ? "Falta descripcion" : "Missing description" },
      { status: 400 },
    );
  }

  const guide = await generateClaimGuide({
    description: description.trim(),
    language: language ?? "en",
  });

  return NextResponse.json(guide, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
