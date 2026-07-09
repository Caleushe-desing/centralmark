import { NextResponse } from "next/server";
import { getMetaConfigStatus as getMetaStatus } from "@/lib/meta/publisher";
import { isFtpConfigured } from "@/lib/ftp/upload";

export async function GET() {
  return NextResponse.json({
    ...getMetaStatus(),
    hasFtp: isFtpConfigured(),
  });
}
