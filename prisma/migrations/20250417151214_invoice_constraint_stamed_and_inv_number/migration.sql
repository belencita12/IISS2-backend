/*
  Warnings:

  - A unique constraint covering the columns `[invoiceNumber,stamped]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_stamped_key" ON "Invoice"("invoiceNumber", "stamped");
