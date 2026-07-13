import { NextResponse } from "next/server";
import { getMetaConfigStatus as getMetaStatus } from "@/lib/meta/publisher";
import { isFtpConfigured } from "@/lib/ftp/upload";
import { isOpenAIConfigured } from "@/lib/openai/client";

export async function GET() {
  return NextResponse.json({
    ...getMetaStatus(),
    hasOpenAI: isOpenAIConfigured(),
    hasFtp: isFtpConfigured(),
  });
}
