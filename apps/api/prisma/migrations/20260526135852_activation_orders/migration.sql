-- CreateEnum
CREATE TYPE "ActivationOrderStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'CANCELED');

-- CreateTable
CREATE TABLE "ActivationOrder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdById" TEXT,
    "reviewedById" TEXT,
    "status" "ActivationOrderStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "customerEmail" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "durationDays" INTEGER,
    "saleInvoiceUrl" TEXT,
    "saleInvoiceStorageKey" TEXT,
    "saleInvoiceMimeType" TEXT,
    "saleInvoiceFileSizeBytes" INTEGER,
    "operationInvoiceUrl" TEXT,
    "operationInvoiceStorageKey" TEXT,
    "operationInvoiceMimeType" TEXT,
    "operationInvoiceFileSizeBytes" INTEGER,
    "notes" TEXT,
    "reviewNotes" TEXT,
    "activatedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivationOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActivationOrder_status_createdAt_idx" ON "ActivationOrder"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ActivationOrder_customerEmail_idx" ON "ActivationOrder"("customerEmail");

-- CreateIndex
CREATE INDEX "ActivationOrder_userId_idx" ON "ActivationOrder"("userId");

-- AddForeignKey
ALTER TABLE "ActivationOrder" ADD CONSTRAINT "ActivationOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivationOrder" ADD CONSTRAINT "ActivationOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivationOrder" ADD CONSTRAINT "ActivationOrder_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
