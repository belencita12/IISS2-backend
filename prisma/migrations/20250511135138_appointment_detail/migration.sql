/*
  Warnings:

  - The values [IN_PROGRESS] on the enum `AppointmentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `serviceId` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the `_EmplyeeAppointment` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `totalDuration` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `appointmentId` to the `VaccineRegistry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AppointmentStatus_new" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');
ALTER TABLE "Appointment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Appointment" ALTER COLUMN "status" TYPE "AppointmentStatus_new" USING ("status"::text::"AppointmentStatus_new");
ALTER TYPE "AppointmentStatus" RENAME TO "AppointmentStatus_old";
ALTER TYPE "AppointmentStatus_new" RENAME TO "AppointmentStatus";
DROP TYPE "AppointmentStatus_old";
ALTER TABLE "Appointment" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "_EmplyeeAppointment" DROP CONSTRAINT "_EmplyeeAppointment_A_fkey";

-- DropForeignKey
ALTER TABLE "_EmplyeeAppointment" DROP CONSTRAINT "_EmplyeeAppointment_B_fkey";

-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "serviceId",
ADD COLUMN     "totalDuration" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "VaccineRegistry" ADD COLUMN     "appointmentId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_EmplyeeAppointment";

-- CreateTable
CREATE TABLE "AppointmentDetail" (
    "id" SERIAL NOT NULL,
    "appointmentId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppointmentDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EmplyeeAppointmentDetail" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_EmplyeeAppointmentDetail_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EmplyeeAppointmentDetail_B_index" ON "_EmplyeeAppointmentDetail"("B");

-- AddForeignKey
ALTER TABLE "AppointmentDetail" ADD CONSTRAINT "AppointmentDetail_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentDetail" ADD CONSTRAINT "AppointmentDetail_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ServiceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaccineRegistry" ADD CONSTRAINT "VaccineRegistry_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "AppointmentDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmplyeeAppointmentDetail" ADD CONSTRAINT "_EmplyeeAppointmentDetail_A_fkey" FOREIGN KEY ("A") REFERENCES "AppointmentDetail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmplyeeAppointmentDetail" ADD CONSTRAINT "_EmplyeeAppointmentDetail_B_fkey" FOREIGN KEY ("B") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
