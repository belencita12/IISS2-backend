/*
  Warnings:

  - The values [IN_PROGRESS] on the enum `AppointmentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `serviceId` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the `_EmplyeeAppointment` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `employeeId` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalDuration` to the `Appointment` table without a default value. This is not possible if the table is not empty.

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
ADD COLUMN     "employeeId" INTEGER NOT NULL,
ADD COLUMN     "totalDuration" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_EmplyeeAppointment";

-- CreateTable
CREATE TABLE "AppointmentDetail" (
    "id" SERIAL NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "partialDuration" INTEGER NOT NULL,
    "appointmentId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppointmentDetail_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentDetail" ADD CONSTRAINT "AppointmentDetail_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentDetail" ADD CONSTRAINT "AppointmentDetail_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ServiceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
