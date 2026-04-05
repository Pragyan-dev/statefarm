import { NextRequest, NextResponse } from "next/server";

import { buildAutoEstimate } from "@/lib/autoEstimateAI";
import type { Language } from "@/lib/types";

export const runtime = "nodejs";

function parseNumber(value: FormDataEntryValue | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const language = (formData.get("language") as Language | null) ?? "en";
  const imageFiles = [...formData.getAll("images"), formData.get("image")]
    .filter((value): value is File => value instanceof File && value.type.startsWith("image/"))
    .slice(0, 2);
  const imageDataUrls = await Promise.all(
    imageFiles.map(async (image) => {
      const buffer = Buffer.from(await image.arrayBuffer());
      return `data:${image.type || "image/jpeg"};base64,${buffer.toString("base64")}`;
    }),
  );

  const result = await buildAutoEstimate({
    language,
    imageDataUrls,
    input: {
      make: String(formData.get("make") ?? "").trim() || undefined,
      model: String(formData.get("model") ?? "").trim() || undefined,
      year: formData.get("year") ? parseNumber(formData.get("year"), 2018) : undefined,
      accidents: formData.get("accidents") ? parseNumber(formData.get("accidents"), 0) : undefined,
      annualMileage: formData.get("annualMileage") ? parseNumber(formData.get("annualMileage"), 9000) : undefined,
      useType: (formData.get("useType") as "commute" | "student" | "family" | "occasional" | null) ?? "commute",
      state: String(formData.get("state") ?? "AZ"),
      zip: String(formData.get("zip") ?? ""),
    },
  });

  return NextResponse.json(result);
}
