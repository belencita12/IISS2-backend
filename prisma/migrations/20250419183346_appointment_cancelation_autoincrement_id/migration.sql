-- AlterTable
CREATE SEQUENCE appointmentcancelation_id_seq;
ALTER TABLE "AppointmentCancelation" ALTER COLUMN "id" SET DEFAULT nextval('appointmentcancelation_id_seq');
ALTER SEQUENCE appointmentcancelation_id_seq OWNED BY "AppointmentCancelation"."id";
