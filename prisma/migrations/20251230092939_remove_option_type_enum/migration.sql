-- Convert enum values to strings before dropping the column
ALTER TABLE "category_options" ADD COLUMN "optionType_new" TEXT;
UPDATE "category_options" SET "optionType_new" = 
  CASE 
    WHEN "optionType" = 'SIZE' THEN 'Size'
    WHEN "optionType" = 'ICE_LEVEL' THEN 'Ice Level'
    WHEN "optionType" = 'SUGAR_LEVEL' THEN 'Sugar Level'
    ELSE "optionType"::text
  END;
ALTER TABLE "category_options" DROP COLUMN "optionType";
ALTER TABLE "category_options" RENAME COLUMN "optionType_new" TO "optionType";
ALTER TABLE "category_options" ALTER COLUMN "optionType" SET NOT NULL;

-- Convert enum values to strings for order_item_options
ALTER TABLE "order_item_options" ADD COLUMN "optionType_new" TEXT;
UPDATE "order_item_options" SET "optionType_new" = 
  CASE 
    WHEN "optionType" = 'SIZE' THEN 'Size'
    WHEN "optionType" = 'ICE_LEVEL' THEN 'Ice Level'
    WHEN "optionType" = 'SUGAR_LEVEL' THEN 'Sugar Level'
    ELSE "optionType"::text
  END;
ALTER TABLE "order_item_options" DROP COLUMN "optionType";
ALTER TABLE "order_item_options" RENAME COLUMN "optionType_new" TO "optionType";
ALTER TABLE "order_item_options" ALTER COLUMN "optionType" SET NOT NULL;

-- DropEnum
DROP TYPE "OptionType";

-- CreateIndex
CREATE UNIQUE INDEX "category_options_categoryId_optionType_name_key" ON "category_options"("categoryId", "optionType", "name");
