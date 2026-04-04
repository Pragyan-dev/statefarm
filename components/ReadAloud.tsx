"use client";

import { useRef, useState } from "react";
import { Volume2, PauseCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { useAccessibility } from "@/hooks/useAccessibility";

export function ReadAloud({
  text,
  language,
  className = "",
}: {
  text: string;
  language?: "en" | "es";
  className?: string;
}) {
  const t = useTranslations();
  const { settings } = useAccessibility();
  const activeLanguage = language ?? settings.language;
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function handleToggle() {
    if (playing && audioRef.current) {
      audioRef.current.pause();
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.slice(0, 5000),
          language: activeLanguage,
          speed: settings.voiceSpeed,
        }),
      });

      if (!response.ok) {
        throw new Error("tts_failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setPlaying(false);
      audio.playbackRate = settings.voiceSpeed;
      await audio.play();
      setPlaying(true);
    } catch {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = activeLanguage === "es" ? "es-US" : "en-US";
      utterance.rate = settings.voiceSpeed;
      utterance.onend = () => setPlaying(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      setPlaying(true);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-ink)] ${className}`}
      aria-label={playing ? t("stopReading") : t("readAloud")}
    >
      {playing ? <PauseCircle className="size-4" /> : <Volume2 className="size-4" />}
      {playing ? t("stopReading") : t("readAloud")}
    </button>
  );
}
