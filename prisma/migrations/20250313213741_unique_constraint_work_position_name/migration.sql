/*
  Warnings:

  - You are about to alter the column `name` on the `WorkPosition` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.
  - A unique constraint covering the columns `[name]` on the table `WorkPosition` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "WorkPosition" ALTER COLUMN "name" SET DATA TYPE VARCHAR(64);

-- CreateIndex
CREATE UNIQUE INDEX "WorkPosition_name_key" ON "WorkPosition"("name");
