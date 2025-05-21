-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "ServiceType" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxColabs" INTEGER;

-- CreateTable
CREATE TABLE "Appointment" (
    "id" SERIAL NOT NULL,
    "designatedDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "details" TEXT,
    "serviceId" INTEGER NOT NULL,
    "petId" INTEGER NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppointmentCancelation" (
    "id" INTEGER NOT NULL,
    "details" TEXT NOT NULL,
    "managerId" INTEGER NOT NULL,
    "appointmentId" INTEGER NOT NULL,

    CONSTRAINT "AppointmentCancelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EmplyeeAppointment" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_EmplyeeAppointment_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppointmentCancelation_appointmentId_key" ON "AppointmentCancelation"("appointmentId");

-- CreateIndex
CREATE INDEX "_EmplyeeAppointment_B_index" ON "_EmplyeeAppointment"("B");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ServiceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentCancelation" ADD CONSTRAINT "AppointmentCancelation_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentCancelation" ADD CONSTRAINT "AppointmentCancelation_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmplyeeAppointment" ADD CONSTRAINT "_EmplyeeAppointment_A_fkey" FOREIGN KEY ("A") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmplyeeAppointment" ADD CONSTRAINT "_EmplyeeAppointment_B_fkey" FOREIGN KEY ("B") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
