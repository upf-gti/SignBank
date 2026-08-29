-- DropForeignKey
ALTER TABLE "VideoData" DROP CONSTRAINT "VideoData_configurationChangesId_fkey";

-- DropForeignKey
ALTER TABLE "VideoData" DROP CONSTRAINT "VideoData_contactTypeId_fkey";

-- DropForeignKey
ALTER TABLE "VideoData" DROP CONSTRAINT "VideoData_handednessId_fkey";

-- DropForeignKey
ALTER TABLE "VideoData" DROP CONSTRAINT "VideoData_locationId_fkey";

-- DropForeignKey
ALTER TABLE "VideoData" DROP CONSTRAINT "VideoData_movementDirectionId_fkey";

-- DropForeignKey
ALTER TABLE "VideoData" DROP CONSTRAINT "VideoData_movementRelatedOrientationId_fkey";

-- DropForeignKey
ALTER TABLE "VideoData" DROP CONSTRAINT "VideoData_movementTypeId_fkey";

-- DropForeignKey
ALTER TABLE "VideoData" DROP CONSTRAINT "VideoData_orientationChangeId_fkey";

-- DropForeignKey
ALTER TABLE "VideoData" DROP CONSTRAINT "VideoData_orientationRelatedToLocationId_fkey";

-- AlterTable
ALTER TABLE "VideoData" ALTER COLUMN "handednessId" DROP NOT NULL,
ALTER COLUMN "configurationChangesId" DROP NOT NULL,
ALTER COLUMN "locationId" DROP NOT NULL,
ALTER COLUMN "movementRelatedOrientationId" DROP NOT NULL,
ALTER COLUMN "orientationRelatedToLocationId" DROP NOT NULL,
ALTER COLUMN "orientationChangeId" DROP NOT NULL,
ALTER COLUMN "contactTypeId" DROP NOT NULL,
ALTER COLUMN "movementTypeId" DROP NOT NULL,
ALTER COLUMN "movementDirectionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "VideoData" ADD CONSTRAINT "VideoData_handednessId_fkey" FOREIGN KEY ("handednessId") REFERENCES "PhonologyValue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoData" ADD CONSTRAINT "VideoData_configurationChangesId_fkey" FOREIGN KEY ("configurationChangesId") REFERENCES "PhonologyValue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoData" ADD CONSTRAINT "VideoData_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "PhonologyValue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoData" ADD CONSTRAINT "VideoData_movementRelatedOrientationId_fkey" FOREIGN KEY ("movementRelatedOrientationId") REFERENCES "PhonologyValue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoData" ADD CONSTRAINT "VideoData_orientationRelatedToLocationId_fkey" FOREIGN KEY ("orientationRelatedToLocationId") REFERENCES "PhonologyValue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoData" ADD CONSTRAINT "VideoData_orientationChangeId_fkey" FOREIGN KEY ("orientationChangeId") REFERENCES "PhonologyValue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoData" ADD CONSTRAINT "VideoData_contactTypeId_fkey" FOREIGN KEY ("contactTypeId") REFERENCES "PhonologyValue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoData" ADD CONSTRAINT "VideoData_movementTypeId_fkey" FOREIGN KEY ("movementTypeId") REFERENCES "PhonologyValue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoData" ADD CONSTRAINT "VideoData_movementDirectionId_fkey" FOREIGN KEY ("movementDirectionId") REFERENCES "PhonologyValue"("id") ON DELETE SET NULL ON UPDATE CASCADE;
