-- AlterTable
ALTER TABLE "DesignGenerationJob" ADD COLUMN "archetype" TEXT NOT NULL DEFAULT 'drop';

UPDATE "DesignGenerationJob" SET "archetype" = CASE
  WHEN "copyMode" = 'impact' THEN 'drop'
  WHEN "copyMode" = 'retail' THEN 'promo'
  WHEN "copyMode" = 'editorial' THEN 'editorial'
  ELSE 'drop'
END;
