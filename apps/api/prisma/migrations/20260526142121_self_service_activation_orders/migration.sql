-- CreateEnum
CREATE TYPE "ActivationOrderSource" AS ENUM ('SALE_ASSISTED', 'SELF_SERVICE');

-- AlterEnum
ALTER TYPE "ActivationOrderStatus" ADD VALUE 'WAITING_PAYMENT';

-- AlterTable
ALTER TABLE "ActivationOrder" ADD COLUMN     "bankAccountName" TEXT,
ADD COLUMN     "bankAccountNumber" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "packageCode" TEXT,
ADD COLUMN     "packageName" TEXT,
ADD COLUMN     "requestedDurationDays" INTEGER,
ADD COLUMN     "source" "ActivationOrderSource" NOT NULL DEFAULT 'SALE_ASSISTED',
ADD COLUMN     "transferContent" TEXT;
