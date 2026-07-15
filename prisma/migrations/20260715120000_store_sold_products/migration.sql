-- AlterTable
ALTER TABLE "Store" ADD COLUMN "soldProductIds" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Store" ADD COLUMN "soldProductsOther" TEXT;
