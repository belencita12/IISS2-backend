-- AlterTable
ALTER TABLE "Movement" ALTER COLUMN "dateMovement" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "Purchase" ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "date" SET DATA TYPE DATE;
