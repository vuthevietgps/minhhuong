-- LOCAL/STAGING FORWARD REPAIR ONLY, WITH DATABASE-OWNER APPROVAL.
-- Disable login/refresh traffic before execution and take an approved backup.
-- Malformed values are never exported or restored. Affected tokens are revoked,
-- replaced with a non-authenticating deterministic tombstone hash, and audited.

BEGIN;

LOCK TABLE "auth_refresh_tokens" IN SHARE ROW EXCLUSIVE MODE;

INSERT INTO "auth_session_audit_events" (
  "id",
  "created_at",
  "action",
  "session_id",
  "refresh_token_id",
  "user_id",
  "device_id",
  "reason",
  "visible_to_roles",
  "metadata"
)
SELECT
  'auth-refresh-hash-forward-repair:' || token."id",
  CURRENT_TIMESTAMP,
  'REFRESH_TOKEN_DENIED'::"AuthSessionAuditAction",
  token."session_id",
  token."id",
  token."user_id",
  token."device_id",
  'MALFORMED_TOKEN_HASH_FORWARD_REPAIR',
  ARRAY['ADMIN', 'SUPPORT']::TEXT[],
  jsonb_build_object(
    'repair', 'REVOKE_AND_TOMBSTONE',
    'rawValueExported', false
  )
FROM "auth_refresh_tokens" token
WHERE token."token_hash" !~ '^[0-9a-f]{64}$'
ON CONFLICT ("id") DO NOTHING;

UPDATE "auth_refresh_tokens"
SET
  "state" = 'REVOKED'::"AuthRefreshTokenState",
  "token_hash" =
    md5('auth-refresh-invalid-a:' || "id") ||
    md5('auth-refresh-invalid-b:' || "id"),
  "revoked_at" = COALESCE("revoked_at", CURRENT_TIMESTAMP),
  "reason" = 'MALFORMED_TOKEN_HASH_FORWARD_REPAIR'
WHERE "token_hash" !~ '^[0-9a-f]{64}$';

COMMIT;
