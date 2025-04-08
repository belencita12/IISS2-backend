-- CreateTable
CREATE TABLE "WorkPosition" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "WorkPosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkShift" (
    "id" SERIAL NOT NULL,
    "workPositionId" INTEGER NOT NULL,
    "weekDay" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "WorkShift_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkShift_workPositionId_weekDay_startTime_endTime_key" ON "WorkShift"("workPositionId", "weekDay", "startTime", "endTime");

-- AddForeignKey
ALTER TABLE "WorkShift" ADD CONSTRAINT "WorkShift_workPositionId_fkey" FOREIGN KEY ("workPositionId") REFERENCES "WorkPosition"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
