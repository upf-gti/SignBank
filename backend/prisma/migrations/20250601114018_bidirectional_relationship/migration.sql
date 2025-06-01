/*
  Warnings:

  - You are about to drop the column `minimalPairGlossDataId` on the `MinimalPair` table. All the data in the column will be lost.
  - You are about to drop the column `relatedGlossId` on the `RelatedGloss` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sourceGlossId,targetGlossId]` on the table `MinimalPair` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sourceGlossId,targetGlossId]` on the table `RelatedGloss` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sourceGlossId` to the `MinimalPair` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetGlossId` to the `MinimalPair` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceGlossId` to the `RelatedGloss` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetGlossId` to the `RelatedGloss` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MinimalPair" DROP CONSTRAINT "MinimalPair_minimalPairGlossDataId_fkey";

-- DropForeignKey
ALTER TABLE "RelatedGloss" DROP CONSTRAINT "RelatedGloss_relatedGlossId_fkey";

-- AlterTable
ALTER TABLE "MinimalPair" DROP COLUMN "minimalPairGlossDataId",
ADD COLUMN     "sourceGlossId" TEXT NOT NULL,
ADD COLUMN     "targetGlossId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RelatedGloss" DROP COLUMN "relatedGlossId",
ADD COLUMN     "sourceGlossId" TEXT NOT NULL,
ADD COLUMN     "targetGlossId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MinimalPair_sourceGlossId_targetGlossId_key" ON "MinimalPair"("sourceGlossId", "targetGlossId");

-- CreateIndex
CREATE UNIQUE INDEX "RelatedGloss_sourceGlossId_targetGlossId_key" ON "RelatedGloss"("sourceGlossId", "targetGlossId");

-- AddForeignKey
ALTER TABLE "RelatedGloss" ADD CONSTRAINT "RelatedGloss_sourceGlossId_fkey" FOREIGN KEY ("sourceGlossId") REFERENCES "GlossData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelatedGloss" ADD CONSTRAINT "RelatedGloss_targetGlossId_fkey" FOREIGN KEY ("targetGlossId") REFERENCES "GlossData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MinimalPair" ADD CONSTRAINT "MinimalPair_sourceGlossId_fkey" FOREIGN KEY ("sourceGlossId") REFERENCES "GlossData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MinimalPair" ADD CONSTRAINT "MinimalPair_targetGlossId_fkey" FOREIGN KEY ("targetGlossId") REFERENCES "GlossData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
