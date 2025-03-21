-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "WordStatus" ADD VALUE 'EDIT_REQUEST';
ALTER TYPE "WordStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "WordEdit" ADD COLUMN     "newWordVersionId" INTEGER;

-- AlterTable
ALTER TABLE "Words" ADD COLUMN     "editComment" TEXT,
ADD COLUMN     "editorId" INTEGER,
ADD COLUMN     "originalWordId" INTEGER;

-- AddForeignKey
ALTER TABLE "Words" ADD CONSTRAINT "Words_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Words" ADD CONSTRAINT "Words_originalWordId_fkey" FOREIGN KEY ("originalWordId") REFERENCES "Words"("id") ON DELETE SET NULL ON UPDATE CASCADE;
