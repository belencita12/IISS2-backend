-- CreateTable
CREATE TABLE "Stamped" (
    "id" SERIAL NOT NULL,
    "stampedNum" TEXT NOT NULL,
    "fromDate" DATE NOT NULL,
    "toDate" DATE NOT NULL,
    "fromNum" INTEGER NOT NULL,
    "toNum" INTEGER NOT NULL,
    "currentNum" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Stamped_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Stamped_stampedNum_key" ON "Stamped"("stampedNum");
