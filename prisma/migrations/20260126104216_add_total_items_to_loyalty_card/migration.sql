/*
  Warnings:

  - You are about to drop the `loyalty_card_items` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "loyalty_card_items" DROP CONSTRAINT "loyalty_card_items_loyaltyCardId_fkey";

-- DropForeignKey
ALTER TABLE "loyalty_card_items" DROP CONSTRAINT "loyalty_card_items_orderId_fkey";

-- AlterTable
ALTER TABLE "loyalty_cards" ADD COLUMN     "totalItems" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "loyalty_card_items";
