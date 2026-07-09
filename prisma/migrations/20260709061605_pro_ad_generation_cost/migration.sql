-- CreateTable
CREATE TABLE "ProAdGeneration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "brief" TEXT NOT NULL,
    "compositionCategory" TEXT NOT NULL,
    "compositionLayoutId" TEXT NOT NULL,
    "styleName" TEXT NOT NULL,
    "hook" TEXT NOT NULL,
    "badge" TEXT NOT NULL,
    "subtext" TEXT NOT NULL,
    "cta" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "costUsd" REAL NOT NULL,
    "promptTokens" INTEGER NOT NULL,
    "completionTokens" INTEGER NOT NULL,
    "textModel" TEXT NOT NULL,
    "imageModel" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProAdGeneration_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
