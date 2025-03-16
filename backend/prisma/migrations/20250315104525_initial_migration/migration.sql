-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DENIED');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('CATALAN', 'SPANISH', 'ENGLISH', 'OTHER');

-- CreateEnum
CREATE TYPE "LexicalCategory" AS ENUM ('NOUN', 'VERB', 'ADJECTIVE', 'ADVERB', 'PRONOUN', 'DETERMINER', 'PREPOSITION', 'CONJUNCTION', 'INTERJECTION', 'OTHER');

-- CreateEnum
CREATE TYPE "RelationType" AS ENUM ('SYNONYM', 'REGIONAL_VARIANT', 'ASSOCIATED_CONCEPT', 'ANTONYM', 'HYPERNYM', 'HYPONYM');

-- CreateEnum
CREATE TYPE "Hand" AS ENUM ('RIGHT', 'LEFT', 'BOTH');

-- CreateEnum
CREATE TYPE "WordStatus" AS ENUM ('PENDING', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EditStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Words" (
    "id" SERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorId" INTEGER NOT NULL,
    "dialectId" INTEGER,
    "dominantHand" "Hand",
    "facialExpression" TEXT,
    "hasContact" BOOLEAN,
    "isNative" BOOLEAN NOT NULL DEFAULT true,
    "lexicalCategory" "LexicalCategory",
    "morphologicalVariants" TEXT,
    "movementType" TEXT,
    "nonManualComponents" TEXT,
    "phonologicalTranscription" TEXT,
    "register" TEXT,
    "requestId" INTEGER,
    "status" "WordStatus" NOT NULL DEFAULT 'PENDING',
    "usageEra" TEXT,
    "usageFrequency" TEXT,

    CONSTRAINT "Words_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordEdit" (
    "id" SERIAL NOT NULL,
    "wordId" INTEGER NOT NULL,
    "editorId" INTEGER NOT NULL,
    "editData" JSONB NOT NULL,
    "comment" TEXT,
    "status" "EditStatus" NOT NULL DEFAULT 'PENDING',
    "denyReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WordEdit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "angle" TEXT NOT NULL,
    "wordId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dialect" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "mapCoordinates" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dialect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sense" (
    "id" SERIAL NOT NULL,
    "definition" TEXT NOT NULL,
    "example" TEXT,
    "wordId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Sense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Translation" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "senseId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "wordsId" INTEGER,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordRelation" (
    "id" SERIAL NOT NULL,
    "sourceWordId" INTEGER NOT NULL,
    "targetWordId" INTEGER NOT NULL,
    "relationType" "RelationType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WordRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordRequest" (
    "id" SERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "denyReason" TEXT,

    CONSTRAINT "WordRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Words_requestId_key" ON "Words"("requestId");

-- CreateIndex
CREATE INDEX "Video_priority_wordId_idx" ON "Video"("priority", "wordId");

-- CreateIndex
CREATE INDEX "Sense_priority_wordId_idx" ON "Sense"("priority", "wordId");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_senseId_language_key" ON "Translation"("senseId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "WordRelation_sourceWordId_targetWordId_relationType_key" ON "WordRelation"("sourceWordId", "targetWordId", "relationType");

-- AddForeignKey
ALTER TABLE "Words" ADD CONSTRAINT "Words_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Words" ADD CONSTRAINT "Words_dialectId_fkey" FOREIGN KEY ("dialectId") REFERENCES "Dialect"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Words" ADD CONSTRAINT "Words_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "WordRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordEdit" ADD CONSTRAINT "WordEdit_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordEdit" ADD CONSTRAINT "WordEdit_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Words"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Words"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sense" ADD CONSTRAINT "Sense_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Words"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_senseId_fkey" FOREIGN KEY ("senseId") REFERENCES "Sense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_wordsId_fkey" FOREIGN KEY ("wordsId") REFERENCES "Words"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordRelation" ADD CONSTRAINT "WordRelation_sourceWordId_fkey" FOREIGN KEY ("sourceWordId") REFERENCES "Words"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordRelation" ADD CONSTRAINT "WordRelation_targetWordId_fkey" FOREIGN KEY ("targetWordId") REFERENCES "Words"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordRequest" ADD CONSTRAINT "WordRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
