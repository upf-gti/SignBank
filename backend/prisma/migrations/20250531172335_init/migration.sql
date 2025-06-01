/*
  Warnings:

  - You are about to drop the column `glossDataId` on the `MinimalPair` table. All the data in the column will be lost.
  - You are about to drop the column `signVideoId` on the `MinimalPair` table. All the data in the column will be lost.
  - You are about to drop the column `glossId` on the `RelatedGloss` table. All the data in the column will be lost.
  - You are about to drop the column `refreshTokenExpiresAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `tokenExpiresAt` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "MinimalPair" DROP CONSTRAINT "MinimalPair_signVideoId_fkey";

-- AlterTable
ALTER TABLE "MinimalPair" DROP COLUMN "glossDataId",
DROP COLUMN "signVideoId";

-- AlterTable
ALTER TABLE "RelatedGloss" DROP COLUMN "glossId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "refreshTokenExpiresAt",
DROP COLUMN "tokenExpiresAt";
