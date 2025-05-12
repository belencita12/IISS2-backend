/*
  Warnings:

  - You are about to drop the column `appointmentId` on the `VaccineRegistry` table. All the data in the column will be lost.
  - Added the required column `endAt` to the `AppointmentDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `partialDuration` to the `AppointmentDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startAt` to the `AppointmentDetail` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "VaccineRegistry" DROP CONSTRAINT "VaccineRegistry_appointmentId_fkey";

-- AlterTable
ALTER TABLE "AppointmentDetail" ADD COLUMN     "endAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "partialDuration" INTEGER NOT NULL,
ADD COLUMN     "startAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "VaccineRegistry" DROP COLUMN "appointmentId";
