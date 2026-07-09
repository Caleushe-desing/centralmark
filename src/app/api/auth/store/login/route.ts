import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createStoreSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Usuario y contraseña requeridos" }, { status: 400 });
  }

  const store = await prisma.store.findUnique({
    where: { username: username.toLowerCase().trim() },
    include: { mall: true },
  });

  if (!store || !(await bcrypt.compare(password, store.passwordHash))) {
    return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
  }

  await createStoreSession(store.id, store.name);

  return NextResponse.json({
    id: store.id,
    name: store.name,
    username: store.username,
    mall: store.mall.name,
  });
}
