import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createAdminSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const mall = await prisma.mall.findFirst();

  if (!mall || password !== mall.adminPassword) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  await createAdminSession(mall.id);
  return NextResponse.json({ mall: mall.name });
}
