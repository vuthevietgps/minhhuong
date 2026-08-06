-- Fail closed if an auth refresh-token row contains anything other than the
-- lowercase 64-character SHA-256 representation produced by the repository.
-- Existing malformed rows make validation fail and must be revoked through the
-- reviewed forward-repair runbook before this migration is retried.

ALTER TABLE "auth_refresh_tokens"
  ADD CONSTRAINT "auth_refresh_tokens_token_hash_sha256_chk"
  CHECK ("token_hash" ~ '^[0-9a-f]{64}$') NOT VALID;

ALTER TABLE "auth_refresh_tokens"
  VALIDATE CONSTRAINT "auth_refresh_tokens_token_hash_sha256_chk";
