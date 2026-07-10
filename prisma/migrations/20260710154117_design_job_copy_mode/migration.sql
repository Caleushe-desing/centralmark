-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DesignGenerationJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "brief" TEXT NOT NULL,
    "copyMode" TEXT NOT NULL DEFAULT 'retail',
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "phase" TEXT NOT NULL DEFAULT 'queued',
    "errorMessage" TEXT,
    "resultJson" TEXT,
    "generationId" TEXT,
    "costUsd" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completedAt" DATETIME,
    CONSTRAINT "DesignGenerationJob_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_DesignGenerationJob" ("brief", "completedAt", "costUsd", "createdAt", "errorMessage", "generationId", "id", "phase", "resultJson", "status", "storeId", "updatedAt") SELECT "brief", "completedAt", "costUsd", "createdAt", "errorMessage", "generationId", "id", "phase", "resultJson", "status", "storeId", "updatedAt" FROM "DesignGenerationJob";
DROP TABLE "DesignGenerationJob";
ALTER TABLE "new_DesignGenerationJob" RENAME TO "DesignGenerationJob";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
