/*
  Warnings:

  - You are about to drop the column `providerId` on the `provider_profiles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `meals_categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `provider_profiles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `provider_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "provider_profiles" DROP CONSTRAINT "provider_profiles_providerId_fkey";

-- DropIndex
DROP INDEX "provider_profiles_providerId_key";

-- AlterTable
ALTER TABLE "provider_profiles" RENAME COLUMN "providerId" TO "userId";

-- CreateIndex
CREATE UNIQUE INDEX "meals_categories_name_key" ON "meals_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "provider_profiles_userId_key" ON "provider_profiles"("userId");

-- AddForeignKey
ALTER TABLE "provider_profiles" ADD CONSTRAINT "provider_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
