-- Persistent authentication sessions for the Prisma AuthSessionStore.
-- This migration is exercised only against disposable local/staging databases
-- until a separate production migration and go-live approval is recorded.

CREATE TYPE "AuthSessionState" AS ENUM ('ACTIVE', 'ENDED', 'REVOKED', 'EXPIRED');
CREATE TYPE "AuthRefreshTokenState" AS ENUM ('ACTIVE', 'ROTATED', 'REUSED', 'REVOKED', 'EXPIRED');
CREATE TYPE "AuthSessionAuditAction" AS ENUM (
  'SESSION_CREATED',
  'SESSION_ENDED',
  'SESSION_REVOKED',
  'SESSION_EXPIRED',
  'REFRESH_TOKEN_ISSUED',
  'REFRESH_TOKEN_ROTATED',
  'REFRESH_TOKEN_DENIED',
  'REFRESH_TOKEN_REUSE_DENIED',
  'SESSION_CLEANUP_EXPIRED'
);

CREATE TABLE "auth_sessions" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "roles" JSONB NOT NULL,
  "device_id" TEXT NOT NULL,
  "state" "AuthSessionState" NOT NULL,
  "issued_at" TIMESTAMP(3) NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "ended_at" TIMESTAMP(3),
  "revoked_at" TIMESTAMP(3),
  "reason" TEXT,
  CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "auth_refresh_tokens" (
  "id" TEXT NOT NULL,
  "session_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "device_id" TEXT NOT NULL,
  "token_hash" TEXT NOT NULL,
  "state" "AuthRefreshTokenState" NOT NULL,
  "issued_at" TIMESTAMP(3) NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "rotated_at" TIMESTAMP(3),
  "reused_at" TIMESTAMP(3),
  "revoked_at" TIMESTAMP(3),
  "replaced_by_token_id" TEXT,
  "reason" TEXT,
  CONSTRAINT "auth_refresh_tokens_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "auth_session_audit_events" (
  "id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL,
  "action" "AuthSessionAuditAction" NOT NULL,
  "session_id" TEXT,
  "refresh_token_id" TEXT,
  "user_id" TEXT,
  "device_id" TEXT,
  "reason" TEXT,
  "visible_to_roles" TEXT[] NOT NULL,
  "metadata" JSONB,
  CONSTRAINT "auth_session_audit_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "auth_sessions_user_id_state_expires_at_idx"
  ON "auth_sessions"("user_id", "state", "expires_at");
CREATE INDEX "auth_sessions_device_id_state_idx"
  ON "auth_sessions"("device_id", "state");
CREATE INDEX "auth_sessions_expires_at_idx"
  ON "auth_sessions"("expires_at");

CREATE INDEX "auth_refresh_tokens_session_id_state_idx"
  ON "auth_refresh_tokens"("session_id", "state");
CREATE INDEX "auth_refresh_tokens_user_id_state_expires_at_idx"
  ON "auth_refresh_tokens"("user_id", "state", "expires_at");
CREATE INDEX "auth_refresh_tokens_token_hash_idx"
  ON "auth_refresh_tokens"("token_hash");
CREATE INDEX "auth_refresh_tokens_expires_at_idx"
  ON "auth_refresh_tokens"("expires_at");

CREATE INDEX "auth_session_audit_events_created_at_idx"
  ON "auth_session_audit_events"("created_at");
CREATE INDEX "auth_session_audit_events_session_id_created_at_idx"
  ON "auth_session_audit_events"("session_id", "created_at");
CREATE INDEX "auth_session_audit_events_user_id_created_at_idx"
  ON "auth_session_audit_events"("user_id", "created_at");
CREATE INDEX "auth_session_audit_events_action_created_at_idx"
  ON "auth_session_audit_events"("action", "created_at");

ALTER TABLE "auth_sessions"
  ADD CONSTRAINT "auth_sessions_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "auth_refresh_tokens"
  ADD CONSTRAINT "auth_refresh_tokens_session_id_fkey"
  FOREIGN KEY ("session_id") REFERENCES "auth_sessions"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "auth_refresh_tokens"
  ADD CONSTRAINT "auth_refresh_tokens_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
