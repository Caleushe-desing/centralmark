/**
 * Seed mínimo del contenedor — mejor-sqlite3 + bcrypt (sin Prisma TS).
 * Idempotente: upsert mall demo y tiendas 1001–1004.
 */
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import { randomBytes } from "crypto";

const dbPath = (process.env.DATABASE_URL ?? "file:/app/data/dev.db").replace(
  /^file:/,
  ""
);
const db = new Database(dbPath);
const passwordHash = await bcrypt.hash("tienda123", 10);
const now = new Date().toISOString();

function cuid() {
  return `c${randomBytes(12).toString("hex")}`;
}

db.exec(`
  CREATE TABLE IF NOT EXISTS Mall (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    tagline TEXT,
    primaryColor TEXT NOT NULL DEFAULT '#E11D48',
    secondaryColor TEXT NOT NULL DEFAULT '#1E1B4B',
    fixedHashtags TEXT NOT NULL DEFAULT '#MarkMall #Ofertas',
    adminPassword TEXT NOT NULL DEFAULT 'admin2026',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL
  );
`);

const mall = db.prepare("SELECT id FROM Mall WHERE id = ?").get("demo-mall");
if (!mall) {
  db.prepare(
    `INSERT INTO Mall (id, name, tagline, primaryColor, secondaryColor, fixedHashtags, adminPassword, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    "demo-mall",
    "CentralMark Centro",
    "Centro de Marketing Inteligente",
    "#0F2B5B",
    "#2563EB",
    "#CentralMark #Ofertas #MallCentro",
    "admin2026",
    now,
    now
  );
} else {
  db.prepare(
    `UPDATE Mall SET adminPassword = ?, fixedHashtags = ?, updatedAt = ? WHERE id = ?`
  ).run("admin2026", "#CentralMark #Ofertas #MallCentro", now, "demo-mall");
}

const stores = [
  ["store-sneakers", "Sneaker Zone", "Calzado deportivo", "footwear", "1001", "#2563EB", "#0F172A"],
  ["store-fashion", "Moda Urbana", "Ropa y accesorios", "fashion", "1002", "#DB2777", "#431407"],
  ["store-tech", "TechHub", "Electrónica", "tech", "1003", "#06B6D4", "#0F172A"],
  ["store-cafe", "Café Central", "Gastronomía", "food", "1004", "#16A34A", "#14532D"],
];

const upsert = db.prepare(`
  INSERT INTO Store (id, name, category, rubro, username, passwordHash, primaryColor, secondaryColor, templateId, soldProductIds, mallId, createdAt, updatedAt)
  VALUES (@id, @name, @category, @rubro, @username, @passwordHash, @primaryColor, @secondaryColor, 'flash-sale', '[]', 'demo-mall', @now, @now)
  ON CONFLICT(id) DO UPDATE SET
    username = excluded.username,
    passwordHash = excluded.passwordHash,
    category = excluded.category,
    rubro = excluded.rubro,
    primaryColor = excluded.primaryColor,
    secondaryColor = excluded.secondaryColor,
    updatedAt = excluded.updatedAt
`);

for (const [id, name, category, rubro, username, primaryColor, secondaryColor] of stores) {
  upsert.run({
    id,
    name,
    category,
    rubro,
    username,
    passwordHash,
    primaryColor,
    secondaryColor,
    now,
  });
}

// Site settings for web admin
const site = db.prepare("SELECT id FROM SiteSettings WHERE id = ?").get("default");
if (!site) {
  try {
    db.prepare(
      `INSERT INTO SiteSettings (id, webAdminPassword, updatedAt) VALUES ('default', 'webadmin2026', ?)`
    ).run(now);
  } catch {
    /* table may not exist yet before migrate — ok */
  }
}

// Alinear CTAs de landing (Solicitar demo / Ver plataforma)
try {
  const updateCms = db.prepare(
    `UPDATE SiteCmsField SET value = ? WHERE page = 'landing' AND key = ?`
  );
  for (const [key, value] of [
    ["hero.ctaPrimary", "Solicitar una demo"],
    ["hero.ctaSecondary", "Ver plataforma"],
    ["cta.primary", "Solicitar una demo"],
    ["cta.secondary", "Ver plataforma"],
    ["nav.cta", "Solicitar una demo"],
    ["footer.email", "ventas@centralmark.cl"],
  ]) {
    updateCms.run(value, key);
  }
} catch {
  /* tabla CMS puede no existir aún */
}

console.log("[docker-seed] OK — ID 1001 / tienda123 | admin: admin2026");
db.close();
