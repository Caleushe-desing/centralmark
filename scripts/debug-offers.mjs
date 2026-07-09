import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client.js";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

const offers = await prisma.offer.findMany({
  include: { content: true, publications: true, store: true },
  orderBy: { createdAt: "desc" },
});

console.log("Ofertas:", offers.length);
for (const o of offers) {
  console.log("\n---");
  console.log("id:", o.id);
  console.log("product:", o.productName);
  console.log("status:", o.status);
  console.log("imagePath:", o.content?.imagePath);
  console.log("publications:", o.publications);
}

await prisma.$disconnect();
