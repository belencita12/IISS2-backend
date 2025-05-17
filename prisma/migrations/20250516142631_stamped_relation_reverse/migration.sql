/*
  Warnings:

  - You are about to drop the column `stampedId` on the `Stock` table. All the data in the column will be lost.
  - Added the required column `stockId` to the `Stamped` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_stampedId_fkey";

-- DropIndex
DROP INDEX "Stock_stampedId_key";

-- AlterTable
ALTER TABLE "Stamped" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "stockId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Stock" DROP COLUMN "stampedId";

-- AddForeignKey
ALTER TABLE "Stamped" ADD CONSTRAINT "Stamped_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
