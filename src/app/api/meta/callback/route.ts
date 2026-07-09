import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { completeMetaOAuth, verifyOAuthState } from "@/lib/meta/oauth";

function redirectConfig(params: Record<string, string>) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url = new URL("/tienda/configuracion", base.replace(/\/$/, ""));
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return NextResponse.redirect(url.toString());
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error_description") ?? searchParams.get("error");

  if (error) {
    return redirectConfig({ meta_error: error });
  }

  if (!code || !state) {
    return redirectConfig({ meta_error: "Faltan parámetros de Meta" });
  }

  const storeId = await verifyOAuthState(state);
  if (!storeId) {
    return redirectConfig({ meta_error: "Sesión OAuth expirada, intenta de nuevo" });
  }

  try {
    const pages = await completeMetaOAuth(code);

    if (pages.length === 0) {
      return redirectConfig({
        meta_error:
          "Meta autorizó la app pero la API no devolvió páginas. En developers.facebook.com → app Markmall → Permisos: activa «Acceso avanzado» en business_management y pages_show_list. Luego reconecta marcando negocio + página.",
      });
    }

    const withIg = pages.filter((p) => p.igAccountId);

    if (withIg.length === 1) {
      const p = withIg[0];
      await prisma.storeSocialAccount.upsert({
        where: { storeId },
        create: {
          storeId,
          metaPageId: p.pageId,
          metaPageName: p.pageName,
          metaIgAccountId: p.igAccountId!,
          metaIgUsername: p.igUsername,
          metaAccessToken: p.pageAccessToken,
          connectedAt: new Date(),
        },
        update: {
          metaPageId: p.pageId,
          metaPageName: p.pageName,
          metaIgAccountId: p.igAccountId!,
          metaIgUsername: p.igUsername,
          metaAccessToken: p.pageAccessToken,
          connectedAt: new Date(),
        },
      });
      return redirectConfig({ meta_success: "1" });
    }

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const pending = await prisma.metaOAuthPending.create({
      data: {
        storeId,
        pagesJson: JSON.stringify(withIg.length > 0 ? withIg : pages),
        expiresAt,
      },
    });

    return redirectConfig({ meta_pick: pending.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error conectando con Meta";
    return redirectConfig({ meta_error: msg });
  }
}
