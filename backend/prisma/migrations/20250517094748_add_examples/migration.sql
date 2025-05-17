/*
  Warnings:

  - You are about to drop the column `examples` on the `Definition` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Definition" DROP COLUMN "examples";

-- CreateTable
CREATE TABLE "Example" (
    "id" TEXT NOT NULL,
    "example" TEXT NOT NULL,
    "exampleVideoURL" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,

    CONSTRAINT "Example_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Example" ADD CONSTRAINT "Example_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "Definition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
