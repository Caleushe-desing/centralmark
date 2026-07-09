/*
  Warnings:

  - Added the required column `passwordHash` to the `Store` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `Store` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GeneratedContent" ADD COLUMN "templateId" TEXT;

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL,
    "category" TEXT,
    "imageUrl" TEXT NOT NULL,
    "imageNoBgUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Mall" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#E11D48',
    "secondaryColor" TEXT NOT NULL DEFAULT '#1E1B4B',
    "fixedHashtags" TEXT NOT NULL DEFAULT '#MarkMall #Ofertas',
    "adminPassword" TEXT NOT NULL DEFAULT 'admin2026',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Mall" ("createdAt", "id", "name", "primaryColor", "secondaryColor", "tagline", "updatedAt") SELECT "createdAt", "id", "name", "primaryColor", "secondaryColor", "tagline", "updatedAt" FROM "Mall";
DROP TABLE "Mall";
ALTER TABLE "new_Mall" RENAME TO "Mall";
CREATE TABLE "new_Offer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT NOT NULL,
    "discountPercent" INTEGER NOT NULL,
    "description" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "productImageUrl" TEXT,
    "templateId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Offer_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Offer_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Offer" ("createdAt", "description", "discountPercent", "endDate", "id", "productImageUrl", "productName", "startDate", "status", "storeId", "updatedAt") SELECT "createdAt", "description", "discountPercent", "endDate", "id", "productImageUrl", "productName", "startDate", "status", "storeId", "updatedAt" FROM "Offer";
DROP TABLE "Offer";
ALTER TABLE "new_Offer" RENAME TO "Offer";
CREATE TABLE "new_Store" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "logoUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#E11D48',
    "secondaryColor" TEXT NOT NULL DEFAULT '#1E1B4B',
    "customHashtags" TEXT,
    "templateId" TEXT NOT NULL DEFAULT 'flash-sale',
    "mallId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Store_mallId_fkey" FOREIGN KEY ("mallId") REFERENCES "Mall" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Store" ("category", "createdAt", "id", "mallId", "name", "updatedAt", "username", "passwordHash", "templateId", "primaryColor", "secondaryColor", "customHashtags")
SELECT "category", "createdAt", "id", "mallId", "name", "updatedAt",
  CASE "id"
    WHEN 'store-sneakers' THEN 'sneakerzone'
    WHEN 'store-fashion' THEN 'modaurbana'
    WHEN 'store-tech' THEN 'techhub'
    WHEN 'store-cafe' THEN 'cafecentral'
    ELSE "id"
  END,
  '$2b$10$GMmTyrWozzMGevT9hyyy4OF66EBB958JalZQTnbe8zp1enQ9V/BCC',
  CASE "id"
    WHEN 'store-sneakers' THEN 'sport'
    WHEN 'store-fashion' THEN 'retro'
    WHEN 'store-tech' THEN 'tech'
    WHEN 'store-cafe' THEN 'nature'
    ELSE 'flash-sale'
  END,
  CASE "id"
    WHEN 'store-sneakers' THEN '#2563EB'
    WHEN 'store-fashion' THEN '#DB2777'
    WHEN 'store-tech' THEN '#06B6D4'
    WHEN 'store-cafe' THEN '#16A34A'
    ELSE '#E11D48'
  END,
  CASE "id"
    WHEN 'store-sneakers' THEN '#0F172A'
    WHEN 'store-fashion' THEN '#431407'
    WHEN 'store-tech' THEN '#0F172A'
    WHEN 'store-cafe' THEN '#14532D'
    ELSE '#1E1B4B'
  END,
  CASE "id"
    WHEN 'store-sneakers' THEN '#SneakerZone #Zapatillas'
    WHEN 'store-fashion' THEN '#ModaUrbana #Fashion'
    WHEN 'store-tech' THEN '#TechHub #Tecnologia'
    WHEN 'store-cafe' THEN '#CafeCentral #Gastronomia'
    ELSE NULL
  END
FROM "Store";
DROP TABLE "Store";
ALTER TABLE "new_Store" RENAME TO "Store";
CREATE UNIQUE INDEX "Store_username_key" ON "Store"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
