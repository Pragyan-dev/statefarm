export const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const FALLBACK_CHAT_MODEL = "google/gemini-2.5-flash";
const FALLBACK_IMAGE_MODEL = "google/gemini-2.5-flash-image";

export function getOpenRouterModel() {
  return process.env.OPENROUTER_MODEL?.trim() || FALLBACK_CHAT_MODEL;
}

export function getOpenRouterImageModel() {
  return process.env.OPENROUTER_IMAGE_MODEL?.trim() || FALLBACK_IMAGE_MODEL;
}

export function getOpenRouterHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": "https://arrivesafe.local",
    "X-Title": "ArriveSafe",
  };
}
