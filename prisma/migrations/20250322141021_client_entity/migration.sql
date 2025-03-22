/*
  Warnings:

  - You are about to drop the column `ruc` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Pet` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,clientId]` on the table `Pet` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ruc]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clientId` to the `Pet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ruc` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Pet" DROP CONSTRAINT "Pet_userId_fkey";

-- DropIndex
DROP INDEX "Employee_ruc_key";

-- DropIndex
DROP INDEX "Pet_name_userId_key";

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "ruc";

-- AlterTable
ALTER TABLE "Pet" DROP COLUMN "userId",
ADD COLUMN     "clientId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "adress" VARCHAR(100),
ADD COLUMN     "phoneNumber" VARCHAR(20) NOT NULL,
ADD COLUMN     "ruc" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_userId_key" ON "Client"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Pet_name_clientId_key" ON "Pet"("name", "clientId");

-- CreateIndex
CREATE UNIQUE INDEX "User_ruc_key" ON "User"("ruc");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
