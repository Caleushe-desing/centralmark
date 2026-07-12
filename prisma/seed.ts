import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

const DEFAULT_PASSWORD = "tienda123";

async function main() {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const mall = await prisma.mall.upsert({
    where: { id: "demo-mall" },
    update: {
      fixedHashtags: "#MarkMall #Ofertas #MallCentro",
      adminPassword: "admin2026",
    },
    create: {
      id: "demo-mall",
      name: "MarkMall Centro",
      tagline: "Tu destino de compras y ofertas",
      primaryColor: "#E11D48",
      secondaryColor: "#1E1B4B",
      fixedHashtags: "#MarkMall #Ofertas #MallCentro",
      adminPassword: "admin2026",
    },
  });

  const stores = [
    {
      id: "store-sneakers",
      name: "Sneaker Zone",
      category: "Calzado deportivo",
      rubro: "footwear",
      username: "sneakerzone",
      primaryColor: "#2563EB",
      secondaryColor: "#0F172A",
      customHashtags: "#SneakerZone #Zapatillas #Nike",
      templateId: "sport",
    },
    {
      id: "store-fashion",
      name: "Moda Urbana",
      category: "Ropa y accesorios",
      rubro: "fashion",
      username: "modaurbana",
      primaryColor: "#DB2777",
      secondaryColor: "#431407",
      customHashtags: "#ModaUrbana #Fashion #Estilo",
      templateId: "retro",
    },
    {
      id: "store-tech",
      name: "TechHub",
      category: "Electrónica",
      username: "techhub",
      primaryColor: "#06B6D4",
      secondaryColor: "#0F172A",
      customHashtags: "#TechHub #Tecnologia #Gadgets",
      templateId: "tech",
    },
    {
      id: "store-cafe",
      name: "Café Central",
      category: "Gastronomía",
      username: "cafecentral",
      primaryColor: "#16A34A",
      secondaryColor: "#14532D",
      customHashtags: "#CafeCentral #Gastronomia #Cafe",
      templateId: "nature",
    },
  ];

  for (const store of stores) {
    await prisma.store.upsert({
      where: { id: store.id },
      update: {
        passwordHash,
        username: store.username,
        primaryColor: store.primaryColor,
        secondaryColor: store.secondaryColor,
        customHashtags: store.customHashtags,
        templateId: store.templateId,
      },
      create: {
        ...store,
        passwordHash,
        mallId: mall.id,
      },
    });
  }

  console.log("Seed completado");
  console.log("Tiendas — usuario / contraseña: tienda123");
  stores.forEach((s) => console.log(`  ${s.name}: ${s.username}`));
  console.log("Admin mall — contraseña: admin2026");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
