/*
  Warnings:

  - Added the required column `categoryId` to the `add_ons` table without a default value. This is not possible if the table is not empty.

*/
-- Step 1: Add categoryId as nullable first
ALTER TABLE "add_ons" ADD COLUMN "categoryId" TEXT;

-- Step 2: Update existing add_ons to use the first available category
UPDATE "add_ons" SET "categoryId" = (
  SELECT "id" FROM "categories" LIMIT 1
) WHERE "categoryId" IS NULL;

-- Step 3: Make categoryId NOT NULL
ALTER TABLE "add_ons" ALTER COLUMN "categoryId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "add_ons" ADD CONSTRAINT "add_ons_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
