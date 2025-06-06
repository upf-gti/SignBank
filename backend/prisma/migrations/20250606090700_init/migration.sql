-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('NOT_COMPLETED', 'WAITING_FOR_APPROVAL', 'ACCEPTED', 'DENIED');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('CATALAN', 'SPANISH', 'ENGLISH', 'OTHER');

-- CreateEnum
CREATE TYPE "LexicalCategory" AS ENUM ('ADJECTIVE', 'INTERJECTION', 'NOUN', 'NOUN_OR_VERB', 'NOUN_OR_ADJECTIVE', 'NOUN_ADJECTIVE_OR_VERB', 'VERB_OR_ADJECTIVE', 'PARTICLE', 'VERB', 'ADVERB', 'PRONOUN', 'NOUN_ADJECTIVE_OR_ADVERB', 'PARTICLE_NOUN_OR_VERB', 'NOUN_OR_ADVERB', 'VERB_ADJECTIVE_OR_ADVERB', 'VERB_OR_INTERJECTION', 'ADJECTIVE_OR_ADVERB', 'VERB_ADJECTIVE_OR_PARTICLE', 'PARTICLE_OR_ADJECTIVE', 'NOUN_ADJECTIVE_OR_PARTICLE', 'VERB_OR_ADVERB', 'PARTICLE_OR_ADVERB', 'NOUN_VERB_OR_ADVERB', 'NOUN_OR_INTERJECTION', 'ADVERB_OR_INTERJECTION', 'VERB_OR_PARTICLE', 'NOUN_OR_PREPOSITION');

-- CreateEnum
CREATE TYPE "RelationType" AS ENUM ('SYNONYM', 'REGIONAL_VARIANT', 'ASSOCIATED_CONCEPT', 'ANTONYM', 'HYPERNYM', 'HYPONYM');

-- CreateEnum
CREATE TYPE "Hand" AS ENUM ('RIGHT', 'LEFT', 'BOTH');

