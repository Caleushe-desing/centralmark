import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const SAFE_NAME = /^ad-\d+\.png$/;

export async function GET(
  _request: Request,
  context: { params: Promise<{ filename: string }> }
) {
  const { filename } = await context.params;
  if (!SAFE_NAME.test(filename)) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), "public", "generated", "ad-images", filename);

  try {
    const buffer = await fs.readFile(filePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }
}
