"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Keyboard, LoaderCircle, Mic, Square } from "lucide-react";
import { useTranslations } from "next-intl";

import { useAccessibility } from "@/hooks/useAccessibility";

function getPreferredMimeType() {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") {
    return "";
  }

  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/mpeg",
  ];

  return candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate)) ?? "";
}

export function VoiceInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const t = useTranslations();
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const mediaSupported = useSyncExternalStore(
    () => () => {},
    () =>
      typeof navigator !== "undefined" &&
      typeof window !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia &&
      "MediaRecorder" in window,
    () => false,
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const baseValueRef = useRef(value);
  const latestOnChangeRef = useRef(onChange);

  useEffect(() => {
    latestOnChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stop?.();
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current = null;
      mediaStreamRef.current = null;
    };
  }, []);

  function stopActiveStream() {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    mediaRecorderRef.current = null;
  }

  async function transcribeRecordedAudio(audioBlob: Blob) {
    if (!audioBlob.size) {
      setSpeechError(
        isSpanish
          ? "No captamos audio. Intenta otra vez y habla mas cerca del microfono."
          : "We did not capture audio. Try again and speak closer to the microphone.",
      );
      return;
    }

    setIsTranscribing(true);

    try {
      const extension = audioBlob.type.includes("mp4")
        ? "mp4"
        : audioBlob.type.includes("mpeg")
          ? "mp3"
          : "webm";
      const audioFile = new File([audioBlob], `claim-coach.${extension}`, {
        type: audioBlob.type || "audio/webm",
      });
      const formData = new FormData();
      formData.append("file", audioFile);
      formData.append("language", settings.language);

      const response = await fetch("/api/stt", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "Transcription failed");
      }

      const payload = (await response.json()) as { text?: string };
      const transcript = payload.text?.trim() ?? "";

      if (!transcript) {
        throw new Error("empty_transcript");
      }

      const nextValue = [baseValueRef.current.trim(), transcript].filter(Boolean).join(" ").trim();
      latestOnChangeRef.current(nextValue);
      setSpeechError(null);
    } catch (error) {
      setSpeechError(
        error instanceof Error && error.message !== "empty_transcript"
          ? error.message
          : isSpanish
            ? "No pudimos transcribir tu audio. Intenta otra vez o escribe el incidente abajo."
            : "We could not transcribe your audio. Try again or type the incident below.",
      );
    } finally {
      setIsTranscribing(false);
      chunksRef.current = [];
    }
  }

  async function startRecording() {
    if (!mediaSupported || isTranscribing) {
      return;
    }

    try {
      setSpeechError(null);
      baseValueRef.current = value;
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const mimeType = getPreferredMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        setSpeechError(
          isSpanish
            ? "No pudimos grabar el audio. Revisa el permiso del microfono."
            : "We could not record audio. Check your microphone permission.",
        );
        setIsRecording(false);
        stopActiveStream();
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, {
          type: recorder.mimeType || mimeType || "audio/webm",
        });
        setIsRecording(false);
        stopActiveStream();
        void transcribeRecordedAudio(audioBlob);
      };

      mediaRecorderRef.current = recorder;
      mediaStreamRef.current = stream;
      recorder.start(250);
      setIsRecording(true);
    } catch {
      setSpeechError(
        isSpanish
          ? "No pudimos iniciar el microfono. Revisa los permisos del navegador."
          : "We could not start the microphone. Check your browser permissions.",
      );
      setIsRecording(false);
      stopActiveStream();
    }
  }

  function stopRecording() {
    if (!mediaRecorderRef.current) {
      return;
    }

    if (mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }

  function handleMic() {
    if (isRecording) {
      stopRecording();
      return;
    }

    void startRecording();
  }

  const statusText = isTranscribing
    ? isSpanish
      ? "Transcribiendo tu audio..."
      : "Transcribing your audio..."
    : isRecording
      ? isSpanish
        ? "Grabando... toca otra vez para detener y pegar el texto."
        : "Recording... tap again to stop and paste the text."
      : mediaSupported
        ? isSpanish
          ? "Toca para grabar tu voz y convertirla en texto."
          : "Tap to record your voice and turn it into text."
        : t("typeInstead");

  return (
    <div className="panel-card">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">{isSpanish ? "Entrada del reclamo" : "Claim intake"}</p>
          <h2 className="font-display text-2xl text-[var(--color-ink)]">
            {t("claimCoach")}
          </h2>
        </div>
        <button
          type="button"
          onClick={handleMic}
          disabled={!mediaSupported || isTranscribing}
          aria-label={
            isRecording
              ? isSpanish
                ? "Detener grabacion"
                : "Stop recording"
              : isSpanish
                ? "Grabar descripcion del reclamo"
                : "Record claim description"
          }
          className={`flex min-h-[72px] min-w-[72px] items-center justify-center rounded-full transition ${
            isRecording
              ? "bg-[var(--color-danger)] text-white"
              : "bg-[var(--color-ink)] text-[var(--color-paper)]"
          } ${isTranscribing ? "cursor-wait opacity-70" : ""}`}
        >
          {isTranscribing ? (
            <LoaderCircle className="size-6 animate-spin" />
          ) : isRecording ? (
            <Square className="size-6" />
          ) : (
            <Mic className="size-6" />
          )}
        </button>
      </div>

      <p className="mt-3 text-sm text-[var(--color-muted)]" aria-live="polite">
        {statusText}
      </p>
      {speechError ? (
        <p className="mt-2 text-sm text-[var(--color-danger)]" role="status" aria-live="polite">
          {speechError}
        </p>
      ) : null}

      <label className="mt-4 block">
        <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
          <Keyboard className="size-4" />
          {isSpanish ? "Descripcion del incidente" : "Incident description"}
        </span>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={5}
          className="w-full rounded-[1.5rem] border border-[var(--color-border)] bg-transparent px-4 py-3 text-base text-[var(--color-ink)]"
          placeholder={
            isSpanish
              ? "Alguien entro a mi apartamento mientras yo estaba trabajando."
              : "Someone broke into my apartment while I was at work."
          }
        />
      </label>
    </div>
  );
}
