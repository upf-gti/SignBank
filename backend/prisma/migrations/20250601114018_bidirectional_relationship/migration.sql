/*
  Warnings:

  - You are about to drop the column `minimalPairGlossDataId` on the `MinimalPair` table. All the data in the column will be lost.
  - You are about to drop the column `relatedGlossId` on the `RelatedGloss` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[glossToId,glossFromId]` on the table `MinimalPair` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[relatedToId,relatedFromId]` on the table `RelatedGloss` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `glossFromId` to the `MinimalPair` table without a default value. This is not possible if the table is not empty.
  - Added the required column `glossToId` to the `MinimalPair` table without a default value. This is not possible if the table is not empty.
  - Added the required column `relatedFromId` to the `RelatedGloss` table without a default value. This is not possible if the table is not empty.
  - Added the required column `relatedToId` to the `RelatedGloss` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MinimalPair" DROP CONSTRAINT "MinimalPair_minimalPairGlossDataId_fkey";

-- DropForeignKey
ALTER TABLE "RelatedGloss" DROP CONSTRAINT "RelatedGloss_relatedGlossId_fkey";

-- AlterTable
ALTER TABLE "MinimalPair" DROP COLUMN "minimalPairGlossDataId",
ADD COLUMN     "glossFromId" TEXT NOT NULL,
ADD COLUMN     "glossToId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RelatedGloss" DROP COLUMN "relatedGlossId",
ADD COLUMN     "relatedFromId" TEXT NOT NULL,
ADD COLUMN     "relatedToId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MinimalPair_glossToId_glossFromId_key" ON "MinimalPair"("glossToId", "glossFromId");

-- CreateIndex
CREATE UNIQUE INDEX "RelatedGloss_relatedToId_relatedFromId_key" ON "RelatedGloss"("relatedToId", "relatedFromId");

-- AddForeignKey
ALTER TABLE "RelatedGloss" ADD CONSTRAINT "RelatedGloss_relatedToId_fkey" FOREIGN KEY ("relatedToId") REFERENCES "GlossData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelatedGloss" ADD CONSTRAINT "RelatedGloss_relatedFromId_fkey" FOREIGN KEY ("relatedFromId") REFERENCES "GlossData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MinimalPair" ADD CONSTRAINT "MinimalPair_glossToId_fkey" FOREIGN KEY ("glossToId") REFERENCES "GlossData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MinimalPair" ADD CONSTRAINT "MinimalPair_glossFromId_fkey" FOREIGN KEY ("glossFromId") REFERENCES "GlossData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
