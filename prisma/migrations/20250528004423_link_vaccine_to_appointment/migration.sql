-- AlterTable
ALTER TABLE "VaccineRegistry" ADD COLUMN     "appointmentId" INTEGER;

-- AddForeignKey
ALTER TABLE "VaccineRegistry" ADD CONSTRAINT "VaccineRegistry_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
