/*
  Warnings:

  - A unique constraint covering the columns `[stockId,productId]` on the table `StockDetails` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "StockDetails_stockId_productId_key" ON "StockDetails"("stockId", "productId");
