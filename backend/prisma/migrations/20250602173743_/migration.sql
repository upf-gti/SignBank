/*
  Warnings:

  - The values [PENDING] on the enum `RequestStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RequestStatus_new" AS ENUM ('NOT_COMPLETED', 'WAITING_FOR_APPROVAL', 'ACCEPTED', 'DENIED');
ALTER TABLE "GlossRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "GlossRequest" ALTER COLUMN "status" TYPE "RequestStatus_new" USING ("status"::text::"RequestStatus_new");
ALTER TYPE "RequestStatus" RENAME TO "RequestStatus_old";
ALTER TYPE "RequestStatus_new" RENAME TO "RequestStatus";
DROP TYPE "RequestStatus_old";
ALTER TABLE "GlossRequest" ALTER COLUMN "status" SET DEFAULT 'NOT_COMPLETED';
COMMIT;

-- DropForeignKey
ALTER TABLE "Definition" DROP CONSTRAINT "Definition_senseId_fkey";

-- DropForeignKey
ALTER TABLE "Definition" DROP CONSTRAINT "Definition_videoDefinitionId_fkey";

-- DropForeignKey
ALTER TABLE "DefinitionTranslation" DROP CONSTRAINT "DefinitionTranslation_definitionId_fkey";

-- DropForeignKey
ALTER TABLE "DictionaryEntry" DROP CONSTRAINT "DictionaryEntry_glossDataId_fkey";

-- DropForeignKey
ALTER TABLE "Example" DROP CONSTRAINT "Example_senseId_fkey";

-- DropForeignKey
ALTER TABLE "ExampleTranslation" DROP CONSTRAINT "ExampleTranslation_exampleId_fkey";

-- DropForeignKey
ALTER TABLE "GlossRequest" DROP CONSTRAINT "GlossRequest_requestedGlossDataId_fkey";

-- DropForeignKey
ALTER TABLE "Sense" DROP CONSTRAINT "Sense_glossDataId_fkey";

-- DropForeignKey
ALTER TABLE "SenseTranslation" DROP CONSTRAINT "SenseTranslation_senseId_fkey";

-- DropForeignKey
ALTER TABLE "SignVideo" DROP CONSTRAINT "SignVideo_senseId_fkey";

-- DropForeignKey
ALTER TABLE "SignVideo" DROP CONSTRAINT "SignVideo_videoDataId_fkey";

-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_signVideoId_fkey";

-- AlterTable
ALTER TABLE "GlossRequest" ADD COLUMN     "lastEditedSection" TEXT,
ALTER COLUMN "status" SET DEFAULT 'NOT_COMPLETED';

-- AddForeignKey
ALTER TABLE "DictionaryEntry" ADD CONSTRAINT "DictionaryEntry_glossDataId_fkey" FOREIGN KEY ("glossDataId") REFERENCES "GlossData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sense" ADD CONSTRAINT "Sense_glossDataId_fkey" FOREIGN KEY ("glossDataId") REFERENCES "GlossData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SenseTranslation" ADD CONSTRAINT "SenseTranslation_senseId_fkey" FOREIGN KEY ("senseId") REFERENCES "Sense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Definition" ADD CONSTRAINT "Definition_videoDefinitionId_fkey" FOREIGN KEY ("videoDefinitionId") REFERENCES "VideoDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Definition" ADD CONSTRAINT "Definition_senseId_fkey" FOREIGN KEY ("senseId") REFERENCES "Sense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Example" ADD CONSTRAINT "Example_senseId_fkey" FOREIGN KEY ("senseId") REFERENCES "Sense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExampleTranslation" ADD CONSTRAINT "ExampleTranslation_exampleId_fkey" FOREIGN KEY ("exampleId") REFERENCES "Example"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefinitionTranslation" ADD CONSTRAINT "DefinitionTranslation_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "Definition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignVideo" ADD CONSTRAINT "SignVideo_videoDataId_fkey" FOREIGN KEY ("videoDataId") REFERENCES "VideoData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignVideo" ADD CONSTRAINT "SignVideo_senseId_fkey" FOREIGN KEY ("senseId") REFERENCES "Sense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_signVideoId_fkey" FOREIGN KEY ("signVideoId") REFERENCES "SignVideo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlossRequest" ADD CONSTRAINT "GlossRequest_requestedGlossDataId_fkey" FOREIGN KEY ("requestedGlossDataId") REFERENCES "GlossData"("id") ON DELETE CASCADE ON UPDATE CASCADE;
