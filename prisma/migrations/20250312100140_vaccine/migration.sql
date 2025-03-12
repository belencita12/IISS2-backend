/*
  Warnings:

  - A unique constraint covering the columns `[vaccineId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `vaccineId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pet" ADD COLUMN     "vaccinationCartId" INTEGER;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "vaccineId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "VaccinationCardDetails" (
    "id" SERIAL NOT NULL,
    "vaccinationCardId" INTEGER NOT NULL,
    "vaccineId" INTEGER NOT NULL,
    "dose" DOUBLE PRECISION NOT NULL,
    "applicationDate" TIMESTAMP(3),
    "expectedDate" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VaccinationCardDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VaccinationCard" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VaccinationCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VaccineBatch" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "manufacturerId" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VaccineBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VaccineManufacturer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VaccineManufacturer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vaccine" (
    "id" SERIAL NOT NULL,
    "speciesId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "manufacturerId" INTEGER NOT NULL,
    "batchId" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vaccine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VaccineBatch_code_key" ON "VaccineBatch"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Product_vaccineId_key" ON "Product"("vaccineId");

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_vaccinationCartId_fkey" FOREIGN KEY ("vaccinationCartId") REFERENCES "VaccinationCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_vaccineId_fkey" FOREIGN KEY ("vaccineId") REFERENCES "Vaccine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaccinationCardDetails" ADD CONSTRAINT "VaccinationCardDetails_vaccinationCardId_fkey" FOREIGN KEY ("vaccinationCardId") REFERENCES "VaccinationCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaccinationCardDetails" ADD CONSTRAINT "VaccinationCardDetails_vaccineId_fkey" FOREIGN KEY ("vaccineId") REFERENCES "Vaccine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaccineBatch" ADD CONSTRAINT "VaccineBatch_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "VaccineManufacturer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vaccine" ADD CONSTRAINT "Vaccine_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "VaccineManufacturer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vaccine" ADD CONSTRAINT "Vaccine_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "VaccineBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
