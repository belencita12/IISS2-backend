-- AlterTable
ALTER TABLE "InvoicePaymentMethod" ADD COLUMN     "receiptId" INTEGER;

-- CreateTable
CREATE TABLE "Receipt" (
    "id" SERIAL NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "invoiceId" INTEGER NOT NULL,
    "issueDate" DATE NOT NULL,
    "total" MONEY NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_receiptNumber_invoiceId_key" ON "Receipt"("receiptNumber", "invoiceId");

-- AddForeignKey
ALTER TABLE "InvoicePaymentMethod" ADD CONSTRAINT "InvoicePaymentMethod_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
