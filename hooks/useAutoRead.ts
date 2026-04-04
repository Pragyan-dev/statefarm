"use client";

import { useEffect } from "react";

import { useAccessibility } from "@/hooks/useAccessibility";

export function useAutoRead(text: string) {
  const { settings } = useAccessibility();

  useEffect(() => {
    if (!settings.voiceOutput || !text) {
      return;
    }

    let audio: HTMLAudioElement | null = null;
    let cancelled = false;
    const synth = window.speechSynthesis;

    async function run() {
      try {
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: text.slice(0, 3000),
            language: settings.language,
            speed: settings.voiceSpeed,
          }),
        });

        if (!response.ok) {
          throw new Error("tts_failed");
        }

        const blob = await response.blob();
        if (cancelled) {
          return;
        }

        audio = new Audio(URL.createObjectURL(blob));
        audio.playbackRate = settings.voiceSpeed;
        await audio.play();
      } catch {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = settings.language === "es" ? "es-US" : "en-US";
        utterance.rate = settings.voiceSpeed;
        synth.cancel();
        synth.speak(utterance);
      }
    }

    void run();

    return () => {
      cancelled = true;
      audio?.pause();
      synth.cancel();
    };
  }, [settings.language, settings.voiceOutput, settings.voiceSpeed, text]);
}
