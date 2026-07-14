import { NextRequest, NextResponse } from "next/server";
import {
  createSiteAccessSession,
  getSiteAccessPassword,
  isSiteAccessGateEnabled,
} from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  if (!isSiteAccessGateEnabled()) {
    return NextResponse.json({ ok: true, gateDisabled: true });
  }

  const { password } = await request.json();
  const expected = getSiteAccessPassword();
  if (typeof password !== "string" || password !== expected) {
    return NextResponse.json({ error: "Clave incorrecta" }, { status: 401 });
  }

  await createSiteAccessSession();
  return NextResponse.json({ ok: true });
}