-- CreateEnum
CREATE TYPE "GlossStatus" AS ENUM ('PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EditStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "HandConfiguration" AS ENUM ('CONF_1', 'CONF_2', 'CONF_3', 'CONF_4', 'CONF_5', 'CONF_6', 'CONF_1D834', 'CONF_7', 'CONF_8', 'CONF_9', 'CONF_10', 'CONF_11', 'CONF_12', 'CONF_13', 'CONF_14', 'CONF_15', 'CONF_16', 'CONF_1D86C', 'CONF_18', 'CONF_1D82E', 'CONF_19', 'CONF_20', 'CONF_21', 'CONF_22', 'CONF_23', 'CONF_24', 'CONF_25', 'CONF_26', 'CONF_27', 'CONF_29', 'CONF_30', 'CONF_31', 'CONF_32', 'CONF_33', 'CONF_34', 'CONF_35', 'CONF_36', 'CONF_37', 'CONF_38', 'CONF_39', 'CONF_40', 'CONF_1D8C3', 'CONF_42', 'CONF_1D87D', 'CONF_1D8C5', 'CONF_1D8A7', 'CONF_1D8B', 'CONF_1D88E', 'CONF_1D8BA', 'CONF_1D8C7', 'CONF_2A');

-- CreateEnum
CREATE TYPE "ConfigurationChange" AS ENUM ('BENDING', 'CLOSING', 'CLOSING_AND_RUBBING', 'CLOSING_AND_WIGGLING', 'CLOSING_TO_OPENING', 'CONSECUTIVE_CLOSING', 'CURVING', 'NONE_TO_SPREADING', 'OPENING', 'OPENING_AND_RUBBING', 'OPENING_AND_SPREADING', 'OPENING_AND_WIGGLING', 'OPENING_TO_CLOSING', 'RUBBING', 'SPREADING', 'UNBENDING', 'UNCURVING', 'UNSPREADING', 'WIGGLING');

-- CreateEnum
CREATE TYPE "RelationBetweenArticulators" AS ENUM ('ABOVE', 'ABOVE_BELOW', 'AROUND', 'BACK', 'BELOW', 'CROSS', 'FRONT', 'FRONT_BACK', 'INSIDE', 'INTERWOVEN', 'NEXT_TO');

-- CreateEnum
CREATE TYPE "Location" AS ENUM ('ARM', 'ARMPIT', 'BACK', 'BACK_OF_HEAD', 'BELLY', 'BREASTS', 'BREAST_IPSI', 'BREAST_CONTRA', 'BRIDGE_OF_NOSE', 'CHEEK', 'CHEEK_CONTRA', 'CHEEKBONE', 'CHEST', 'CHEST_CONTRA', 'CHIN', 'CHIN_CONTRA', 'CROTCH', 'EAR', 'EARLOBE', 'EAST', 'ELBOW', 'EYE', 'EYEBROW', 'FACE', 'FACE_IPSI', 'FLANK', 'FOREHEAD', 'FOREHEAD_CONTRA', 'HEAD', 'HEAD_CONTRA', 'HEAD_IPSI', 'HIP', 'HORIZONTAL_PLANE', 'KNEE', 'LEG', 'LOWER_ARM', 'LOWER_LIP', 'MOUTH', 'MOUTH_CONTRA', 'MOUTH_IPSI', 'NECK', 'NECK_CONTRA', 'NEUTRAL_SPACE', 'NOSE', 'PARALLEL_PLANE', 'R_LOC', 'SHOULDER', 'SHOULDER_CONTRA', 'TEETH', 'TEMPLE', 'THUMB', 'TONGUE', 'TRUNK', 'UPPER_ARM', 'UPPER_LIP', 'VARIABLE', 'VIRTUAL_OBJECT', 'WAIST', 'WEST', 'WRIST', 'WEAK_HAND', 'WEAK_HAND_BACK', 'WEAK_HAND_BASE', 'WEAK_HAND_FINGER_TIPS', 'WEAK_HAND_FINGER', 'WEAK_HAND_FRONT', 'WEAK_HAND_INDEX_FINGER', 'WEAK_HAND_KNUCKLES', 'WEAK_HAND_MIDDLE_FINGER', 'WEAK_HAND_PALM', 'WEAK_HAND_PINKIE', 'WEAK_HAND_PINKIE_SIDE', 'WEAK_HAND_RING_FINGER', 'WEAK_HAND_THENAR', 'WEAK_HAND_THUMB', 'WEAK_HAND_THUMB_SIDE', 'WEAK_HAND_WEB_SPACE', 'BELLY_TO_CHEST', 'CHEEK_TO_CHEEK', 'CHEEK_TO_CHIN', 'CHIN_TO_CHEST', 'CHIN_TO_NEUTRAL_SPACE', 'CHIN_TO_WEAK_HAND_INDEX', 'CHIN_TO_WEAK_HAND_PALM', 'CHIN_TO_WEAK_HAND_THUMB', 'EAR_TO_CHEEK', 'EAR_TO_CHEST', 'EAR_TO_MOUTH', 'EYE_TO_NEUTRAL_SPACE', 'FACE_TO_HEAD', 'FACE_TO_NEUTRAL_SPACE', 'FOREHEAD_TO_CHEST', 'FOREHEAD_TO_CHIN', 'FOREHEAD_TO_NEUTRAL_SPACE', 'FOREHEAD_TO_WEAK_HAND_PALM', 'HEAD_TO_CHEST', 'HEAD_TO_CHEST_TO_SHOULDER', 'HEAD_TO_NEUTRAL_SPACE', 'HEAD_TO_SHOULDER', 'HEAD_TO_WEAK_HAND_PALM', 'LEG_TO_WAIST', 'MOUTH_TO_CHEEK', 'MOUTH_TO_CHEST', 'MOUTH_TO_CHIN', 'MOUTH_TO_NEUTRAL_SPACE', 'MOUTH_TO_WEAK_HAND', 'MOUTH_TO_WEAK_HAND_PALM', 'NECK_TO_CHEST', 'NECK_TO_NEUTRAL_SPACE', 'NEUTRAL_SPACE_TO_HEAD', 'NEUTRAL_SPACE_TO_SHOULDER', 'NEUTRAL_SPACE_TO_NOSE', 'NEUTRAL_SPACE_TO_CHEEK', 'NEUTRAL_SPACE_TO_MOUTH', 'NEUTRAL_SPACE_TO_CHEST', 'NEUTRAL_SPACE_TO_WEAK_HAND', 'NOSE_TO_CHIN', 'NOSE_TO_NEUTRAL_SPACE', 'NOSE_TO_WEAK_HAND', 'R_LOC_TO_R_LOC', 'SHOULDER_TO_CHEST', 'SHOULDER_TO_SHOULDER', 'SHOULDER_TO_WEAK_HAND_PALM', 'SHOULDER_TO_NEUTRAL_SPACE', 'SHOULDER_TO_HIT', 'TEMPLE_TO_CHEST', 'TEMPLE_TO_CHEEK', 'TEMPLE_TO_SHOULDER', 'TEMPLE_TO_NEUTRAL_SPACE', 'WEAK_HAND_TO_ARM', 'WEAK_HAND_TO_NEUTRAL_SPACE', 'WEAK_HAND_THUMB_SIDE_TO_ARM', 'ARMPIT_TO_NEUTRAL_SPACE', 'CHEST_TO_CHIN', 'CHEST_TO_NEUTRAL_SPACE', 'BELLY_AND_FOREHEAD', 'HEAD_AND_NEUTRAL_SPACE', 'FLANK_OR_HEAD', 'NEUTRAL_SPACE_OR_WEAK_HAND_FRONT', 'BOTTOM_OR_CROTCH');

-- CreateEnum
CREATE TYPE "MovementRelatedOrientation" AS ENUM ('BACK', 'BASE', 'FINGER_TIPS', 'FRONT', 'PALM', 'RADIAL', 'ULNAR', 'VARIABLE', 'BACK_AND_BASE', 'BACK_AND_RADIAL', 'BACK_AND_ULNAR', 'BASE_AND_FRONT', 'BASE_AND_PALM', 'BASE_AND_ULNAR', 'FRONT_AND_ULNAR', 'PALM_AND_RADIAL', 'PALM_AND_ULNAR', 'PALM_AND_RADIAL_OR_ULNAR', 'BACK_TO_FINGER_TIPS', 'BACK_TO_FRONT', 'BACK_TO_PALM', 'BACK_TO_RADIAL', 'BASE_TO_BACK', 'BASE_TO_BASE', 'BASE_TO_FRONT', 'BASE_TO_PALM', 'BASE_TO_ULNAR', 'FINGER_TIPS_TO_BACK', 'FINGER_TIPS_TO_BASE', 'FINGER_TIPS_TO_PALM', 'FRONT_TO_BACK', 'PALM_TO_BACK', 'PALM_TO_BASE', 'RADIAL_TO_ULNAR', 'ULNAR_TO_BASE', 'ULNAR_TO_BASE_TO_RADIAL', 'ULNAR_TO_FRONT', 'ULNAR_TO_PALM', 'ULNAR_TO_PALM_TO_RADIAL', 'ULNAR_TO_RADIAL', 'BACK_OR_BASE', 'BACK_OR_FINGER_TIPS', 'BACK_OR_PALM', 'BASE_OR_FRONT', 'FINGER_TIPS_OR_BASE', 'FINGER_TIPS_OR_ULNAR', 'FRONT_OR_PALM', 'RADIAL_OR_ULNAR');

-- CreateEnum
CREATE TYPE "OrientationRelatedToLocation" AS ENUM ('AO_FINGERS_CONTRA', 'AO_FINGERS_DOWN', 'AO_FINGERS_UP', 'AO_PALM_BACKWARDS', 'AO_PALM_DOWN', 'AO_PALM_DOWN_TO_UP', 'AO_PALM_FORWARDS', 'AO_PALM_INWARDS', 'AO_PALM_OUTWARDS', 'AO_PALM_UP', 'AO_PALM_UP_OR_DOWN', 'BACK', 'BACK_TO_PALM', 'BACK_TO_ULNAR', 'BACK_OR_PALM', 'BACK_OR_PALM_TO_PALM', 'BASE', 'COUNTING', 'FINGER_TIPS', 'FINGER_TIPS_OR_BASE', 'FINGERSPELLING', 'FRONT', 'PALM', 'PALM_TO_ULNAR', 'RADIAL', 'RADIAL_OR_ULNAR', 'ULNAR');

-- CreateEnum
CREATE TYPE "OrientationChange" AS ENUM ('EXTENSION', 'EXTENSION_AND_PRONATION', 'EXTENSION_TO_FLEXION', 'EXTENSION_OR_FLEXION', 'FLEXION', 'FLEXION_TO_EXTENSION', 'PRONATION', 'PRONATION_OR_SUPINATION', 'RADIAL_AND_ULNAR_FLEXION', 'RADIAL_FLEXION', 'ROTATION', 'SUPINATION', 'SUPINATION_TO_PRONATION', 'ULNAR_FLEXION', 'PRONATION_TO_FLEXION', 'SUPINATION_TO_EXTENSION');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('BRUSH', 'CONTINUOUS', 'CONTINUOUS_TO_CONTINUOUS', 'CONTINUOUS_TO_FINAL', 'CONTINUOUS_TO_NONE', 'DOUBLE', 'FINAL', 'FINAL_TO_CONTINUOUS', 'FINAL_TO_NONE', 'INITIAL', 'NONE_TO_FINAL', 'NONE_TO_INITIAL', 'INITIAL_TO_FINAL');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('ARC', 'CIRCLE', 'CROSS', 'MOTIVATED_SHAPE', 'SPIRAL', 'STRAIGHT', 'ZIGZAG', 'STRAIGHT_TO_CIRCLE');

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
    "glossDataId" TEXT NOT NULL,

    CONSTRAINT "DictionaryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlossData" (
    "id" TEXT NOT NULL,
    "gloss" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "editComment" TEXT,
    "currentVersion" INTEGER NOT NULL DEFAULT 1,
    "isCreatedFromRequest" BOOLEAN NOT NULL DEFAULT false,
    "isCreatedFromEdit" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GlossData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelatedGloss" (
    "id" TEXT NOT NULL,
    "relationType" "RelationType" NOT NULL,
    "sourceGlossId" TEXT NOT NULL,
    "targetGlossId" TEXT NOT NULL,

    CONSTRAINT "RelatedGloss_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sense" (
    "id" TEXT NOT NULL,
    "senseTitle" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "lexicalCategory" "LexicalCategory" NOT NULL DEFAULT 'NOUN',
    "glossDataId" TEXT NOT NULL,

    CONSTRAINT "Sense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SenseTranslation" (
    "id" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "senseId" TEXT NOT NULL,

    CONSTRAINT "SenseTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Definition" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "definition" TEXT NOT NULL,
    "videoDefinitionUrl" TEXT,
    "senseId" TEXT NOT NULL,

    CONSTRAINT "Definition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Example" (
    "id" TEXT NOT NULL,
    "example" TEXT NOT NULL,
    "exampleVideoURL" TEXT NOT NULL,
    "senseId" TEXT NOT NULL,

    CONSTRAINT "Example_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExampleTranslation" (
    "id" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "exampleId" TEXT,

    CONSTRAINT "ExampleTranslation_pkey" PRIMARY KEY ("id")
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
    "videoDataId" TEXT NOT NULL,
    "senseId" TEXT NOT NULL,

    CONSTRAINT "SignVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoData" (
    "hands" "Hand" NOT NULL,
    "configuration" "HandConfiguration" NOT NULL,
    "configurationChanges" "ConfigurationChange" NOT NULL,
    "relationBetweenArticulators" "RelationBetweenArticulators" NOT NULL,
    "location" "Location" NOT NULL,
    "movementRelatedOrientation" "MovementRelatedOrientation" NOT NULL,
    "orientationRelatedToLocation" "OrientationRelatedToLocation" NOT NULL,
    "orientationChange" "OrientationChange" NOT NULL,
    "contactType" "ContactType" NOT NULL,
    "movementType" "MovementType" NOT NULL,
    "vocalization" TEXT NOT NULL,
    "nonManualComponent" TEXT NOT NULL,
    "inicialization" TEXT NOT NULL,
    "id" TEXT NOT NULL,

    CONSTRAINT "VideoData_pkey" PRIMARY KEY ("id")
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
    "distinction" TEXT NOT NULL,
    "sourceGlossId" TEXT NOT NULL,
    "targetGlossId" TEXT NOT NULL,

    CONSTRAINT "MinimalPair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlossRequest" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'NOT_COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastEditedSection" TEXT,
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
CREATE UNIQUE INDEX "DictionaryEntry_glossDataId_key" ON "DictionaryEntry"("glossDataId");

-- CreateIndex
CREATE UNIQUE INDEX "RelatedGloss_sourceGlossId_targetGlossId_key" ON "RelatedGloss"("sourceGlossId", "targetGlossId");

-- CreateIndex
CREATE UNIQUE INDEX "MinimalPair_sourceGlossId_targetGlossId_key" ON "MinimalPair"("sourceGlossId", "targetGlossId");

-- CreateIndex
CREATE UNIQUE INDEX "GlossRequest_requestedGlossDataId_key" ON "GlossRequest"("requestedGlossDataId");

-- AddForeignKey
ALTER TABLE "DictionaryEntry" ADD CONSTRAINT "DictionaryEntry_glossRequestId_fkey" FOREIGN KEY ("glossRequestId") REFERENCES "GlossRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DictionaryEntry" ADD CONSTRAINT "DictionaryEntry_glossDataId_fkey" FOREIGN KEY ("glossDataId") REFERENCES "GlossData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelatedGloss" ADD CONSTRAINT "RelatedGloss_sourceGlossId_fkey" FOREIGN KEY ("sourceGlossId") REFERENCES "GlossData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelatedGloss" ADD CONSTRAINT "RelatedGloss_targetGlossId_fkey" FOREIGN KEY ("targetGlossId") REFERENCES "GlossData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sense" ADD CONSTRAINT "Sense_glossDataId_fkey" FOREIGN KEY ("glossDataId") REFERENCES "GlossData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SenseTranslation" ADD CONSTRAINT "SenseTranslation_senseId_fkey" FOREIGN KEY ("senseId") REFERENCES "Sense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "MinimalPair" ADD CONSTRAINT "MinimalPair_sourceGlossId_fkey" FOREIGN KEY ("sourceGlossId") REFERENCES "GlossData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MinimalPair" ADD CONSTRAINT "MinimalPair_targetGlossId_fkey" FOREIGN KEY ("targetGlossId") REFERENCES "GlossData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlossRequest" ADD CONSTRAINT "GlossRequest_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlossRequest" ADD CONSTRAINT "GlossRequest_acceptedById_fkey" FOREIGN KEY ("acceptedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlossRequest" ADD CONSTRAINT "GlossRequest_deniedById_fkey" FOREIGN KEY ("deniedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlossRequest" ADD CONSTRAINT "GlossRequest_requestedGlossDataId_fkey" FOREIGN KEY ("requestedGlossDataId") REFERENCES "GlossData"("id") ON DELETE CASCADE ON UPDATE CASCADE;
