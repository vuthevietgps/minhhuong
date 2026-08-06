-- Narrow nullable order-time commission chain snapshot for affiliate-attributed orders.
ALTER TABLE "ActivationOrder" ADD COLUMN "commissionChainSnapshotJson" JSONB;
