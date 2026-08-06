-- Deterministic bounded incident-export pagination for the existing redacted,
-- append-only auth-alert evaluation audit. No identity or credential columns
-- are introduced by this read-model migration.

CREATE INDEX "op_auth_alert_eval_audits_page_idx"
  ON "operational_auth_alert_evaluation_audits"(
    "evaluated_at" DESC,
    "correlation_id" DESC
  );
