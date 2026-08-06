-- PRE-ACTIVATION ONLY.
-- This removes only the hash-format constraint. The application repository
-- continues to reject malformed hashes, and no session/token/audit row is
-- deleted or rewritten.

ALTER TABLE "auth_refresh_tokens"
  DROP CONSTRAINT IF EXISTS "auth_refresh_tokens_token_hash_sha256_chk";
