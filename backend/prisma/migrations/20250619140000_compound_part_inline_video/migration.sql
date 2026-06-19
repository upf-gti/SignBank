-- AlterTable
ALTER TABLE "SignVideo" ALTER COLUMN "glossDataId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "CompoundPart" ADD COLUMN "inlineSignVideoId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CompoundPart_inlineSignVideoId_key" ON "CompoundPart"("inlineSignVideoId");

-- AddForeignKey
ALTER TABLE "CompoundPart" ADD CONSTRAINT "CompoundPart_inlineSignVideoId_fkey" FOREIGN KEY ("inlineSignVideoId") REFERENCES "SignVideo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
