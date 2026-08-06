-- Shared auth-alert cooldown/deduplication state for disposable-local and
-- separately approved staging evidence. Production activation remains blocked.

CREATE TABLE "operational_auth_alert_states" (
  "fingerprint" TEXT NOT NULL,
  "alert_code" TEXT NOT NULL,
  "last_opened_at" TIMESTAMP(3) NOT NULL,
  "cooldown_until" TIMESTAMP(3) NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "operational_auth_alert_states_pkey" PRIMARY KEY ("fingerprint"),
  CONSTRAINT "operational_auth_alert_states_fingerprint_redacted_chk"
    CHECK ("fingerprint" ~ '^auth-operational-alert:[A-Z0-9_:-]+$'),
  CONSTRAINT "operational_auth_alert_states_expiry_order_chk"
    CHECK (
      "cooldown_until" >= "last_opened_at"
      AND "expires_at" >= "cooldown_until"
    )
);

CREATE INDEX "operational_auth_alert_states_expires_at_idx"
  ON "operational_auth_alert_states"("expires_at");
