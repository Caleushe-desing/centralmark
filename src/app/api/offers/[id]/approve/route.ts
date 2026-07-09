import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth/session";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;

  const offer = await prisma.offer.update({
    where: { id },
    data: { status: "APPROVED" },
    include: {
      store: { include: { mall: true } },
      content: true,
    },
  });

  return NextResponse.json(offer);
}
