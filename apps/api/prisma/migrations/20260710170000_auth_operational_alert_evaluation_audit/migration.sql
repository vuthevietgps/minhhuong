-- Redacted append-only auth-alert evaluation correlation for disposable-local
-- and separately approved staging evidence. Production activation remains blocked.

CREATE TABLE "operational_auth_alert_evaluation_audits" (
  "correlation_id" TEXT NOT NULL,
  "input_digest" TEXT NOT NULL,
  "evaluated_at" TIMESTAMP(3) NOT NULL,
  "decision" TEXT NOT NULL,
  "candidate_count" INTEGER NOT NULL,
  "open_candidate_count" INTEGER NOT NULL,
  "suppressed_candidate_count" INTEGER NOT NULL,
  "decisions_json" JSONB NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "operational_auth_alert_evaluation_audits_pkey"
    PRIMARY KEY ("correlation_id"),
  CONSTRAINT "operational_auth_alert_evaluation_audits_correlation_redacted_chk"
    CHECK (
      "correlation_id" ~ '^auth-alert-evaluation:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    ),
  CONSTRAINT "operational_auth_alert_evaluation_audits_digest_chk"
    CHECK ("input_digest" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "operational_auth_alert_evaluation_audits_decision_chk"
    CHECK (
      "decision" IN (
        'ALERT_CANDIDATES_OPEN',
        'ALERT_CANDIDATES_SUPPRESSED',
        'NO_ALERT_CANDIDATES'
      )
    ),
  CONSTRAINT "operational_auth_alert_evaluation_audits_counts_chk"
    CHECK (
      "candidate_count" >= 0
      AND "open_candidate_count" >= 0
      AND "suppressed_candidate_count" >= 0
      AND "candidate_count" =
        "open_candidate_count" + "suppressed_candidate_count"
    ),
  CONSTRAINT "operational_auth_alert_evaluation_audits_expiry_chk"
    CHECK ("expires_at" > "evaluated_at"),
  CONSTRAINT "operational_auth_alert_evaluation_audits_decisions_json_chk"
    CHECK (jsonb_typeof("decisions_json") = 'array')
);

CREATE INDEX "operational_auth_alert_evaluation_audits_expires_at_idx"
  ON "operational_auth_alert_evaluation_audits"("expires_at");

CREATE FUNCTION "reject_operational_auth_alert_evaluation_audit_update"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'operational auth alert evaluation audits are append-only';
END;
$$;

CREATE TRIGGER "operational_auth_alert_evaluation_audits_append_only_trg"
BEFORE UPDATE ON "operational_auth_alert_evaluation_audits"
FOR EACH ROW
EXECUTE FUNCTION "reject_operational_auth_alert_evaluation_audit_update"();
