-- RenameIndex
ALTER INDEX "operational_auth_metric_expires_at_idx" RENAME TO "operational_auth_metric_buckets_expires_at_idx";

-- RenameIndex
ALTER INDEX "operational_auth_rate_limit_expires_at_idx" RENAME TO "operational_auth_rate_limit_attempts_expires_at_idx";

-- RenameIndex
ALTER INDEX "operational_auth_rate_limit_surface_key_attempted_idx" RENAME TO "operational_auth_rate_limit_attempts_surface_key_hash_attem_idx";
