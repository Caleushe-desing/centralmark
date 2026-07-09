import { NextResponse } from "next/server";
import { VISUAL_TEMPLATES } from "@/lib/templates";

export async function GET() {
  return NextResponse.json(VISUAL_TEMPLATES);
}
