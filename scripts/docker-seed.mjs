/**
 * Seed mínimo para contenedor (sin TypeScript).
 */
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client.js";

const databaseUrl = process.env.DATABASE_URL ?? "file:/app/data/dev.db";
const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
const prisma = new PrismaClient({ adapter });

const DEFAULT_PASSWORD = "tienda123";

async function main() {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  await prisma.mall.upsert({
    where: { id: "demo-mall" },
    update: {
      fixedHashtags: "#CentralMark #Ofertas #MallCentro",
      adminPassword: "admin2026",
      name: "CentralMark Centro",
    },
    create: {
      id: "demo-mall",
      name: "CentralMark Centro",
      tagline: "Centro de Marketing Inteligente",
      primaryColor: "#0F2B5B",
      secondaryColor: "#2563EB",
      fixedHashtags: "#CentralMark #Ofertas #MallCentro",
      adminPassword: "admin2026",
    },
  });

  const stores = [
    {
      id: "store-sneakers",
      name: "Sneaker Zone",
      category: "Calzado deportivo",
      rubro: "footwear",
      username: "1001",
      primaryColor: "#2563EB",
      secondaryColor: "#0F172A",
      customHashtags: "#SneakerZone #Zapatillas",
      templateId: "sport",
    },
    {
      id: "store-fashion",
      name: "Moda Urbana",
      category: "Ropa y accesorios",
      rubro: "fashion",
      username: "1002",
      primaryColor: "#DB2777",
      secondaryColor: "#431407",
      customHashtags: "#ModaUrbana #Fashion",
      templateId: "retro",
    },
    {
      id: "store-tech",
      name: "TechHub",
      category: "Electrónica",
      rubro: "tech",
      username: "1003",
      primaryColor: "#06B6D4",
      secondaryColor: "#0F172A",
      customHashtags: "#TechHub #Tecnologia",
      templateId: "tech",
    },
    {
      id: "store-cafe",
      name: "Café Central",
      category: "Gastronomía",
      rubro: "food",
      username: "1004",
      primaryColor: "#16A34A",
      secondaryColor: "#14532D",
      customHashtags: "#CafeCentral #Gastronomia",
      templateId: "nature",
    },
  ];

  for (const store of stores) {
    await prisma.store.upsert({
      where: { id: store.id },
      update: {
        username: store.username,
        passwordHash,
        primaryColor: store.primaryColor,
        secondaryColor: store.secondaryColor,
        customHashtags: store.customHashtags,
        templateId: store.templateId,
        category: store.category,
        rubro: store.rubro,
      },
      create: {
        ...store,
        passwordHash,
        mallId: "demo-mall",
      },
    });
  }

  console.log("[docker-seed] Mall + tiendas demo listos");
  console.log("[docker-seed] ID 1001 / tienda123 | admin: admin2026");
}

main()
  .catch((err) => {
    console.error("[docker-seed] ERROR", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
