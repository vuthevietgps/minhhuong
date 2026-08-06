-- Narrow nullable proof field for approve-time commission attribution.
ALTER TABLE "CommissionEarning" ADD COLUMN "attributionSnapshotJson" JSONB;
