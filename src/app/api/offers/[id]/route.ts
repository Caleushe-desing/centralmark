import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const offer = await prisma.offer.findUnique({
    where: { id },
    include: {
      store: { include: { mall: true } },
      content: true,
      publications: true,
    },
  });

  if (!offer) {
    return NextResponse.json({ error: "Oferta no encontrada" }, { status: 404 });
  }

  return NextResponse.json(offer);
}
