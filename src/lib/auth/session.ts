import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const STORE_COOKIE = "markmall_store_session";
const ADMIN_COOKIE = "markmall_admin_session";

function getSecret() {
  const secret = process.env.SESSION_SECRET ?? "markmall-dev-secret-change-in-production";
  return new TextEncoder().encode(secret);
}

export interface StoreSession {
  type: "store";
  storeId: string;
  storeName: string;
}

export interface AdminSession {
  type: "admin";
  mallId: string;
}

export async function createStoreSession(storeId: string, storeName: string) {
  const token = await new SignJWT({ type: "store", storeId, storeName })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(getSecret());

  const jar = await cookies();
  jar.set(STORE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function createAdminSession(mallId: string) {
  const token = await new SignJWT({ type: "admin", mallId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1d")
    .sign(getSecret());

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export async function getStoreSession(): Promise<StoreSession | null> {
  const jar = await cookies();
  const token = jar.get(STORE_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.type !== "store" || typeof payload.storeId !== "string") return null;
    return {
      type: "store",
      storeId: payload.storeId,
      storeName: String(payload.storeName ?? ""),
    };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.type !== "admin" || typeof payload.mallId !== "string") return null;
    return { type: "admin", mallId: payload.mallId };
  } catch {
    return null;
  }
}

export async function clearStoreSession() {
  const jar = await cookies();
  jar.delete(STORE_COOKIE);
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

export async function requireStoreSession() {
  const session = await getStoreSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
