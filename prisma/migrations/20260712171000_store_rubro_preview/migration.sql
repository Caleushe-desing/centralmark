-- AlterTable
ALTER TABLE "Store" ADD COLUMN "rubro" TEXT NOT NULL DEFAULT 'fashion';
ALTER TABLE "Store" ADD COLUMN "previewImageUrl" TEXT;

UPDATE "Store" SET "rubro" = CASE
  WHEN lower("category") LIKE '%calzado%' OR lower("category") LIKE '%deport%' THEN 'footwear'
  WHEN lower("category") LIKE '%electr%' OR lower("category") LIKE '%tech%' OR lower("category") LIKE '%gadget%' THEN 'tech'
  WHEN lower("category") LIKE '%gastron%' OR lower("category") LIKE '%café%' OR lower("category") LIKE '%cafe%' OR lower("category") LIKE '%food%' THEN 'food'
  WHEN lower("category") LIKE '%ropa%' OR lower("category") LIKE '%moda%' OR lower("category") LIKE '%accesor%' THEN 'fashion'
  ELSE 'other'
END;
