/*
  Warnings:

  - A unique constraint covering the columns `[stampedId]` on the table `Stock` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phoneNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `stampedId` to the `Stock` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Stock" ADD COLUMN     "stampedId" INTEGER NOT NULL,
ADD COLUMN     "stockNum" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Stock_stampedId_key" ON "Stock"("stampedId");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_stampedId_fkey" FOREIGN KEY ("stampedId") REFERENCES "Stamped"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
