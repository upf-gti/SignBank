-- CreateEnum
CREATE TYPE "Handedness" AS ENUM ('ONE', 'TWO_A', 'TWO_N', 'TWO_S', 'NA');

-- AlterTable: add new columns
ALTER TABLE "VideoData" ADD COLUMN "handedness" "Handedness" NOT NULL DEFAULT 'ONE';
ALTER TABLE "VideoData" ADD COLUMN "dominantConfiguration" "HandConfiguration";
ALTER TABLE "VideoData" ADD COLUMN "nonDominantConfiguration" "HandConfiguration";
ALTER TABLE "VideoData" ADD COLUMN "dominantRelationBetweenArticulators" "RelationBetweenArticulators";
ALTER TABLE "VideoData" ADD COLUMN "nonDominantRelationBetweenArticulators" "RelationBetweenArticulators";

-- Migrate data from old columns
UPDATE "VideoData" SET "handedness" = 'ONE' WHERE "hands" IN ('RIGHT', 'LEFT');
UPDATE "VideoData" SET "handedness" = 'TWO_S' WHERE "hands" = 'BOTH';
UPDATE "VideoData" SET "dominantConfiguration" = "configuration";
UPDATE "VideoData" SET "dominantRelationBetweenArticulators" = "relationBetweenArticulators";

-- Drop old columns
ALTER TABLE "VideoData" DROP COLUMN "hands";
ALTER TABLE "VideoData" DROP COLUMN "configuration";
ALTER TABLE "VideoData" DROP COLUMN "relationBetweenArticulators";

-- DropEnum
DROP TYPE "Hand";
