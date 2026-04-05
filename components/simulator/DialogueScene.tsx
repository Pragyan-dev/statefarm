"use client";

import type { ReactNode } from "react";

import { DialogueText } from "@/components/simulator/DialogueText";
import { Mascot } from "@/components/simulator/Mascot";
import { SpeechBubble } from "@/components/simulator/SpeechBubble";
import type { DialogueMascot, Speaker } from "@/types/simulator";

interface DialogueSceneProps {
  dialogueKey: string;
  speaker: Speaker;
  speakerLabel: string;
  text: string;
  mascot: Required<Pick<DialogueMascot, "src" | "alt" | "width" | "height">> & {
    mood?: string;
  };
  canAdvance?: boolean;
  allowTextTapAdvance?: boolean;
  onAdvance?: () => void;
  onTypingChange?: (done: boolean) => void;
  children?: ReactNode;
  footer?: ReactNode;
}

export function DialogueScene({
  dialogueKey,
  speaker,
  speakerLabel,
  text,
  mascot,
  canAdvance = false,
  allowTextTapAdvance = false,
  onAdvance,
  onTypingChange,
  children,
  footer,
}: DialogueSceneProps) {
  return (
    <div className="relative mx-auto flex w-full max-w-[min(1440px,100%)] flex-1 items-center py-4 sm:py-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-[12%] h-40 w-40 rounded-full bg-[rgba(255,255,255,0.55)] blur-3xl" />
        <div className="absolute right-[10%] top-[8%] h-44 w-44 rounded-full bg-[rgba(161,201,117,0.18)] blur-3xl" />
        <div className="absolute bottom-[8%] left-[26%] h-32 w-48 rounded-full bg-[rgba(17,24,39,0.06)] blur-3xl" />
      </div>

      <div className="relative z-10 grid w-full gap-6 lg:grid-cols-[minmax(260px,340px)_minmax(0,1fr)] lg:items-end lg:gap-14 xl:grid-cols-[minmax(300px,380px)_minmax(0,1fr)]">
        <div className="flex justify-center lg:justify-start">
          <div className="relative w-full max-w-[15rem] sm:max-w-[17rem] lg:max-w-[20rem] xl:max-w-[22rem]">
            <div className="absolute bottom-5 left-1/2 h-7 w-[72%] -translate-x-1/2 rounded-full bg-black/12 blur-xl" />
            <div className="absolute inset-x-[15%] bottom-6 h-20 rounded-full bg-[radial-gradient(circle,rgba(161,201,117,0.22),transparent_70%)] blur-2xl" />
            <Mascot
              mascotImage={mascot.src}
              alt={mascot.alt}
              width={mascot.width}
              height={mascot.height}
              mood={mascot.mood}
              className="relative z-10 aspect-[5/6] w-full"
              priority
            />
          </div>
        </div>

        <div className="min-w-0 lg:-translate-y-8">
          <SpeechBubble
            label={speakerLabel}
            tone={speaker === "system" ? "system" : "default"}
            footer={footer}
            contentKey={dialogueKey}
          >
            <DialogueText
              key={dialogueKey}
              speaker={speaker}
              text={text}
              canAdvance={canAdvance}
              allowTapAdvance={allowTextTapAdvance}
              onAdvance={onAdvance}
              onTypingChange={onTypingChange}
            />
            {children ? <div className="grid gap-3 md:gap-4">{children}</div> : null}
          </SpeechBubble>
        </div>
      </div>
    </div>
  );
}
