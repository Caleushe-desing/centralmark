-- AlterTable
ALTER TABLE "DesignGenerationJob" ADD COLUMN "imageSource" TEXT NOT NULL DEFAULT 'ai';
ALTER TABLE "DesignGenerationJob" ADD COLUMN "userImageUrl" TEXT;
ALTER TABLE "DesignGenerationJob" ADD COLUMN "clientRequestId" TEXT;
