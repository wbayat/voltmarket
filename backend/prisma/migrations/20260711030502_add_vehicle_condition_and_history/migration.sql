-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('NEW', 'USED');

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "condition" "Condition" NOT NULL DEFAULT 'NEW',
ADD COLUMN     "mileage" INTEGER;

-- CreateTable
CREATE TABLE "VehicleHistoryRecord" (
    "id" SERIAL NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleHistoryRecord_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VehicleHistoryRecord" ADD CONSTRAINT "VehicleHistoryRecord_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
