import { NextRequest, NextResponse } from "next/server";

import { transcribeSpeech } from "@/lib/stt";
import type { Language } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const language = (formData.get("language") as Language | null) ?? "en";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing audio file" }, { status: 400 });
    }

    const transcript = await transcribeSpeech({
      file,
      language,
    });

    return NextResponse.json(transcript, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Speech transcription failed",
      },
      { status: 500 },
    );
  }
}
