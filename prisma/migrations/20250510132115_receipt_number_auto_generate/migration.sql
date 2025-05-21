/*
  Warnings:

  - The `receiptNumber` column on the `Receipt` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Receipt" DROP COLUMN "receiptNumber",
ADD COLUMN     "receiptNumber" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_receiptNumber_key" ON "Receipt"("receiptNumber");
