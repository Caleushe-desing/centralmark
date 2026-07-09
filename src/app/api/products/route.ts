import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStoreSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await requireStoreSession();
    const products = await prisma.product.findMany({
      where: { storeId: session.storeId, active: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireStoreSession();
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || null;
    const price = formData.get("price") ? parseFloat(formData.get("price") as string) : null;
    const category = (formData.get("category") as string) || null;
    const image = formData.get("image") as File | null;
    const imageUrlParam = (formData.get("imageUrl") as string) || null;
    const imageNoBgUrlParam = (formData.get("imageNoBgUrl") as string) || null;

    if (!name || (!image?.size && !imageNoBgUrlParam)) {
      return NextResponse.json({ error: "Nombre e imagen requeridos" }, { status: 400 });
    }

    let imageUrl: string;
    let imageNoBgUrl: string;

    if (imageUrlParam && imageNoBgUrlParam) {
      imageUrl = imageUrlParam;
      imageNoBgUrl = imageNoBgUrlParam;
    } else if (image?.size) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = image.name.split(".").pop() ?? "jpg";
      const filename = `product-${Date.now()}.${ext}`;

      const fs = await import("fs/promises");
      const path = await import("path");
      const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(path.join(uploadDir, filename), buffer);

      imageUrl = `/uploads/products/${filename}`;

      const { removeProductBackground } = await import("@/lib/image/remove-background");
      const { outputPath } = await removeProductBackground(buffer, filename, "products");
      imageNoBgUrl = outputPath;
    } else {
      return NextResponse.json({ error: "Imagen requerida" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        storeId: session.storeId,
        name,
        description,
        price,
        category,
        imageUrl,
        imageNoBgUrl,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
