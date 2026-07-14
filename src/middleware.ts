import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const STORE_COOKIE = "markmall_store_session";
const ADMIN_COOKIE = "markmall_admin_session";
const WEB_ADMIN_COOKIE = "centralmark_web_session";

function getSecret() {
  const secret = process.env.SESSION_SECRET ?? "markmall-dev-secret-change-in-production";
  return new TextEncoder().encode(secret);
}

async function hasValidStoreSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(STORE_COOKIE)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.type === "store" && typeof payload.storeId === "string";
  } catch {
    return false;
  }
}

async function hasValidAdminSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.type === "admin" && typeof payload.mallId === "string";
  } catch {
    return false;
  }
}

async function hasValidWebAdminSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(WEB_ADMIN_COOKIE)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.type === "web-admin" && typeof payload.siteId === "string";
  } catch {
    return false;
  }
}

/**
 * Protege rutas de tienda/admin/web-admin sin forzar hard reloads.
 * Sesión válida → NextResponse.next() (sin redirect redundante).
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Portal tienda
  if (pathname === "/tienda/login") {
    if (await hasValidStoreSession(request)) {
      return NextResponse.redirect(new URL("/tienda", request.url));
    }
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/tienda") ||
    pathname.startsWith("/gestor-publicaciones")
  ) {
    if (await hasValidStoreSession(request)) {
      return NextResponse.next();
    }
    const login = new URL("/tienda/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  // Panel admin del mall
  if (pathname === "/admin/login") {
    if (await hasValidAdminSession(request)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (await hasValidAdminSession(request)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Admin de la web / CMS (independiente del mall)
  if (pathname === "/web-admin/login") {
    if (await hasValidWebAdminSession(request)) {
      return NextResponse.redirect(new URL("/web-admin", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/web-admin")) {
    if (await hasValidWebAdminSession(request)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/web-admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/tienda",
    "/tienda/:path*",
    "/gestor-publicaciones",
    "/gestor-publicaciones/:path*",
    "/admin",
    "/admin/:path*",
    "/web-admin",
    "/web-admin/:path*",
  ],
};
