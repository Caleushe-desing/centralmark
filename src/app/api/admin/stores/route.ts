import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth/session";

function generateLoginId(existing: string[]): string {
  const used = new Set(existing);
  // Prefer sequential 4–6 digit IDs starting at 1001
  for (let n = 1001; n < 999999; n++) {
    const id = String(n);
    if (!used.has(id) && !used.has(id.toLowerCase())) return id;
  }
  return `u${Date.now().toString().slice(-8)}`;
}

function generatePassword(length = 10): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let out = "";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  for (let i = 0; i < length; i++) out += alphabet[bytes[i]! % alphabet.length];
  return out;
}

export async function GET() {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const stores = await prisma.store.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: {
        select: {
          offers: true,
          designJobs: true,
          products: true,
        },
      },
    },
  });

  return NextResponse.json({
    stores: stores.map((s) => ({
      id: s.id,
      name: s.name,
      username: s.username,
      category: s.category,
      rubro: s.rubro,
      createdAt: s.createdAt,
      offersCount: s._count.offers,
      designJobsCount: s._count.designJobs,
      productsCount: s._count.products,
    })),
  });
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await request.json();
  const name = String(body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  }

  const category = String(body.category ?? "Tienda departamental").trim() || "Tienda departamental";
  const rubro = String(body.rubro ?? "fashion").trim() || "fashion";

  const mall = await prisma.mall.findFirst();
  if (!mall) {
    return NextResponse.json({ error: "Mall no configurado" }, { status: 500 });
  }

  const existing = await prisma.store.findMany({ select: { username: true } });
  const loginId = generateLoginId(existing.map((e) => e.username));
  const password = generatePassword(10);
  const passwordHash = await bcrypt.hash(password, 10);

  const store = await prisma.store.create({
    data: {
      name,
      category,
      rubro,
      username: loginId,
      passwordHash,
      mallId: mall.id,
      primaryColor: "#2F6BFF",
      secondaryColor: "#0B1B4D",
    },
  });

  return NextResponse.json({
    store: {
      id: store.id,
      name: store.name,
      username: store.username,
      category: store.category,
      rubro: store.rubro,
    },
    credentials: {
      loginId: store.username,
      password,
    },
  });
}
