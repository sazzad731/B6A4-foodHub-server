/*
  Warnings:

  - Added the required column `name` to the `meals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- 1. Add the column as nullable
ALTER TABLE "meals" ADD COLUMN "name" TEXT;

-- 2. Give existing rows a dummy name so the 'NOT NULL' constraint doesn't fail
UPDATE "meals" SET "name" = 'Default Meal Name' WHERE "name" IS NULL;

-- 3. Now make it required
ALTER TABLE "meals" ALTER COLUMN "name" SET NOT NULL;
