/*
  Warnings:

  - Added the required column `minimalPairGlossDataId` to the `MinimalPair` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MinimalPair" DROP CONSTRAINT "MinimalPair_glossDataId_fkey";

-- AlterTable
ALTER TABLE "MinimalPair" ADD COLUMN     "minimalPairGlossDataId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "MinimalPair" ADD CONSTRAINT "MinimalPair_minimalPairGlossDataId_fkey" FOREIGN KEY ("minimalPairGlossDataId") REFERENCES "GlossData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
