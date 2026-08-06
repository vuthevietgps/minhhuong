-- PRE-ACTIVATION ONLY.
-- Safe only when AUTH_SESSION_STORE_PROVIDER has never served real traffic and
-- the disposable local/staging fixture database contains no required auth data.

DROP TABLE IF EXISTS "auth_session_audit_events";
DROP TABLE IF EXISTS "auth_refresh_tokens";
DROP TABLE IF EXISTS "auth_sessions";
DROP TYPE IF EXISTS "AuthSessionAuditAction";
DROP TYPE IF EXISTS "AuthRefreshTokenState";
DROP TYPE IF EXISTS "AuthSessionState";
