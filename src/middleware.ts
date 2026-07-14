import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const STORE_COOKIE = "markmall_store_session";
const ADMIN_COOKIE = "markmall_admin_session";
const WEB_ADMIN_COOKIE = "centralmark_web_session";
const SITE_ACCESS_COOKIE = "centralmark_site_access";

function getSecret() {
  const secret = process.env.SESSION_SECRET ?? "markmall-dev-secret-change-in-production";
  return new TextEncoder().encode(secret);
}

function siteGateEnabled(): boolean {
  return (process.env.SITE_ACCESS_PASSWORD ?? "").trim().length > 0;
}

async function hasValidSiteAccess(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SITE_ACCESS_COOKIE)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.type === "site-access";
  } catch {
    return false;
  }
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

function isPublicAsset(pathname: string): boolean {
  if (pathname.startsWith("/_next")) return true;
  if (pathname === "/favicon.ico") return true;
  if (pathname.startsWith("/brand/")) return true;
  if (pathname.startsWith("/landing/")) return true;
  if (pathname.startsWith("/rubros/")) return true;
  if (pathname.startsWith("/uploads/")) return true;
  if (pathname.startsWith("/generated/")) return true;
  return /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|woff2?)$/i.test(pathname);
}

/**
 * 1) Gate de acceso al sitio (si SITE_ACCESS_PASSWORD está configurada)
 * 2) Protege tienda / admin mall / admin web
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ——— Gate privado del sitio ———
  if (siteGateEnabled() && !isPublicAsset(pathname)) {
    const isGatePage = pathname === "/acceso";
    const isGateApi = pathname.startsWith("/api/auth/site-access");

    if (isGatePage || isGateApi) {
      if (isGatePage && (await hasValidSiteAccess(request))) {
        return NextResponse.redirect(new URL("/", request.url));
      }
      return NextResponse.next();
    }

    if (!(await hasValidSiteAccess(request))) {
      const acceso = new URL("/acceso", request.url);
      acceso.searchParams.set("next", pathname);
      return NextResponse.redirect(acceso);
    }
  }

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

  // Admin de la web / CMS
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
    /*
     * Todo excepto estáticos de Next. El gate decide qué dejan pasar.
     */
    "/((?!_next/static|_next/image).*)",
  ],
};
