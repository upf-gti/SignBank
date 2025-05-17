/*
  Warnings:

  - You are about to drop the column `videoData` on the `SignVideo` table. All the data in the column will be lost.
  - Added the required column `videoDataid` to the `SignVideo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MinimalPair" DROP CONSTRAINT "MinimalPair_signVideoId_fkey";

-- AlterTable
ALTER TABLE "MinimalPair" ALTER COLUMN "signVideoId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SignVideo" DROP COLUMN "videoData",
ADD COLUMN     "videoDataid" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "VideoData" (
    "hands" "Hand" NOT NULL,
    "configuration" TEXT NOT NULL,
    "configurationChanges" TEXT NOT NULL,
    "relationBetweenArticulators" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "movementRelatedOrientation" TEXT NOT NULL,
    "locationRelatedOrientation" TEXT NOT NULL,
    "orientationChange" TEXT NOT NULL,
    "contactType" TEXT NOT NULL,
    "movementType" TEXT NOT NULL,
    "vocalization" TEXT NOT NULL,
    "nonManualComponent" TEXT NOT NULL,
    "inicialization" TEXT NOT NULL,
    "id" TEXT NOT NULL,

    CONSTRAINT "VideoData_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SignVideo" ADD CONSTRAINT "SignVideo_videoDataid_fkey" FOREIGN KEY ("videoDataid") REFERENCES "VideoData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MinimalPair" ADD CONSTRAINT "MinimalPair_glossId_fkey" FOREIGN KEY ("glossId") REFERENCES "Gloss"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MinimalPair" ADD CONSTRAINT "MinimalPair_signVideoId_fkey" FOREIGN KEY ("signVideoId") REFERENCES "SignVideo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
