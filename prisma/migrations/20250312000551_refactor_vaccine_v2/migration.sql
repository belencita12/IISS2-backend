/*
  Warnings:

  - Added the required column `vaccinationCartId` to the `Pet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pet" ADD COLUMN     "vaccinationCartId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_vaccinationCartId_fkey" FOREIGN KEY ("vaccinationCartId") REFERENCES "VaccinationCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
