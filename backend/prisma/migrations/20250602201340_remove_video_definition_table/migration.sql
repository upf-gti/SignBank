/*
  Warnings:

  - You are about to drop the column `videoDefinitionId` on the `Definition` table. All the data in the column will be lost.
  - You are about to drop the `VideoDefinition` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Definition" DROP CONSTRAINT "Definition_videoDefinitionId_fkey";

-- DropIndex
DROP INDEX "Definition_videoDefinitionId_key";

-- AlterTable
ALTER TABLE "Definition" DROP COLUMN "videoDefinitionId",
ADD COLUMN     "videoDefinitionUrl" TEXT;

-- DropTable
DROP TABLE "VideoDefinition";
