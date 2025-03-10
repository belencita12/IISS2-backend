/*
  Warnings:

  - You are about to drop the column `profileImg` on the `Pet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Pet" DROP COLUMN "profileImg",
ADD COLUMN     "imageId" INTEGER;

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
