-- CreateEnum
CREATE TYPE "PhonologyDimension" AS ENUM ('HANDEDNESS', 'HAND_CONFIGURATION', 'CONFIGURATION_CHANGE', 'RELATION_BETWEEN_ARTICULATORS', 'LOCATION', 'MOVEMENT_RELATED_ORIENTATION', 'ORIENTATION_RELATED_TO_LOCATION', 'ORIENTATION_CHANGE', 'CONTACT_TYPE', 'MOVEMENT_TYPE', 'MOVEMENT_DIRECTION');

-- AlterTable: keep existing phonology codes while converting enums to text
ALTER TABLE "VideoData" ALTER COLUMN "handedness" SET DATA TYPE TEXT;
ALTER TABLE "VideoData" ALTER COLUMN "handedness" SET DEFAULT 'ONE';
ALTER TABLE "VideoData" ALTER COLUMN "dominantConfiguration" SET DATA TYPE TEXT;
ALTER TABLE "VideoData" ALTER COLUMN "nonDominantConfiguration" SET DATA TYPE TEXT;
ALTER TABLE "VideoData" ALTER COLUMN "dominantRelationBetweenArticulators" SET DATA TYPE TEXT;
ALTER TABLE "VideoData" ALTER COLUMN "nonDominantRelationBetweenArticulators" SET DATA TYPE TEXT;
ALTER TABLE "VideoData" ALTER COLUMN "configurationChanges" SET DATA TYPE TEXT;
ALTER TABLE "VideoData" ALTER COLUMN "location" SET DATA TYPE TEXT;
ALTER TABLE "VideoData" ALTER COLUMN "movementRelatedOrientation" SET DATA TYPE TEXT;
ALTER TABLE "VideoData" ALTER COLUMN "orientationRelatedToLocation" SET DATA TYPE TEXT;
ALTER TABLE "VideoData" ALTER COLUMN "orientationChange" SET DATA TYPE TEXT;
ALTER TABLE "VideoData" ALTER COLUMN "contactType" SET DATA TYPE TEXT;
ALTER TABLE "VideoData" ALTER COLUMN "movementType" SET DATA TYPE TEXT;
ALTER TABLE "VideoData" ALTER COLUMN "movementDirection" SET DATA TYPE TEXT;

-- DropEnum
DROP TYPE "ConfigurationChange";
DROP TYPE "ContactType";
DROP TYPE "HandConfiguration";
DROP TYPE "Handedness";
DROP TYPE "Location";
DROP TYPE "MovementDirection";
DROP TYPE "MovementRelatedOrientation";
DROP TYPE "MovementType";
DROP TYPE "OrientationChange";
DROP TYPE "OrientationRelatedToLocation";
DROP TYPE "RelationBetweenArticulators";

-- CreateTable
CREATE TABLE "PhonologyValue" (
    "id" TEXT NOT NULL,
    "dimension" "PhonologyDimension" NOT NULL,
    "code" TEXT NOT NULL,
    "labelCa" TEXT NOT NULL,
    "labelEn" TEXT,
    "labelEs" TEXT,
    "descriptionCa" TEXT,
    "descriptionEn" TEXT,
    "descriptionEs" TEXT,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhonologyValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PhonologyValue_dimension_active_idx" ON "PhonologyValue"("dimension", "active");

-- CreateIndex
CREATE UNIQUE INDEX "PhonologyValue_dimension_code_key" ON "PhonologyValue"("dimension", "code");
