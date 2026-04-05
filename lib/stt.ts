import type { Language } from "@/lib/types";

interface ElevenLabsTranscriptResponse {
  text?: string;
  language_code?: string;
}

export async function transcribeSpeech({
  file,
  language,
}: {
  file: File;
  language: Language;
}) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not configured");
  }

  const formData = new FormData();
  formData.append("model_id", "scribe_v2");
  formData.append("language_code", language === "es" ? "es" : "en");
  formData.append("file", file, file.name || "claim-coach-audio.webm");

  const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "ElevenLabs transcription failed");
  }

  const payload = (await response.json()) as ElevenLabsTranscriptResponse;

  return {
    text: payload.text?.trim() ?? "",
    languageCode: payload.language_code ?? (language === "es" ? "es" : "en"),
  };
}
