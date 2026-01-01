-- AlterTable
ALTER TABLE "orders" ADD COLUMN "orderNumber" TEXT;

-- Create unique index
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- Update existing orders with generated order numbers
UPDATE "orders" SET "orderNumber" = 
  CONCAT(
    CHR(65 + (RANDOM() * 25)::INT),
    CHR(65 + (RANDOM() * 25)::INT), 
    CHR(65 + (RANDOM() * 25)::INT),
    CHR(65 + (RANDOM() * 25)::INT),
    LPAD((1000 + (RANDOM() * 9000)::INT)::TEXT, 4, '0')
  )
WHERE "orderNumber" IS NULL;

-- Make orderNumber required
ALTER TABLE "orders" ALTER COLUMN "orderNumber" SET NOT NULL;