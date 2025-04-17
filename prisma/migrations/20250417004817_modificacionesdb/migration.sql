/*
  Warnings:

  - Added the required column `updatedAt` to the `InvoicePaymentMethod` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PaymentMethod` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InvoicePaymentMethod" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "PaymentMethod" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "deletedAt" DROP DEFAULT;
