-- Shared auth rate-limit and metric state for disposable-local/staging proof.
-- Production activation remains forbidden until retention, monitoring, incident,
-- migration, security, and manual go-live approvals are recorded.

CREATE TABLE "operational_auth_rate_limit_attempts" (
  "id" TEXT NOT NULL,
  "surface" TEXT NOT NULL,
  "key_hash" TEXT NOT NULL,
  "attempted_at" TIMESTAMP(3) NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "operational_auth_rate_limit_attempts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "operational_auth_metric_buckets" (
  "kind" TEXT NOT NULL,
  "bucket_started_at" TIMESTAMP(3) NOT NULL,
  "count" INTEGER NOT NULL,
  "last_occurred_at" TIMESTAMP(3) NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "operational_auth_metric_buckets_pkey"
    PRIMARY KEY ("kind", "bucket_started_at")
);

CREATE INDEX "operational_auth_rate_limit_surface_key_attempted_idx"
  ON "operational_auth_rate_limit_attempts"("surface", "key_hash", "attempted_at");
CREATE INDEX "operational_auth_rate_limit_expires_at_idx"
  ON "operational_auth_rate_limit_attempts"("expires_at");
CREATE INDEX "operational_auth_metric_expires_at_idx"
  ON "operational_auth_metric_buckets"("expires_at");
