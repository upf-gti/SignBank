-- Flatten Sense into GlossData: definitions, examples, and gloss translations attach directly to gloss.

ALTER TABLE "Definition" ADD COLUMN "glossDataId" TEXT;
ALTER TABLE "Definition" ADD COLUMN "lexicalCategory" "LexicalCategory" NOT NULL DEFAULT 'NOUN';

UPDATE "Definition" d
SET
    "glossDataId" = s."glossDataId",
    "lexicalCategory" = s."lexicalCategory",
    "priority" = (s."priority" * 100) + d."priority"
FROM "Sense" s
WHERE d."senseId" = s."id";

ALTER TABLE "Definition" ALTER COLUMN "glossDataId" SET NOT NULL;
ALTER TABLE "Definition" DROP CONSTRAINT "Definition_senseId_fkey";
ALTER TABLE "Definition" DROP COLUMN "senseId";
ALTER TABLE "Definition" ADD CONSTRAINT "Definition_glossDataId_fkey" FOREIGN KEY ("glossDataId") REFERENCES "GlossData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Example" ADD COLUMN "glossDataId" TEXT;

UPDATE "Example" e
SET "glossDataId" = s."glossDataId"
FROM "Sense" s
WHERE e."senseId" = s."id";

ALTER TABLE "Example" ALTER COLUMN "glossDataId" SET NOT NULL;
ALTER TABLE "Example" DROP CONSTRAINT "Example_senseId_fkey";
ALTER TABLE "Example" DROP COLUMN "senseId";
ALTER TABLE "Example" ADD CONSTRAINT "Example_glossDataId_fkey" FOREIGN KEY ("glossDataId") REFERENCES "GlossData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "GlossTranslation" (
    "id" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "glossDataId" TEXT NOT NULL,

    CONSTRAINT "GlossTranslation_pkey" PRIMARY KEY ("id")
);

INSERT INTO "GlossTranslation" ("id", "translation", "language", "glossDataId")
SELECT st."id", st."translation", st."language", s."glossDataId"
FROM "SenseTranslation" st
JOIN "Sense" s ON st."senseId" = s."id";

ALTER TABLE "GlossTranslation" ADD CONSTRAINT "GlossTranslation_glossDataId_fkey" FOREIGN KEY ("glossDataId") REFERENCES "GlossData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DROP TABLE "SenseTranslation";
DROP TABLE "Sense";
