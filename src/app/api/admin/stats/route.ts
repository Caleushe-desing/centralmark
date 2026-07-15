import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth/session";

export async function GET() {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    storeCount,
    offerByStatus,
    offersLast7d,
    designJobsLast7d,
    publishedTotal,
    stores,
  ] = await Promise.all([
    prisma.store.count(),
    prisma.offer.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.offer.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.designGenerationJob.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.offer.count({ where: { status: "PUBLISHED" } }),
    prisma.store.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        username: true,
        offers: {
          select: { status: true, createdAt: true },
        },
        designJobs: {
          select: { status: true, createdAt: true },
        },
      },
    }),
  ]);

  const byStore = stores.map((s) => {
    const offers = s.offers;
    const published = offers.filter((o) => o.status === "PUBLISHED").length;
    const pending = offers.filter((o) => o.status === "PENDING").length;
    const last7 = offers.filter((o) => o.createdAt >= sevenDaysAgo).length;
    return {
      id: s.id,
      name: s.name,
      loginId: s.username,
      offersTotal: offers.length,
      published,
      pending,
      offersLast7d: last7,
      designJobs: s.designJobs.length,
      designJobsLast7d: s.designJobs.filter((j) => j.createdAt >= sevenDaysAgo).length,
    };
  });

  return NextResponse.json({
    summary: {
      stores: storeCount,
      publishedTotal,
      offersLast7d,
      designJobsLast7d,
      offersByStatus: Object.fromEntries(
        offerByStatus.map((o) => [o.status, o._count._all])
      ),
    },
    byStore,
    generatedAt: new Date().toISOString(),
  });
}
