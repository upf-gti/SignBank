-- AlterTable
ALTER TABLE "GlossData" ADD COLUMN "externalId" TEXT;
ALTER TABLE "GlossData" ADD COLUMN "isCompound" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "GlossData" ADD COLUMN "iconicity" TEXT;

-- CreateTable
CREATE TABLE "CompoundPart" (
    "id" TEXT NOT NULL,
    "glossDataId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "gloss" TEXT NOT NULL,
    "compExternalId" TEXT,
    "linkedGlossId" TEXT,
    "redundant" BOOLEAN NOT NULL DEFAULT false,
    "inlinePhonologyId" TEXT,

    CONSTRAINT "CompoundPart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GlossData_externalId_key" ON "GlossData"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "CompoundPart_inlinePhonologyId_key" ON "CompoundPart"("inlinePhonologyId");

-- CreateIndex
CREATE UNIQUE INDEX "CompoundPart_glossDataId_position_key" ON "CompoundPart"("glossDataId", "position");

-- AddForeignKey
ALTER TABLE "CompoundPart" ADD CONSTRAINT "CompoundPart_glossDataId_fkey" FOREIGN KEY ("glossDataId") REFERENCES "GlossData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompoundPart" ADD CONSTRAINT "CompoundPart_linkedGlossId_fkey" FOREIGN KEY ("linkedGlossId") REFERENCES "GlossData"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompoundPart" ADD CONSTRAINT "CompoundPart_inlinePhonologyId_fkey" FOREIGN KEY ("inlinePhonologyId") REFERENCES "VideoData"("id") ON DELETE CASCADE ON UPDATE CASCADE;
