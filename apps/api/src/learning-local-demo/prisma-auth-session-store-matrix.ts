export type PrismaAuthSessionStoreEvidenceStatus =
  'IMPLEMENTED' | 'VERIFIED_DISPOSABLE_LOCAL' | 'BLOCKED_PENDING_STAGING';

export type PrismaAuthSessionStoreEvidenceRow = {
  evidenceId: string;
  control: string;
  status: PrismaAuthSessionStoreEvidenceStatus;
  evidencePaths: string[];
  verification: string;
  productionBlocker: boolean;
};

export const buildPrismaAuthSessionStoreMatrixReport = (
  generatedAt = new Date().toISOString(),
) => {
  const evidenceRows: PrismaAuthSessionStoreEvidenceRow[] = [
    {
      evidenceId: 'prisma-auth-provider-selection',
      control: 'AUTH_SESSION_STORE provider selection',
      status: 'IMPLEMENTED',
      evidencePaths: [
        'apps/api/src/auth/auth-session-store.provider.ts',
        'apps/api/src/auth/auth.module.ts',
      ],
      verification:
        'Local demo defaults to fixture, explicit local/staging Prisma is allowed, and production fixture fallback is rejected.',
      productionBlocker: false,
    },
    {
      evidenceId: 'prisma-auth-repository',
      control: 'Prisma AuthSessionStore repository',
      status: 'IMPLEMENTED',
      evidencePaths: [
        'apps/api/src/auth/prisma-auth-session.store.ts',
        'apps/api/prisma/models/auth-audit.prisma',
      ],
      verification:
        'Sessions, refresh-token hashes, and append-only audit events persist behind the async AuthSessionStore seam.',
      productionBlocker: false,
    },
    {
      evidenceId: 'prisma-auth-refresh-hash-integrity',
      control: 'Refresh-token SHA-256 persistence integrity',
      status: 'VERIFIED_DISPOSABLE_LOCAL',
      evidencePaths: [
        'apps/api/src/auth/prisma-auth-session.store.ts',
        'apps/api/prisma/migrations/20260710140000_auth_refresh_token_hash_integrity/migration.sql',
        'apps/api/prisma/runbooks/20260710140000_auth_refresh_token_hash_integrity_forward_repair.sql',
        'apps/api/src/auth/prisma-auth-session.integration.spec.ts',
      ],
      verification:
        'Repository reads/writes reject malformed hashes; a validated PostgreSQL constraint enforces lowercase SHA-256, and the disposable forward repair revokes, tombstones, and audits malformed rows without exporting their values.',
      productionBlocker: false,
    },
    {
      evidenceId: 'prisma-auth-migration-disposable-local',
      control: 'Migration deploy and schema validation',
      status: 'VERIFIED_DISPOSABLE_LOCAL',
      evidencePaths: [
        'apps/api/prisma/migrations/20260710090000_prisma_auth_session_store/migration.sql',
        'apps/api/src/auth/prisma-auth-session.integration.spec.ts',
      ],
      verification:
        'migrate deploy creates three tables, foreign keys, and lookup indexes in a random disposable localhost database.',
      productionBlocker: false,
    },
    {
      evidenceId: 'prisma-auth-fail-closed',
      control: 'Repository outage and inconsistent-row denial',
      status: 'IMPLEMENTED',
      evidencePaths: [
        'apps/api/src/auth/auth-session.service.ts',
        'apps/api/src/auth/prisma-auth-session.store.spec.ts',
      ],
      verification:
        'Repository transport and integrity failures become controlled service-unavailable denials before protected access.',
      productionBlocker: false,
    },
    {
      evidenceId: 'prisma-auth-two-instance-revocation',
      control: 'Shared two-instance termination and revocation contract',
      status: 'VERIFIED_DISPOSABLE_LOCAL',
      evidencePaths: [
        'apps/api/src/auth/auth-session.service.ts',
        'apps/api/src/auth/prisma-auth-session.store.ts',
        'apps/api/src/auth/prisma-auth-session.integration.spec.ts',
      ],
      verification:
        'Session-row locking serializes refresh issuance/rotation with atomic logout and revocation; two independent Prisma clients run six rotate/revoke and six rotate/logout races, all ending with a denied session and zero active refresh tokens.',
      productionBlocker: false,
    },
    {
      evidenceId: 'prisma-auth-rollback-forward-repair',
      control: 'Pre-activation rollback and forward repair',
      status: 'VERIFIED_DISPOSABLE_LOCAL',
      evidencePaths: [
        'apps/api/prisma/runbooks/20260710090000_prisma_auth_session_store_pre_activation_rollback.sql',
        'docs/hoctap_minhhuong/prisma_auth_session_store_runbook.md',
      ],
      verification:
        'Disposable test drops only new auth objects, preserves the base schema, reapplies reviewed migrations, rehearses constraint-only rollback, and verifies all auth tables and hash integrity return.',
      productionBlocker: false,
    },
    {
      evidenceId: 'prisma-auth-staging-operations',
      control: 'Staging backup, restore, monitoring, and incident rehearsal',
      status: 'BLOCKED_PENDING_STAGING',
      evidencePaths: [
        'docs/hoctap_minhhuong/prisma_auth_session_store_runbook.md',
      ],
      verification:
        'No staging infrastructure or production credentials were used in this repo-local job.',
      productionBlocker: true,
    },
  ];

  return {
    reportId: 'learning-local-demo-prisma-auth-session-store-matrix',
    generatedAt,
    scope: 'repo-local/disposable-local-database-only',
    productionReady: false,
    productionEnabled: false,
    decision: 'LOCAL_IMPLEMENTATION_VERIFIED_GO_LIVE_BLOCKED',
    safety: {
      productionDbUsed: false,
      productionDeployUsed: false,
      realSessionMutationUsed: false,
      plaintextRefreshTokenPersisted: false,
      malformedRefreshTokenHashAccepted: false,
      providerApiUsed: false,
    },
    totals: {
      evidenceCount: evidenceRows.length,
      implementedCount: evidenceRows.filter(
        (row) => row.status === 'IMPLEMENTED',
      ).length,
      disposableLocalVerifiedCount: evidenceRows.filter(
        (row) => row.status === 'VERIFIED_DISPOSABLE_LOCAL',
      ).length,
      stagingBlockerCount: evidenceRows.filter(
        (row) => row.status === 'BLOCKED_PENDING_STAGING',
      ).length,
      productionBlockerCount: evidenceRows.filter(
        (row) => row.productionBlocker,
      ).length,
      productionReadyClaimCount: 0,
      openLocalSafetyGateCount: 0,
    },
    evidenceRows,
  };
};

