import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createWebAdminSession } from "@/lib/auth/session";
import { ensureSiteCmsSeeded } from "@/lib/cms/site-cms";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  await ensureSiteCmsSeeded();

  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  if (!settings || password !== settings.webAdminPassword) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  await createWebAdminSession(settings.id);
  return NextResponse.json({ ok: true });
}
