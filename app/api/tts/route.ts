import { NextRequest, NextResponse } from "next/server";

import { generateTtsAudio } from "@/lib/tts";
import type { Language } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { text, language } = (await request.json()) as {
      text?: string;
      language?: Language;
    };

    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const audio = await generateTtsAudio({
      text,
      language: language ?? "en",
    });

    return new NextResponse(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "TTS failed",
      },
      { status: 500 },
    );
  }
}
