import type { Language } from "@/lib/types";

export async function generateTtsAudio({
  text,
  language,
}: {
  text: string;
  language: Language;
}) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not configured");
  }

  const response = await fetch(
    "https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb",
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        language_code: language === "es" ? "es" : "en",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          speed: 0.9,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error("ElevenLabs request failed");
  }

  const audioBuffer = await response.arrayBuffer();
  return Buffer.from(audioBuffer);
}
