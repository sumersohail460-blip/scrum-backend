/*
  Warnings:

  - You are about to drop the column `price` on the `items` table. All the data in the column will be lost.
  - Added the required column `currentPrice` to the `items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "items" DROP COLUMN "price",
ADD COLUMN     "currentPrice" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "detail" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "previousPrice" DECIMAL(10,2),
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0;
