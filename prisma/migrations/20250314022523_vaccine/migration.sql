-- CreateTable
CREATE TABLE "VaccineBatch" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "manufacturerId" INTEGER NOT NULL,
    "vaccineId" INTEGER NOT NULL,
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
CREATE TABLE "VaccineRegistry" (
    "id" SERIAL NOT NULL,
    "vaccineId" INTEGER NOT NULL,
    "petId" INTEGER NOT NULL,
    "dose" DOUBLE PRECISION NOT NULL,
    "applicationDate" TIMESTAMP(3),
    "expectedDate" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VaccineRegistry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vaccine" (
    "id" SERIAL NOT NULL,
    "speciesId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "manufacturerId" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vaccine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VaccineBatch_code_key" ON "VaccineBatch"("code");

-- CreateIndex
CREATE UNIQUE INDEX "VaccineManufacturer_name_key" ON "VaccineManufacturer"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Vaccine_productId_key" ON "Vaccine"("productId");

-- AddForeignKey
ALTER TABLE "VaccineBatch" ADD CONSTRAINT "VaccineBatch_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "VaccineManufacturer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaccineBatch" ADD CONSTRAINT "VaccineBatch_vaccineId_fkey" FOREIGN KEY ("vaccineId") REFERENCES "Vaccine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaccineRegistry" ADD CONSTRAINT "VaccineRegistry_vaccineId_fkey" FOREIGN KEY ("vaccineId") REFERENCES "Vaccine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaccineRegistry" ADD CONSTRAINT "VaccineRegistry_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vaccine" ADD CONSTRAINT "Vaccine_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "Species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vaccine" ADD CONSTRAINT "Vaccine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vaccine" ADD CONSTRAINT "Vaccine_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "VaccineManufacturer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
