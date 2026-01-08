-- Update any existing orders with removed statuses to PENDING
UPDATE "orders" SET "status" = 'PENDING' WHERE "status" IN ('CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED');

-- Remove unused enum values (PostgreSQL doesn't support removing enum values directly)
-- We need to create a new enum and replace the old one
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING', 'COMPLETED');

-- Update the table to use the new enum
ALTER TABLE "orders" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");

-- Drop the old enum and rename the new one
DROP TYPE "OrderStatus";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";