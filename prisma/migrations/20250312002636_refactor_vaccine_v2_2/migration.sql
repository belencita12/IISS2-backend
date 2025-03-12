/*
  Warnings:

  - You are about to drop the column `speciedId` on the `Vaccine` table. All the data in the column will be lost.
  - Added the required column `speciesId` to the `Vaccine` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vaccine" DROP COLUMN "speciedId",
ADD COLUMN     "speciesId" INTEGER NOT NULL;
