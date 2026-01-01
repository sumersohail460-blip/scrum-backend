/*
  Warnings:

  - Added the required column `gst` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platformFee` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceType` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('PICKUP', 'DRIVE_THROUGH');

-- CreateEnum
CREATE TYPE "PickupType" AS ENUM ('STANDARD', 'SCHEDULED');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "gst" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "pickupType" "PickupType",
ADD COLUMN     "platformFee" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "scheduledTime" TIMESTAMP(3),
ADD COLUMN     "serviceType" "ServiceType" NOT NULL,
ADD COLUMN     "subtotal" DECIMAL(10,2) NOT NULL;
