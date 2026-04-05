import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.redirect(new URL("/newcomer-guide", "http://localhost"), 307);
}
