-- CreateTable
CREATE TABLE "loyalty_card_items" (
    "id" TEXT NOT NULL,
    "loyaltyCardId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyalty_card_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "loyalty_card_items" ADD CONSTRAINT "loyalty_card_items_loyaltyCardId_fkey" FOREIGN KEY ("loyaltyCardId") REFERENCES "loyalty_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_card_items" ADD CONSTRAINT "loyalty_card_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
