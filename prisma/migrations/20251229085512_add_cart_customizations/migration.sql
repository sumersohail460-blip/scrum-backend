-- CreateTable
CREATE TABLE "cart_item_options" (
    "id" TEXT NOT NULL,
    "cartItemId" TEXT NOT NULL,
    "categoryOptionId" TEXT NOT NULL,

    CONSTRAINT "cart_item_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_item_add_ons" (
    "id" TEXT NOT NULL,
    "cartItemId" TEXT NOT NULL,
    "addOnId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "cart_item_add_ons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cart_item_options_cartItemId_categoryOptionId_key" ON "cart_item_options"("cartItemId", "categoryOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "cart_item_add_ons_cartItemId_addOnId_key" ON "cart_item_add_ons"("cartItemId", "addOnId");

-- AddForeignKey
ALTER TABLE "cart_item_options" ADD CONSTRAINT "cart_item_options_cartItemId_fkey" FOREIGN KEY ("cartItemId") REFERENCES "cart_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_item_options" ADD CONSTRAINT "cart_item_options_categoryOptionId_fkey" FOREIGN KEY ("categoryOptionId") REFERENCES "category_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_item_add_ons" ADD CONSTRAINT "cart_item_add_ons_cartItemId_fkey" FOREIGN KEY ("cartItemId") REFERENCES "cart_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_item_add_ons" ADD CONSTRAINT "cart_item_add_ons_addOnId_fkey" FOREIGN KEY ("addOnId") REFERENCES "add_ons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
