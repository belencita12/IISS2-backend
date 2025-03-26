-- CreateTable
CREATE TABLE "Provider" (
    "id" SERIAL NOT NULL,
    "businessName" TEXT NOT NULL,
    "description" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "ruc" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Provider_businessName_key" ON "Provider"("businessName");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_ruc_key" ON "Provider"("ruc");
