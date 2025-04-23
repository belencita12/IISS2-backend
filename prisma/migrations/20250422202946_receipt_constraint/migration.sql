/*
  Warnings:

  - A unique constraint covering the columns `[receiptNumber]` on the table `Receipt` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Receipt_receiptNumber_invoiceId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_receiptNumber_key" ON "Receipt"("receiptNumber");
