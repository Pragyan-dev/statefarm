import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { getMockPolicyAnalysis, parsePolicyDocument } from "@/lib/parsePolicyAI";
import type { Language } from "@/lib/types";

export const runtime = "nodejs";

const SAMPLE_POLICY_TEXT = `
SafeHome Insurance Renters Policy
Policy Number: SH-2048-5521
Monthly Premium: $17
Expiration Date: 2026-10-01
Personal Property Limit: $20,000
Liability Limit: $100,000
Loss of Use Limit: $5,000
Deductible: $500
Covered losses include theft, fire, smoke, burst pipes, accidental water damage, and temporary housing after a covered loss.
Exclusions include flood, earthquake, bed bugs, pests, and earth movement.
`;

async function extractTextFromPdf(buffer: Buffer) {
  try {
    const { PDFParse } = await import("pdf-parse");
    PDFParse.setWorker(
      pathToFileURL(
        path.join(process.cwd(), "node_modules/pdf-parse/dist/worker/pdf.worker.mjs"),
      ).toString(),
    );
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    return result.text || SAMPLE_POLICY_TEXT;
  } catch (error) {
    console.warn(
      `[arrivesafe-ai:decode-pdf] PDF extraction failed. ${
        error instanceof Error ? error.message : "Unknown PDF parse error"
      }`,
    );
    return SAMPLE_POLICY_TEXT;
  }
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const language = (formData.get("language") as Language | null) ?? "en";
  const demo = formData.get("demo");
  const file = formData.get("file");

  if (demo || !(file instanceof File)) {
    return NextResponse.json(
      getMockPolicyAnalysis(language, {
        aiSource: "local",
        demoMode: true,
        fallbackReason: demo ? "Demo policy selected" : "No document uploaded",
      }),
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      const text = await extractTextFromPdf(buffer);
      const analysis = await parsePolicyDocument(text, "text", language);
      return NextResponse.json(analysis);
    }

    if (file.type.startsWith("image/")) {
      const mimeType = file.type || "image/jpeg";
      const dataUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
      const analysis = await parsePolicyDocument(dataUrl, "image", language);
      return NextResponse.json(analysis);
    }

    return NextResponse.json(
      {
        error: language === "es" ? "Tipo de archivo no soportado" : "Unsupported file type",
      },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      getMockPolicyAnalysis(language, {
        aiSource: "local",
        demoMode: true,
        fallbackReason: error instanceof Error ? error.message : "Decode route failed",
      }),
      { status: 200 },
    );
  }
}
