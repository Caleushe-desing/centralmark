import { NextRequest, NextResponse } from "next/server";
import { requireStoreSession } from "@/lib/auth/session";
import { moderateUserContent } from "@/lib/ai/moderation";

export async function POST(request: NextRequest) {
  try {
    await requireStoreSession();
    const body = await request.json();

    const result = await moderateUserContent({
      productName: body.productName,
      description: body.description,
      offerHashtags: body.offerHashtags,
      aiBrief: body.aiBrief,
    });

    if (!result.approved) {
      return NextResponse.json(
        { approved: false, issues: result.issues },
        { status: 422 }
      );
    }

    return NextResponse.json({
      approved: true,
      corrected: result.fields,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
