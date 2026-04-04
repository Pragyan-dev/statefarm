import { NextRequest, NextResponse } from "next/server";

import { analyzeScam } from "@/lib/ai";
import type { Language } from "@/lib/types";

export async function POST(request: NextRequest) {
  const raw = await request.text();
  const { description, language } = (raw ? JSON.parse(raw) : {}) as {
    description?: string;
    language?: Language;
  };

  if (!description) {
    return NextResponse.json({ error: "Missing description" }, { status: 400 });
  }

  const result = await analyzeScam({
    description,
    language: language ?? "en",
  });

  return NextResponse.json(result);
}
