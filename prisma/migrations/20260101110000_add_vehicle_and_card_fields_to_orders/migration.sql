-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "cardCvc" TEXT,
ADD COLUMN     "cardExpiry" TEXT,
ADD COLUMN     "cardHolder" TEXT,
ADD COLUMN     "cardNumber" TEXT,
ADD COLUMN     "vehicleId" TEXT;

-- AddForeignKeyConstraint
ALTER TABLE "orders" ADD CONSTRAINT "orders_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;