DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "VideoData") AND NOT EXISTS (SELECT 1 FROM "PhonologyValue") THEN
    RAISE EXCEPTION 'PhonologyValue catalog is empty; seed it before converting VideoData to foreign keys';
  END IF;
END $$;

-- Add nullable FK columns while keeping existing code columns
ALTER TABLE "VideoData" ADD COLUMN "handednessId" TEXT;
ALTER TABLE "VideoData" ADD COLUMN "dominantConfigurationId" TEXT;
ALTER TABLE "VideoData" ADD COLUMN "nonDominantConfigurationId" TEXT;
ALTER TABLE "VideoData" ADD COLUMN "dominantRelationBetweenArticulatorsId" TEXT;
ALTER TABLE "VideoData" ADD COLUMN "nonDominantRelationBetweenArticulatorsId" TEXT;
ALTER TABLE "VideoData" ADD COLUMN "configurationChangesId" TEXT;
ALTER TABLE "VideoData" ADD COLUMN "locationId" TEXT;
ALTER TABLE "VideoData" ADD COLUMN "movementRelatedOrientationId" TEXT;
ALTER TABLE "VideoData" ADD COLUMN "orientationRelatedToLocationId" TEXT;
ALTER TABLE "VideoData" ADD COLUMN "orientationChangeId" TEXT;
ALTER TABLE "VideoData" ADD COLUMN "contactTypeId" TEXT;
ALTER TABLE "VideoData" ADD COLUMN "movementTypeId" TEXT;
ALTER TABLE "VideoData" ADD COLUMN "movementDirectionId" TEXT;

UPDATE "VideoData" v SET "handednessId" = p.id FROM "PhonologyValue" p WHERE p.dimension = 'HANDEDNESS' AND p.code = v.handedness;
UPDATE "VideoData" v SET "dominantConfigurationId" = p.id FROM "PhonologyValue" p WHERE p.dimension = 'HAND_CONFIGURATION' AND p.code = v."dominantConfiguration";
UPDATE "VideoData" v SET "nonDominantConfigurationId" = p.id FROM "PhonologyValue" p WHERE p.dimension = 'HAND_CONFIGURATION' AND p.code = v."nonDominantConfiguration";
UPDATE "VideoData" v SET "dominantRelationBetweenArticulatorsId" = p.id FROM "PhonologyValue" p WHERE p.dimension = 'RELATION_BETWEEN_ARTICULATORS' AND p.code = v."dominantRelationBetweenArticulators";
UPDATE "VideoData" v SET "nonDominantRelationBetweenArticulatorsId" = p.id FROM "PhonologyValue" p WHERE p.dimension = 'RELATION_BETWEEN_ARTICULATORS' AND p.code = v."nonDominantRelationBetweenArticulators";
UPDATE "VideoData" v SET "configurationChangesId" = p.id FROM "PhonologyValue" p WHERE p.dimension = 'CONFIGURATION_CHANGE' AND p.code = v."configurationChanges";
UPDATE "VideoData" v SET "locationId" = p.id FROM "PhonologyValue" p WHERE p.dimension = 'LOCATION' AND p.code = v.location;
UPDATE "VideoData" v SET "movementRelatedOrientationId" = p.id FROM "PhonologyValue" p WHERE p.dimension = 'MOVEMENT_RELATED_ORIENTATION' AND p.code = v."movementRelatedOrientation";
UPDATE "VideoData" v SET "orientationRelatedToLocationId" = p.id FROM "PhonologyValue" p WHERE p.dimension = 'ORIENTATION_RELATED_TO_LOCATION' AND p.code = v."orientationRelatedToLocation";
UPDATE "VideoData" v SET "orientationChangeId" = p.id FROM "PhonologyValue" p WHERE p.dimension = 'ORIENTATION_CHANGE' AND p.code = v."orientationChange";
UPDATE "VideoData" v SET "contactTypeId" = p.id FROM "PhonologyValue" p WHERE p.dimension = 'CONTACT_TYPE' AND p.code = v."contactType";
UPDATE "VideoData" v SET "movementTypeId" = p.id FROM "PhonologyValue" p WHERE p.dimension = 'MOVEMENT_TYPE' AND p.code = v."movementType";
UPDATE "VideoData" v SET "movementDirectionId" = p.id FROM "PhonologyValue" p WHERE p.dimension = 'MOVEMENT_DIRECTION' AND p.code = v."movementDirection";

