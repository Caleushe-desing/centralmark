-- CreateTable
CREATE TABLE "StoreSocialAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "metaPageId" TEXT,
    "metaPageName" TEXT,
    "metaIgAccountId" TEXT,
    "metaIgUsername" TEXT,
    "metaAccessToken" TEXT,
    "metaTokenExpiresAt" DATETIME,
    "tiktokOpenId" TEXT,
    "tiktokUsername" TEXT,
    "tiktokAccessToken" TEXT,
    "tiktokRefreshToken" TEXT,
    "tiktokExpiresAt" DATETIME,
    "connectedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StoreSocialAccount_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MetaOAuthPending" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "pagesJson" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "StoreSocialAccount_storeId_key" ON "StoreSocialAccount"("storeId");
