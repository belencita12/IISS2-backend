/*
  Warnings:

  - You are about to drop the column `cost` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `priceId` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phoneNumber]` on the table `Provider` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `productId` to the `ProductPrice` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_priceId_fkey";

-- DropIndex
DROP INDEX "Product_priceId_key";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "cost",
DROP COLUMN "priceId",
ADD COLUMN     "providerId" INTEGER,
ALTER COLUMN "category" SET DEFAULT 'PRODUCT';

-- AlterTable
ALTER TABLE "ProductPrice" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "productId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "ProductCost" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "cost" MONEY NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductCost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Provider_phoneNumber_key" ON "Provider"("phoneNumber");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCost" ADD CONSTRAINT "ProductCost_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPrice" ADD CONSTRAINT "ProductPrice_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
