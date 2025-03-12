-- AlterTable
ALTER TABLE "Pet" ADD COLUMN     "vaccinationCartId" INTEGER;

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
    "productId" INTEGER NOT NULL,
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
CREATE UNIQUE INDEX "Vaccine_productId_key" ON "Vaccine"("productId");

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_vaccinationCartId_fkey" FOREIGN KEY ("vaccinationCartId") REFERENCES "VaccinationCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaccinationCardDetails" ADD CONSTRAINT "VaccinationCardDetails_vaccinationCardId_fkey" FOREIGN KEY ("vaccinationCardId") REFERENCES "VaccinationCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaccinationCardDetails" ADD CONSTRAINT "VaccinationCardDetails_vaccineId_fkey" FOREIGN KEY ("vaccineId") REFERENCES "Vaccine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaccineBatch" ADD CONSTRAINT "VaccineBatch_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "VaccineManufacturer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vaccine" ADD CONSTRAINT "Vaccine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vaccine" ADD CONSTRAINT "Vaccine_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "VaccineManufacturer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vaccine" ADD CONSTRAINT "Vaccine_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "VaccineBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
