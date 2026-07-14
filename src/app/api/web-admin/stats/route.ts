import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { requireWebAdminSession } from "@/lib/auth/session";

async function dirSizeBytes(dir: string): Promise<number> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    let total = 0;
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        total += await dirSizeBytes(full);
      } else if (entry.isFile()) {
        const st = await fs.stat(full);
        total += st.size;
      }
    }
    return total;
  } catch {
    return 0;
  }
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(2)} GB`;
}

export async function GET() {
  try {
    await requireWebAdminSession();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    mallCount,
    storeCount,
    productCount,
    offerCounts,
    designJobCounts,
    recentOffers,
    recentJobs,
    costAgg,
    proAdCost,
  ] = await Promise.all([
    prisma.mall.count(),
    prisma.store.count(),
    prisma.product.count(),
    prisma.offer.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.designGenerationJob.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.offer.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.designGenerationJob.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.designGenerationJob.aggregate({ _sum: { costUsd: true }, _count: { _all: true } }),
    prisma.proAdGeneration.aggregate({ _sum: { costUsd: true }, _count: { _all: true } }),
  ]);

  const cwd = process.cwd();
  const [uploadsBytes, generatedBytes, landingBytes, dbBytes] = await Promise.all([
    dirSizeBytes(path.join(cwd, "public", "uploads")),
    dirSizeBytes(path.join(cwd, "public", "generated")),
    dirSizeBytes(path.join(cwd, "public", "landing")),
    (async () => {
      const candidates = [
        path.join(cwd, "prisma", "dev.db"),
        path.join(cwd, "data", "centralmark.db"),
        path.join(cwd, "prisma", "centralmark.db"),
      ];
      for (const c of candidates) {
        try {
          const st = await fs.stat(c);
          if (st.isFile()) return st.size;
        } catch {
          /* try next */
        }
      }
      return 0;
    })(),
  ]);

  const mem = process.memoryUsage();
  const offersByStatus = Object.fromEntries(
    offerCounts.map((o) => [o.status, o._count._all])
  );
  const jobsByStatus = Object.fromEntries(
    designJobCounts.map((j) => [j.status, j._count._all])
  );

  return NextResponse.json({
    product: {
      malls: mallCount,
      stores: storeCount,
      products: productCount,
      offersByStatus,
      offersTotal: Object.values(offersByStatus).reduce((a, b) => a + b, 0),
      designJobsByStatus: jobsByStatus,
      designJobsTotal: Object.values(jobsByStatus).reduce((a, b) => a + b, 0),
      offersLast7d: recentOffers,
      designJobsLast7d: recentJobs,
      designEngineCostUsd: costAgg._sum.costUsd ?? 0,
      designEngineJobs: costAgg._count._all,
      proAdCostUsd: proAdCost._sum.costUsd ?? 0,
      proAdJobs: proAdCost._count._all,
    },
    server: {
      nodeVersion: process.version,
      platform: process.platform,
      uptimeSeconds: Math.round(process.uptime()),
      memory: {
        rss: mem.rss,
        heapUsed: mem.heapUsed,
        heapTotal: mem.heapTotal,
        rssLabel: formatBytes(mem.rss),
        heapUsedLabel: formatBytes(mem.heapUsed),
        heapTotalLabel: formatBytes(mem.heapTotal),
      },
      disk: {
        uploadsBytes,
        uploadsLabel: formatBytes(uploadsBytes),
        generatedBytes,
        generatedLabel: formatBytes(generatedBytes),
        landingBytes,
        landingLabel: formatBytes(landingBytes),
        databaseBytes: dbBytes,
        databaseLabel: formatBytes(dbBytes),
      },
      env: {
        nodeEnv: process.env.NODE_ENV ?? "unknown",
        publicUrl: process.env.APP_PUBLIC_URL ?? null,
      },
    },
    generatedAt: new Date().toISOString(),
  });
}
