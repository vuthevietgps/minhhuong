export type AuthOperationalControlEvidenceStatus =
  | 'IMPLEMENTED_LOCAL'
  | 'VERIFIED_LOCAL'
  | 'VERIFIED_DISPOSABLE_LOCAL'
  | 'BLOCKED_PENDING_PRODUCTION_APPROVAL';

export type AuthOperationalControlEvidenceRow = {
  evidenceId: string;
  control: string;
  status: AuthOperationalControlEvidenceStatus;
  fixtureCase: string;
  evidencePaths: string[];
  verification: string;
  productionBlocker: boolean;
};

export const buildAuthOperationalControlMatrixReport = (
  generatedAt = new Date().toISOString(),
) => {
  const evidenceRows: AuthOperationalControlEvidenceRow[] = [
    {
      evidenceId: 'auth-ops-login-throttle',
      control: 'Login attempt throttling',
      status: 'VERIFIED_LOCAL',
      fixtureCase: 'unknown@demo.local repeated invalid password',
      evidencePaths: [
        'apps/api/src/auth/auth-operational-control.ts',
        'apps/api/src/auth/auth-operational-control.spec.ts',
      ],
      verification:
        'A deterministic per-identity window permits the configured attempts, returns 429 afterward, and stores only a SHA-256 rate-limit key.',
      productionBlocker: false,
    },
    {
      evidenceId: 'auth-ops-refresh-throttle',
      control: 'Refresh-token attempt throttling',
      status: 'VERIFIED_LOCAL',
      fixtureCase: 'repeated invalid.token refresh fingerprint',
      evidencePaths: [
        'apps/api/src/auth/auth.service.ts',
        'apps/api/src/auth/auth-operational-control.spec.ts',
      ],
      verification:
        'Repeated attempts for the same refresh-token fingerprint return 429 inside the local window; raw tokens are absent from snapshots.',
      productionBlocker: false,
    },
    {
      evidenceId: 'auth-ops-rate-limit-fail-closed',
      control: 'Rate-limit control outage behavior',
      status: 'VERIFIED_LOCAL',
      fixtureCase: 'fixture operational control unavailable',
      evidencePaths: [
        'apps/api/src/auth/auth.service.ts',
        'apps/api/src/auth/auth-operational-control.spec.ts',
      ],
      verification:
        'Login returns service unavailable before credential/session processing when the rate-limit seam is unavailable.',
      productionBlocker: false,
    },
    {
      evidenceId: 'auth-ops-refresh-replay-counter',
      control: 'Refresh replay denial counter',
      status: 'VERIFIED_LOCAL',
      fixtureCase: 'rotated parent refresh token replay',
      evidencePaths: [
        'apps/api/src/auth/auth-session.service.ts',
        'apps/api/src/auth/auth-operational-control.spec.ts',
      ],
      verification:
        'Refresh replay revokes the session family and increments REFRESH_REPLAY_DENIED without exporting the raw token.',
      productionBlocker: false,
    },
    {
      evidenceId: 'auth-ops-repository-outage-counter',
      control: 'Auth-session repository outage counter',
      status: 'VERIFIED_LOCAL',
      fixtureCase: 'findSessionById repository outage',
      evidencePaths: [
        'apps/api/src/auth/auth-session.service.ts',
        'apps/api/src/auth/auth-operational-control.spec.ts',
      ],
      verification:
        'Repository failure remains fail closed and increments SESSION_REPOSITORY_ERROR.',
      productionBlocker: false,
    },
    {
      evidenceId: 'auth-ops-cleanup-counters',
      control: 'Expired session/token cleanup counters',
      status: 'VERIFIED_LOCAL',
      fixtureCase: 'one expired session and one expired refresh token',
      evidencePaths: [
        'apps/api/src/auth/auth-session.service.ts',
        'apps/api/src/auth/auth-operational-control.spec.ts',
      ],
      verification:
        'Cleanup run, expired-session, and expired-refresh-token counters match deterministic fixture outcomes.',
      productionBlocker: false,
    },
    {
      evidenceId: 'auth-ops-audit-export-counters',
      control: 'Role-scoped auth audit export counters',
      status: 'VERIFIED_LOCAL',
      fixtureCase: 'ADMIN read and STUDENT denied audit export',
      evidencePaths: [
        'apps/api/src/auth/auth-session.service.ts',
        'apps/api/src/auth/auth-operational-control.spec.ts',
      ],
      verification:
        'Admin/support reads count exported rows while learner-role requests count denied exports and receive no audit rows.',
      productionBlocker: false,
    },
    {
      evidenceId: 'auth-ops-shared-prisma-control',
      control: 'Shared atomic Prisma rate-limit and metric backend',
      status: 'VERIFIED_DISPOSABLE_LOCAL',
      fixtureCase:
        '12 concurrent login and 16 concurrent refresh requests across two API processes',
      evidencePaths: [
        'apps/api/src/auth/prisma-auth-operational-control.ts',
        'apps/api/src/auth/auth-operational-control.provider.ts',
        'apps/api/scripts/smoke-auth-operational-control-disposable.mjs',
        'exports/learning-local-demo-auth-operational-control-disposable-smoke-report.json',
      ],
      verification:
        'One random localhost PostgreSQL database atomically admits exactly 5 login and 10 refresh attempts across two processes, aggregates counters, HMAC-protects persisted keys, expires bounded rows, and fails login closed with HTTP 503 during adapter outage.',
      productionBlocker: false,
    },
    {
      evidenceId: 'auth-ops-production-observability-approval',
      control:
        'Production dashboards, alerts, retention, and incident approval',
      status: 'BLOCKED_PENDING_PRODUCTION_APPROVAL',
      fixtureCase:
        'not exercised; repo-local scope forbids external monitoring and production activation',
      evidencePaths: [
        'docs/hoctap_minhhuong/prisma_auth_session_store_runbook.md',
        'docs/hoctap_minhhuong/production_hardening_go_live_gate.md',
      ],
      verification:
        'Production bootstrap rejects both local providers until retention ownership, dashboards, alert routing, incident rehearsal, staging migration, security review, and manual go-live approval exist.',
      productionBlocker: true,
    },
  ];

  return {
    reportId: 'learning-local-demo-auth-operational-control-matrix',
    generatedAt,
    scope: 'repo-local-fixture-and-disposable-localhost-only',
    productionReady: false,
    productionEnabled: false,
    decision: 'LOCAL_AUTH_CONTROLS_VERIFIED_GO_LIVE_BLOCKED',
    safety: {
      productionDbUsed: false,
      externalMonitoringProviderUsed: false,
      liveAlertUsed: false,
      rawCredentialOrRefreshTokenExported: false,
      realSessionMutationUsed: false,
    },
    totals: {
      evidenceCount: evidenceRows.length,
      implementedLocalCount: evidenceRows.filter(
        (row) => row.status === 'IMPLEMENTED_LOCAL',
      ).length,
      verifiedLocalCount: evidenceRows.filter(
        (row) => row.status === 'VERIFIED_LOCAL',
      ).length,
      disposableLocalVerifiedCount: evidenceRows.filter(
        (row) => row.status === 'VERIFIED_DISPOSABLE_LOCAL',
      ).length,
      sharedControlBlockerCount: evidenceRows.filter(
        (row) => row.status === 'BLOCKED_PENDING_PRODUCTION_APPROVAL',
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

export type AuthOperationalControlMatrixReport = ReturnType<
  typeof buildAuthOperationalControlMatrixReport
>;

export const toAuthOperationalControlMatrixMarkdown = (
  report: AuthOperationalControlMatrixReport,
) =>
  [
    '# Auth Rate Limit And Operational Monitoring Matrix',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    `Decision: ${report.decision}`,
    '',
    '- production_ready=false',
    '- production_enabled=false',
    '- externalMonitoringProviderUsed=false',
    '- rawCredentialOrRefreshTokenExported=false',
    '',
    '## Totals',
    '',
    `- Evidence rows: ${report.totals.evidenceCount}`,
    `- Local verified: ${report.totals.verifiedLocalCount}`,
    `- Disposable-local shared control verified: ${report.totals.disposableLocalVerifiedCount}`,
    `- Production-approval blockers: ${report.totals.sharedControlBlockerCount}`,
    `- Open local safety gates: ${report.totals.openLocalSafetyGateCount}`,
    '',
    '## Evidence',
    '',
    '| Control | Fixture case | Status | Production blocker | Verification |',
    '| --- | --- | --- | --- | --- |',
    ...report.evidenceRows.map(
      (row) =>
        `| ${row.control} | ${row.fixtureCase} | ${row.status} | ${row.productionBlocker ? 'YES' : 'NO'} | ${row.verification} |`,
    ),
    '',
  ].join('\n');
