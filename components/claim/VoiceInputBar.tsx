"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, Mic, Square } from "lucide-react";

import { useAccessibility } from "@/hooks/useAccessibility";

function getPreferredMimeType() {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") {
    return "";
  }

  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/mpeg"];
  return candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate)) ?? "";
}

export function VoiceInputBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { settings } = useAccessibility();
  const isSpanish = settings.language === "es";
  const [isSupported, setIsSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const baseValueRef = useRef(value);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setIsSupported(
      typeof navigator !== "undefined" &&
        typeof window !== "undefined" &&
        !!navigator.mediaDevices?.getUserMedia &&
        "MediaRecorder" in window,
    );
  }, []);

  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stop?.();
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  function stopStream() {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    mediaRecorderRef.current = null;
  }

  async function transcribeAudio(audioBlob: Blob) {
    if (!audioBlob.size) {
      setError(
        isSpanish
          ? "No captamos audio. Intenta otra vez y habla mas cerca del microfono."
          : "We did not capture audio. Try again and speak closer to the microphone.",
      );
      return;
    }

    setIsProcessing(true);

    try {
      const extension = audioBlob.type.includes("mp4")
        ? "mp4"
        : audioBlob.type.includes("mpeg")
          ? "mp3"
          : "webm";
      const file = new File([audioBlob], `claim-guide.${extension}`, {
        type: audioBlob.type || "audio/webm",
      });
      const formData = new FormData();
      formData.append("file", file);
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

      onChange([baseValueRef.current.trim(), transcript].filter(Boolean).join(" ").trim());
      setError(null);
      inputRef.current?.focus();
    } catch (transcriptionError) {
      setError(
        transcriptionError instanceof Error && transcriptionError.message !== "empty_transcript"
          ? transcriptionError.message
          : isSpanish
            ? "No pudimos transcribir tu voz. Puedes escribir lo que paso."
            : "We could not transcribe your voice. You can type what happened instead.",
      );
    } finally {
      setIsProcessing(false);
      chunksRef.current = [];
    }
  }

  async function startRecording() {
    if (!isSupported || isProcessing) {
      return;
    }

    try {
      setError(null);
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
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        setError(
          isSpanish
            ? "No pudimos grabar el audio. Revisa el permiso del microfono."
            : "We could not record audio. Check your microphone permission.",
        );
        setIsRecording(false);
        stopStream();
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, {
          type: recorder.mimeType || mimeType || "audio/webm",
        });
        setIsRecording(false);
        stopStream();
        void transcribeAudio(audioBlob);
      };

      mediaRecorderRef.current = recorder;
      mediaStreamRef.current = stream;
      recorder.start(250);
      setIsRecording(true);
    } catch {
      setError(
        isSpanish
          ? "No pudimos iniciar el microfono. Revisa los permisos del navegador."
          : "We could not start the microphone. Check your browser permissions.",
      );
      setIsRecording(false);
      stopStream();
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      return;
    }

    recorder.stop();
  }

  const statusText = isProcessing
    ? isSpanish
      ? "Procesando..."
      : "Processing..."
    : isRecording
      ? isSpanish
        ? "Escuchando..."
        : "Listening..."
      : "";

  return (
    <section className="panel-card overflow-hidden">
      <div className="space-y-4">
        <div>
          <p className="eyebrow">{isSpanish ? "Descripcion libre" : "Describe it yourself"}</p>
          <h2 className="mt-2 font-display text-2xl leading-tight text-[var(--color-ink)]">
            {isSpanish ? "O cuentanos lo que paso" : "Or describe what happened"}
          </h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            {isSpanish
              ? "Habla y luego toca otra vez para pegar el texto, o escribe abajo."
              : "Speak, then tap again to paste the transcript, or type below."}
          </p>
        </div>

        <div className="rounded-[1.6rem] border border-[var(--color-border)] bg-white/75 p-3 shadow-[0_12px_24px_rgba(17,24,39,0.06)]">
          <div className="flex items-end gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-2 min-h-6" aria-live="polite">
                {isRecording ? (
                  <div className="flex items-center gap-1 text-[var(--color-danger)]">
                    <span className="text-sm font-semibold">{statusText}</span>
                    <div className="ml-2 flex items-end gap-1">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <span
                          key={index}
                          className="claim-wave-bar"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        />
                      ))}
                    </div>
                  </div>
                ) : isProcessing ? (
                  <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-muted)]">
                    <LoaderCircle className="size-4 animate-spin" />
                    <span>{statusText}</span>
                  </div>
                ) : (
                  <span className="text-sm text-[var(--color-muted)]">
                    {isSpanish
                      ? "O describe que paso..."
                      : "Or describe what happened..."}
                  </span>
                )}
              </div>

              <textarea
                ref={inputRef}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                rows={4}
                className="min-h-[6.5rem] w-full resize-none bg-transparent text-base text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)]"
                placeholder={
                  isSpanish
                    ? "Ejemplo: alguien golpeo mi carro por atras en un semaforo y ahora no se si debo moverlo."
                    : "Example: someone rear-ended my car at a stoplight and now I don’t know if I should move it."
                }
              />
            </div>

            <button
              type="button"
              onClick={isRecording ? stopRecording : () => void startRecording()}
              disabled={!isSupported || isProcessing}
              aria-label={
                isRecording
                  ? isSpanish
                    ? "Detener grabacion"
                    : "Stop recording"
                  : isSpanish
                    ? "Grabar descripcion"
                    : "Record description"
              }
              className={`inline-flex size-14 shrink-0 items-center justify-center rounded-full text-white transition ${
                isRecording
                  ? "claim-mic-recording bg-[var(--color-danger)]"
                  : "bg-[var(--color-ink)] shadow-[0_12px_24px_rgba(17,24,39,0.16)]"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {isProcessing ? (
                <LoaderCircle className="size-5 animate-spin" />
              ) : isRecording ? (
                <Square className="size-5" />
              ) : (
                <Mic className="size-5" />
              )}
            </button>
          </div>
        </div>

        {error ? (
          <p className="text-sm text-[var(--color-danger)]" role="status" aria-live="polite">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}