export type PrismaAuthSessionStoreMatrixReport = ReturnType<
  typeof buildPrismaAuthSessionStoreMatrixReport
>;

export const toPrismaAuthSessionStoreMatrixMarkdown = (
  report: PrismaAuthSessionStoreMatrixReport,
) =>
  [
    '# Prisma Auth Session Store Local/Staging Matrix',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    `Decision: ${report.decision}`,
    '',
    '- production_ready=false',
    '- production_enabled=false',
    '- productionDbUsed=false',
    '- realSessionMutationUsed=false',
    '- plaintextRefreshTokenPersisted=false',
    '- malformedRefreshTokenHashAccepted=false',
    '',
    '## Totals',
    '',
    `- Evidence rows: ${report.totals.evidenceCount}`,
    `- Implemented: ${report.totals.implementedCount}`,
    `- Disposable-local verified: ${report.totals.disposableLocalVerifiedCount}`,
    `- Staging blockers: ${report.totals.stagingBlockerCount}`,
    `- Open local safety gates: ${report.totals.openLocalSafetyGateCount}`,
    '',
    '## Evidence',
    '',
    '| Control | Status | Production blocker | Verification |',
    '| --- | --- | --- | --- |',
    ...report.evidenceRows.map(
      (row) =>
        `| ${row.control} | ${row.status} | ${row.productionBlocker ? 'YES' : 'NO'} | ${row.verification} |`,
    ),
    '',
  ].join('\n');
