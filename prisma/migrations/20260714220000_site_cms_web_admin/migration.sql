-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "webAdminPassword" TEXT NOT NULL DEFAULT 'webadmin2026',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SiteCmsField" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "page" TEXT NOT NULL DEFAULT 'landing',
    "key" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "label" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "sectionLabel" TEXT NOT NULL,
    "value" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "SiteCmsField_page_section_idx" ON "SiteCmsField"("page", "section");

-- CreateIndex
CREATE UNIQUE INDEX "SiteCmsField_page_key_key" ON "SiteCmsField"("page", "key");
