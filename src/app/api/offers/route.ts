import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const status = request.nextUrl.searchParams.get("status");
  const storeId = request.nextUrl.searchParams.get("storeId");

  const offers = await prisma.offer.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(storeId ? { storeId } : {}),
    },
    include: {
      store: { include: { mall: true } },
      content: true,
      publications: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(offers);
}
