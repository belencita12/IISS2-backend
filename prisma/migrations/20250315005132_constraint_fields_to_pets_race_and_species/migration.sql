/*
  Warnings:

  - A unique constraint covering the columns `[name,userId]` on the table `Pet` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,speciesId]` on the table `Race` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Species` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Pet_name_userId_key" ON "Pet"("name", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Race_name_speciesId_key" ON "Race"("name", "speciesId");

-- CreateIndex
CREATE UNIQUE INDEX "Species_name_key" ON "Species"("name");
