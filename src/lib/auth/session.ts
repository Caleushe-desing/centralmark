import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const STORE_COOKIE = "markmall_store_session";
const ADMIN_COOKIE = "markmall_admin_session";
const WEB_ADMIN_COOKIE = "centralmark_web_session";
const SITE_ACCESS_COOKIE = "centralmark_site_access";

function getSecret() {
  const secret = process.env.SESSION_SECRET ?? "markmall-dev-secret-change-in-production";
  return new TextEncoder().encode(secret);
}

/**
 * Cookies Secure solo si la app se sirve por HTTPS.
 * En VPS demo por HTTP (APP_PUBLIC_URL=http://...) deben ir secure:false
 * o el navegador descarta la sesión y vuelve al login.
 */
function cookieSecure(): boolean {
  if (process.env.COOKIE_SECURE === "true") return true;
  if (process.env.COOKIE_SECURE === "false") return false;

  const publicUrl = (process.env.APP_PUBLIC_URL ?? "").trim().toLowerCase();
  if (publicUrl.startsWith("https://")) return true;
  if (publicUrl.startsWith("http://")) return false;

  return process.env.NODE_ENV === "production";
}

function sessionCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
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

export interface WebAdminSession {
  type: "web-admin";
  siteId: string;
}

export interface SiteAccessSession {
  type: "site-access";
}

/** Contraseña de acceso público al sitio (vacío = deshabilitado). */
export function getSiteAccessPassword(): string {
  return (process.env.SITE_ACCESS_PASSWORD ?? "").trim();
}

export function isSiteAccessGateEnabled(): boolean {
  return getSiteAccessPassword().length > 0;
}

export async function createStoreSession(storeId: string, storeName: string) {
  const token = await new SignJWT({ type: "store", storeId, storeName })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(getSecret());

  const jar = await cookies();
  jar.set(STORE_COOKIE, token, sessionCookieOptions(60 * 60 * 24 * 7));
}

export async function createAdminSession(mallId: string) {
  const token = await new SignJWT({ type: "admin", mallId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1d")
    .sign(getSecret());

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, sessionCookieOptions(60 * 60 * 24));
}

export async function createWebAdminSession(siteId = "default") {
  const token = await new SignJWT({ type: "web-admin", siteId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1d")
    .sign(getSecret());

  const jar = await cookies();
  jar.set(WEB_ADMIN_COOKIE, token, sessionCookieOptions(60 * 60 * 24));
}

export async function createSiteAccessSession() {
  const token = await new SignJWT({ type: "site-access" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(getSecret());

  const jar = await cookies();
  jar.set(SITE_ACCESS_COOKIE, token, sessionCookieOptions(60 * 60 * 24 * 30));
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

export async function getWebAdminSession(): Promise<WebAdminSession | null> {
  const jar = await cookies();
  const token = jar.get(WEB_ADMIN_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.type !== "web-admin" || typeof payload.siteId !== "string") return null;
    return { type: "web-admin", siteId: payload.siteId };
  } catch {
    return null;
  }
}

export async function getSiteAccessSession(): Promise<SiteAccessSession | null> {
  const jar = await cookies();
  const token = jar.get(SITE_ACCESS_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.type !== "site-access") return null;
    return { type: "site-access" };
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

export async function clearWebAdminSession() {
  const jar = await cookies();
  jar.delete(WEB_ADMIN_COOKIE);
}

export async function clearSiteAccessSession() {
  const jar = await cookies();
  jar.delete(SITE_ACCESS_COOKIE);
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

export async function requireWebAdminSession() {
  const session = await getWebAdminSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
