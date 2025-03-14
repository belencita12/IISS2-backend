-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "JwtBlackList" ADD COLUMN     "deletedAt" TIMESTAMP(3);
