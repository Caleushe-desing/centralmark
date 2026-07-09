import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const now = new Date();

  const offers = await prisma.offer.findMany({
    where: {
      status: { in: ["APPROVED", "PUBLISHED"] },
      startDate: { lte: now },
      endDate: { gte: now },
    },
    include: {
      store: { include: { mall: true } },
      content: true,
    },
    orderBy: { discountPercent: "desc" },
  });

  const mall = await prisma.mall.findFirst();

  return NextResponse.json({ mall, offers });
}
