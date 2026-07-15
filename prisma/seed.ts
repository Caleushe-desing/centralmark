import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { LANDING_FIELD_DEFS } from "../src/lib/cms/landing-defaults";

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
      username: "1001",
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
      username: "1002",
      primaryColor: "#DB2777",
      secondaryColor: "#431407",
      customHashtags: "#ModaUrbana #Fashion #Estilo",
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
      customHashtags: "#TechHub #Tecnologia #Gadgets",
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

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      webAdminPassword: "webadmin2026",
    },
  });

  for (const field of LANDING_FIELD_DEFS) {
    const forceValueKeys = new Set([
      "hero.ctaPrimary",
      "hero.ctaSecondary",
      "cta.primary",
      "cta.secondary",
      "nav.cta",
      "footer.email",
    ]);
    await prisma.siteCmsField.upsert({
      where: { page_key: { page: "landing", key: field.key } },
      update: {
        type: field.type,
        label: field.label,
        section: field.section,
        sectionLabel: field.sectionLabel,
        sortOrder: field.sortOrder,
        ...(forceValueKeys.has(field.key) ? { value: field.value } : {}),
      },
      create: {
        page: "landing",
        key: field.key,
        type: field.type,
        label: field.label,
        section: field.section,
        sectionLabel: field.sectionLabel,
        value: field.value,
        sortOrder: field.sortOrder,
      },
    });
  }

  console.log("Seed completado");
  console.log("Usuarios (tiendas) — ID / contraseña: tienda123");
  stores.forEach((s) => console.log(`  ${s.name}: ${s.username}`));
  console.log("Admin mall (cliente) — contraseña: admin2026");
  console.log("Admin web (CMS) — contraseña: webadmin2026  → /web-admin");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
