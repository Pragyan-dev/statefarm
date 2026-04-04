"use client";

import { useState, useSyncExternalStore } from "react";
import { Mic, Square, Keyboard } from "lucide-react";
import { useTranslations } from "next-intl";

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    SpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export function VoiceInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const t = useTranslations();
  const [isListening, setIsListening] = useState(false);
  const recognitionConstructor = useSyncExternalStore(
    () => () => {},
    () => window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null,
    () => null,
  );

  function handleMic() {
    if (!recognitionConstructor) {
      return;
    }

    const recognition = new recognitionConstructor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const transcript = Array.from({ length: event.results.length })
        .map((_, index) => event.results[index]?.[0]?.transcript ?? "")
        .join(" ");

      onChange(transcript);
    };
    recognition.onend = () => {
      setIsListening(false);
    };

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    recognition.start();
    setIsListening(true);
  }

  return (
    <div className="panel-card">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Claim intake</p>
          <h2 className="font-display text-2xl text-[var(--color-ink)]">
            {t("claimCoach")}
          </h2>
        </div>
        <button
          type="button"
          onClick={handleMic}
          aria-label="Press to speak your claim description"
          className={`flex min-h-[72px] min-w-[72px] items-center justify-center rounded-full ${
            isListening
              ? "bg-[var(--color-danger)] text-white"
              : "bg-[var(--color-ink)] text-[var(--color-paper)]"
          }`}
        >
          {isListening ? <Square className="size-6" /> : <Mic className="size-6" />}
        </button>
      </div>

      <p className="mt-3 text-sm text-[var(--color-muted)]">
        {recognitionConstructor ? t("speakNow") : t("typeInstead")}
      </p>

      <label className="mt-4 block">
        <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
          <Keyboard className="size-4" />
          Incident description
        </span>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={5}
          className="w-full rounded-[1.5rem] border border-[var(--color-border)] bg-transparent px-4 py-3 text-base text-[var(--color-ink)]"
          placeholder="Someone broke into my apartment while I was at work."
        />
      </label>
    </div>
  );
}
