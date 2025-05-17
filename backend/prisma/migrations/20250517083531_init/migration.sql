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
CREATE TYPE "GlossStatus" AS ENUM ('PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EditStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DictionaryEntry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "GlossStatus" NOT NULL DEFAULT 'PUBLISHED',
    "editComment" TEXT,
    "currentVersion" INTEGER NOT NULL DEFAULT 1,
    "isCreatedFromRequest" BOOLEAN NOT NULL DEFAULT false,
    "isCreatedFromEdit" BOOLEAN NOT NULL DEFAULT false,
    "glossRequestId" TEXT,
    "glossId" TEXT NOT NULL,

    CONSTRAINT "DictionaryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gloss" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "editComment" TEXT,
    "currentVersion" INTEGER NOT NULL DEFAULT 1,
    "isCreatedFromRequest" BOOLEAN NOT NULL DEFAULT false,
    "isCreatedFromEdit" BOOLEAN NOT NULL DEFAULT false,
    "senseId" TEXT NOT NULL,

    CONSTRAINT "Gloss_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelatedGloss" (
    "id" TEXT NOT NULL,
    "glossId" TEXT NOT NULL,
    "relatedGlossId" TEXT NOT NULL,
    "relationType" "RelationType" NOT NULL,

    CONSTRAINT "RelatedGloss_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sense" (
    "id" TEXT NOT NULL,
    "senseTitle" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "lexicalCategory" "LexicalCategory",

    CONSTRAINT "Sense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Definition" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "definition" TEXT NOT NULL,
    "examples" TEXT[],
    "videoDefinitionId" TEXT NOT NULL,
    "senseId" TEXT NOT NULL,

    CONSTRAINT "Definition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoDefinition" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "VideoDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DefinitionTranslation" (
    "id" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "definitionId" TEXT NOT NULL,

    CONSTRAINT "DefinitionTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignVideo" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "videoData" JSONB NOT NULL,
    "senseId" TEXT NOT NULL,

    CONSTRAINT "SignVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "angle" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "signVideoId" TEXT NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MinimalPair" (
    "id" TEXT NOT NULL,
    "glossId" TEXT NOT NULL,
    "distinction" TEXT NOT NULL,
    "signVideoId" TEXT NOT NULL,

    CONSTRAINT "MinimalPair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlossRequest" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "denyReason" TEXT,
    "acceptedById" TEXT,
    "deniedById" TEXT,
    "requestedGlossDataId" TEXT NOT NULL,
    "glossId" TEXT,

    CONSTRAINT "GlossRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DictionaryEntry_glossRequestId_key" ON "DictionaryEntry"("glossRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "DictionaryEntry_glossId_key" ON "DictionaryEntry"("glossId");

-- CreateIndex
CREATE UNIQUE INDEX "Gloss_senseId_key" ON "Gloss"("senseId");

-- CreateIndex
CREATE UNIQUE INDEX "Definition_videoDefinitionId_key" ON "Definition"("videoDefinitionId");

-- CreateIndex
CREATE UNIQUE INDEX "GlossRequest_requestedGlossDataId_key" ON "GlossRequest"("requestedGlossDataId");

-- AddForeignKey
ALTER TABLE "DictionaryEntry" ADD CONSTRAINT "DictionaryEntry_glossRequestId_fkey" FOREIGN KEY ("glossRequestId") REFERENCES "GlossRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DictionaryEntry" ADD CONSTRAINT "DictionaryEntry_glossId_fkey" FOREIGN KEY ("glossId") REFERENCES "Gloss"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gloss" ADD CONSTRAINT "Gloss_senseId_fkey" FOREIGN KEY ("senseId") REFERENCES "Sense"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelatedGloss" ADD CONSTRAINT "RelatedGloss_glossId_fkey" FOREIGN KEY ("glossId") REFERENCES "Gloss"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Definition" ADD CONSTRAINT "Definition_videoDefinitionId_fkey" FOREIGN KEY ("videoDefinitionId") REFERENCES "VideoDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Definition" ADD CONSTRAINT "Definition_senseId_fkey" FOREIGN KEY ("senseId") REFERENCES "Sense"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefinitionTranslation" ADD CONSTRAINT "DefinitionTranslation_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "Definition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignVideo" ADD CONSTRAINT "SignVideo_senseId_fkey" FOREIGN KEY ("senseId") REFERENCES "Sense"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_signVideoId_fkey" FOREIGN KEY ("signVideoId") REFERENCES "SignVideo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MinimalPair" ADD CONSTRAINT "MinimalPair_signVideoId_fkey" FOREIGN KEY ("signVideoId") REFERENCES "SignVideo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlossRequest" ADD CONSTRAINT "GlossRequest_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlossRequest" ADD CONSTRAINT "GlossRequest_acceptedById_fkey" FOREIGN KEY ("acceptedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlossRequest" ADD CONSTRAINT "GlossRequest_deniedById_fkey" FOREIGN KEY ("deniedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlossRequest" ADD CONSTRAINT "GlossRequest_requestedGlossDataId_fkey" FOREIGN KEY ("requestedGlossDataId") REFERENCES "Gloss"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
