import { NextRequest, NextResponse } from "next/server";

import { decodePolicyText } from "@/lib/ai";
import {
  getOpenRouterHeaders,
  getOpenRouterImageModel,
  OPENROUTER_URL,
} from "@/lib/openrouter";
import type { Language } from "@/lib/types";

export const runtime = "nodejs";

const samplePolicyText = `
State Farm Renters Insurance
Premium: $17 per month
Deductible: $500
Covered losses include theft, fire, vandalism, burst pipes, and accidental water damage.
Exclusions include flood, earthquake, pest damage, and normal wear and tear.
Policy expires December 1, 2026.
`;

async function extractTextFromPdf(buffer: Buffer) {
  try {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    return result.text;
  } catch {
    return samplePolicyText;
  }
}

async function extractTextFromImage(buffer: Buffer, type: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.warn("[arrivesafe-ai:decode-image] OPENROUTER_API_KEY missing. Using sample policy text.");
    return samplePolicyText;
  }

  const dataUrl = `data:${type};base64,${buffer.toString("base64")}`;
  const model = getOpenRouterImageModel();

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: getOpenRouterHeaders(apiKey),
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract the text from this insurance policy image. Respond only with the text you can read.",
            },
            {
              type: "image_url",
              image_url: {
                url: dataUrl,
              },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.warn(
      `[arrivesafe-ai:decode-image] OpenRouter OCR failed for ${model}. ${errorText}`,
    );
    return samplePolicyText;
  }

  console.info(
    `[arrivesafe-ai:decode-image] OpenRouter OCR succeeded with ${model}.`,
  );

  const payload = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string | Array<{ type?: string; text?: string }>;
      };
    }>;
  };

  const raw = payload.choices?.[0]?.message?.content;
  return typeof raw === "string"
    ? raw
    : raw?.map((item) => item.text ?? "").join("\n") || samplePolicyText;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const language = (formData.get("language") as Language | null) ?? "en";
  const demo = formData.get("demo");
  const file = formData.get("file");

  try {
    let text = samplePolicyText;

    if (!demo && file instanceof File) {
      const buffer = Buffer.from(await file.arrayBuffer());

      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        text = await extractTextFromPdf(buffer);
      } else if (file.type.startsWith("image/")) {
        text = await extractTextFromImage(buffer, file.type);
      }
    }

    const summary = await decodePolicyText({
      text,
      language,
    });

    return NextResponse.json(summary);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Decode failed",
      },
      { status: 500 },
    );
  }
}
