"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { useAccessibility } from "@/hooks/useAccessibility";
import type { Speaker } from "@/types/simulator";

function useTypewriter(text: string, speed = 30) {
  const renderImmediately = speed <= 1;
  const [displayed, setDisplayed] = useState(() => (renderImmediately ? text : ""));
  const [isDone, setIsDone] = useState(() => renderImmediately || !text);

  useEffect(() => {
    if (!text || renderImmediately) {
      return;
    }

    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setDisplayed(text.slice(0, index));
      if (index >= text.length) {
        window.clearInterval(timer);
        setIsDone(true);
      }
    }, speed);

    return () => window.clearInterval(timer);
  }, [renderImmediately, speed, text]);

  const skip = () => {
    setDisplayed(text);
    setIsDone(true);
  };

  return { displayed, isDone, skip };
}

interface DialogueBoxProps {
  speaker: Speaker;
  text: string;
  onAdvance?: () => void;
  canAdvance?: boolean;
  allowTextTapAdvance?: boolean;
  onTypingChange?: (done: boolean) => void;
  children?: React.ReactNode;
}

export function DialogueBox({
  speaker,
  text,
  onAdvance,
  canAdvance = false,
  allowTextTapAdvance = false,
  onTypingChange,
  children,
}: DialogueBoxProps) {
  const t = useTranslations();
  const { settings } = useAccessibility();
  const typeSpeed = settings.reducedMotion ? 1 : 30;
  const { displayed, isDone, skip } = useTypewriter(text, typeSpeed);

  useEffect(() => {
    onTypingChange?.(isDone);
  }, [isDone, onTypingChange]);

  const speakerLabel = useMemo(() => {
    if (speaker !== "safi") {
      return null;
    }

    return t("simulatorSafi");
  }, [speaker, t]);

  function handleTextTap() {
    if (!isDone) {
      skip();
      return;
    }

    if (allowTextTapAdvance && canAdvance && onAdvance) {
      onAdvance();
    }
  }

  return (
    <section className="sim-dialog-panel sim-dialog-enter flex h-[44dvh] flex-col rounded-t-[1.75rem] border-[2px] border-b-0 border-black bg-white px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3 shadow-[0_-18px_60px_rgba(17,24,39,0.16)]">
      <div className="mb-3 flex min-h-6 items-center justify-between gap-3">
        {speakerLabel ? (
          <span className="rounded-full bg-black px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-white">
            {speakerLabel}
          </span>
        ) : (
          <span />
        )}
      </div>

      <div
        className={`flex-1 overflow-hidden rounded-[1.25rem] border border-black/10 text-left ${
          speaker === "system" ? "bg-stone-50" : "bg-white"
        }`}
      >
        <div className="flex h-full flex-col overflow-hidden px-4 py-4">
          <div className="flex-1 overflow-y-auto overscroll-contain pr-1">
            <button
              type="button"
              onClick={handleTextTap}
              className="w-full text-left"
            >
              <p
                className={`text-[15px] leading-7 text-black ${
                  speaker === "system" ? "font-mono text-[14px] tracking-[0.01em]" : ""
                }`}
              >
                {displayed}
              </p>

              {isDone && allowTextTapAdvance && canAdvance ? (
                <div className="mt-3 flex justify-end">
                  <span className="sim-continue-indicator text-sm font-bold text-black">▼</span>
                </div>
              ) : null}
            </button>

            {children ? <div className="mt-4 grid gap-3">{children}</div> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
