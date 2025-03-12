/*
  Warnings:

  - You are about to drop the column `productId` on the `Vaccine` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[vaccineId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `vaccineId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Pet" DROP CONSTRAINT "Pet_vaccinationCartId_fkey";

-- DropForeignKey
ALTER TABLE "Vaccine" DROP CONSTRAINT "Vaccine_productId_fkey";

-- AlterTable
ALTER TABLE "Pet" ALTER COLUMN "vaccinationCartId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "vaccineId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Vaccine" DROP COLUMN "productId";

-- CreateIndex
CREATE UNIQUE INDEX "Product_vaccineId_key" ON "Product"("vaccineId");

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_vaccinationCartId_fkey" FOREIGN KEY ("vaccinationCartId") REFERENCES "VaccinationCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_vaccineId_fkey" FOREIGN KEY ("vaccineId") REFERENCES "Vaccine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