ALTER TABLE "VideoData" ALTER COLUMN "handednessId" SET NOT NULL;
ALTER TABLE "VideoData" ALTER COLUMN "configurationChangesId" SET NOT NULL;
ALTER TABLE "VideoData" ALTER COLUMN "locationId" SET NOT NULL;
ALTER TABLE "VideoData" ALTER COLUMN "movementRelatedOrientationId" SET NOT NULL;
ALTER TABLE "VideoData" ALTER COLUMN "orientationRelatedToLocationId" SET NOT NULL;
ALTER TABLE "VideoData" ALTER COLUMN "orientationChangeId" SET NOT NULL;
ALTER TABLE "VideoData" ALTER COLUMN "contactTypeId" SET NOT NULL;
ALTER TABLE "VideoData" ALTER COLUMN "movementTypeId" SET NOT NULL;
ALTER TABLE "VideoData" ALTER COLUMN "movementDirectionId" SET NOT NULL;

ALTER TABLE "VideoData" DROP COLUMN "handedness";
ALTER TABLE "VideoData" DROP COLUMN "dominantConfiguration";
ALTER TABLE "VideoData" DROP COLUMN "nonDominantConfiguration";
ALTER TABLE "VideoData" DROP COLUMN "dominantRelationBetweenArticulators";
ALTER TABLE "VideoData" DROP COLUMN "nonDominantRelationBetweenArticulators";
ALTER TABLE "VideoData" DROP COLUMN "configurationChanges";
ALTER TABLE "VideoData" DROP COLUMN "location";
ALTER TABLE "VideoData" DROP COLUMN "movementRelatedOrientation";
ALTER TABLE "VideoData" DROP COLUMN "orientationRelatedToLocation";
ALTER TABLE "VideoData" DROP COLUMN "orientationChange";
ALTER TABLE "VideoData" DROP COLUMN "contactType";
ALTER TABLE "VideoData" DROP COLUMN "movementType";
ALTER TABLE "VideoData" DROP COLUMN "movementDirection";

ALTER TABLE "VideoData" ADD CONSTRAINT "VideoData_handednessId_fkey" FOREIGN KEY ("handednessId") REFERENCES "PhonologyValue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "VideoData" ADD CONSTRAINT "VideoData_dominantConfigurationId_fkey" FOREIGN KEY ("dominantConfigurationId") REFERENCES "PhonologyValue"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "VideoData" ADD CONSTRAINT "VideoData_nonDominantConfigurationId_fkey" FOREIGN KEY ("nonDominantConfigurationId") REFERENCES "PhonologyValue"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "VideoData" ADD CONSTRAINT "VideoData_dominantRelationBetweenArticulatorsId_fkey" FOREIGN KEY ("dominantRelationBetweenArticulatorsId") REFERENCES "PhonologyValue"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "VideoData" ADD CONSTRAINT "VideoData_nonDominantRelationBetweenArticulatorsId_fkey" FOREIGN KEY ("nonDominantRelationBetweenArticulatorsId") REFERENCES "PhonologyValue"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "VideoData" ADD CONSTRAINT "VideoData_configurationChangesId_fkey" FOREIGN KEY ("configurationChangesId") REFERENCES "PhonologyValue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "VideoData" ADD CONSTRAINT "VideoData_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "PhonologyValue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "VideoData" ADD CONSTRAINT "VideoData_movementRelatedOrientationId_fkey" FOREIGN KEY ("movementRelatedOrientationId") REFERENCES "PhonologyValue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "VideoData" ADD CONSTRAINT "VideoData_orientationRelatedToLocationId_fkey" FOREIGN KEY ("orientationRelatedToLocationId") REFERENCES "PhonologyValue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "VideoData" ADD CONSTRAINT "VideoData_orientationChangeId_fkey" FOREIGN KEY ("orientationChangeId") REFERENCES "PhonologyValue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "VideoData" ADD CONSTRAINT "VideoData_contactTypeId_fkey" FOREIGN KEY ("contactTypeId") REFERENCES "PhonologyValue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "VideoData" ADD CONSTRAINT "VideoData_movementTypeId_fkey" FOREIGN KEY ("movementTypeId") REFERENCES "PhonologyValue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "VideoData" ADD CONSTRAINT "VideoData_movementDirectionId_fkey" FOREIGN KEY ("movementDirectionId") REFERENCES "PhonologyValue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
