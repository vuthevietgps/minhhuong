-- CreateEnum
CREATE TYPE "IdempotencyRecordStatus" AS ENUM ('IN_PROGRESS', 'SUCCEEDED', 'FAILED');

-- CreateTable
CREATE TABLE "OrderStatusHistory" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "fromStatus" "ActivationOrderStatus",
    "toStatus" "ActivationOrderStatus" NOT NULL,
    "action" TEXT NOT NULL,
    "actorUserId" TEXT,
    "reason" TEXT,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdempotencyRecord" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "actorUserId" TEXT,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "requestHash" TEXT NOT NULL,
    "status" "IdempotencyRecordStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "responseJson" JSONB,
    "errorCode" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdempotencyRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderStatusHistory_orderId_createdAt_idx" ON "OrderStatusHistory"("orderId", "createdAt");

-- CreateIndex
CREATE INDEX "OrderStatusHistory_action_createdAt_idx" ON "OrderStatusHistory"("action", "createdAt");

-- CreateIndex
CREATE INDEX "OrderStatusHistory_actorUserId_createdAt_idx" ON "OrderStatusHistory"("actorUserId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "IdempotencyRecord_scope_key_key" ON "IdempotencyRecord"("scope", "key");

-- CreateIndex
CREATE INDEX "IdempotencyRecord_actorUserId_createdAt_idx" ON "IdempotencyRecord"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "IdempotencyRecord_resourceType_resourceId_idx" ON "IdempotencyRecord"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "IdempotencyRecord_status_expiresAt_idx" ON "IdempotencyRecord"("status", "expiresAt");

-- AddForeignKey
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ActivationOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdempotencyRecord" ADD CONSTRAINT "IdempotencyRecord_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
