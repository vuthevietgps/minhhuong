export type LearningProductionRuntimeGateDecision =
  | 'CLOSED_BY_CODE'
  | 'BLOCKED_PENDING_STAGING'
  | 'BLOCKED_PENDING_MANUAL_APPROVAL';

export type LearningProductionRuntimeGateArea =
  | 'ENVIRONMENT_SEPARATION'
  | 'LOCAL_DEMO_CONTAINMENT'
  | 'MIGRATION_ROLLBACK'
  | 'BACKUP_RESTORE'
  | 'MONITORING_INCIDENT'
  | 'PRIVACY_AUDIT_RETENTION'
  | 'AUTH_PERSISTENCE'
  | 'LIVE_PROVIDER_EXECUTION'
  | 'MANUAL_GO_LIVE_APPROVAL';

export type LearningProductionRuntimeGateRow = {
  gateId: string;
  area: LearningProductionRuntimeGateArea;
  decision: LearningProductionRuntimeGateDecision;
  currentEvidence: string;
  evidencePaths: string[];
  requiredNextEvidence: string[];
  rollbackOrContainment: string;
  productionBlocker: boolean;
};

export type LearningProductionRuntimeGateMatrixReport = {
  schemaVersion: 'learning-production-runtime-gate-matrix.v1';
  generatedAt: string;
  fixtureKind: 'learning-local-demo-only';
  productionReady: false;
  productionEnabled: false;
  decision: 'GO_LIVE_BLOCKED';
  rows: LearningProductionRuntimeGateRow[];
  safety: {
    productionDbUsed: false;
    providerApiUsed: false;
    paymentMutationUsed: false;
    refundMutationUsed: false;
    payoutMutationUsed: false;
    notificationDeliveryUsed: false;
    liveAiProviderUsed: false;
    realStudentMutationUsed: false;
    productionDeployUsed: false;
    plaintextSecretsIncluded: false;
    manualGoLiveApprovalRequired: true;
  };
  totals: {
    gateCount: number;
    closedByCodeCount: number;
    stagingBlockerCount: number;
    manualApprovalBlockerCount: number;
    productionBlockerCount: number;
    gatesWithEvidencePathCount: number;
    gatesWithNextEvidenceCount: number;
    productionReadyClaimCount: 0;
    openSafetyGateCount: 0;
  };
};

export const learningProductionRuntimeGateRows: LearningProductionRuntimeGateRow[] =
  [
    {
      gateId: 'runtime-config-fail-closed',
      area: 'ENVIRONMENT_SEPARATION',
      decision: 'CLOSED_BY_CODE',
      currentEvidence:
        'Production bootstrap rejects insecure JWT, permissive/non-HTTPS CORS, local public URLs, local demo database credentials, an explicit local-demo route enable flag, and filesystem upload configurations that claim more than one API replica. All upload surfaces and static serving resolve through one UPLOADS_PATH contract, and readiness proves the path is writable.',
      evidencePaths: [
        'apps/api/src/runtime-safety/production-runtime-safety.ts',
        'apps/api/src/main.ts',
        'apps/api/src/auth/auth.module.ts',
        'apps/api/src/upload-storage/filesystem-upload-storage.ts',
        'apps/api/src/health/dependency-readiness.service.ts',
        'exports/learning-local-demo-upload-storage-hardening-matrix-report.json',
      ],
      requiredNextEvidence: [],
      rollbackOrContainment:
        'Rollback may revert the release artifact, but must never restore placeholder production secrets or credentialed wildcard CORS.',
      productionBlocker: false,
    },
    {
      gateId: 'local-demo-route-containment',
      area: 'LOCAL_DEMO_CONTAINMENT',
      decision: 'CLOSED_BY_CODE',
      currentEvidence:
        'Learning and ERP local-demo controllers use a shared guard that returns not found whenever NODE_ENV=production.',
      evidencePaths: [
        'apps/api/src/runtime-safety/local-demo-only.guard.ts',
        'apps/api/src/learning-local-demo/learning-local-demo.controller.ts',
        'apps/api/src/erp-local-demo/erp-local-demo.controller.ts',
      ],
      requiredNextEvidence: [],
      rollbackOrContainment:
        'Keep demo seed/report generation as an offline command; never re-enable HTTP demo routes in production.',
      productionBlocker: false,
    },
    {
      gateId: 'migration-and-rollback-rehearsal',
      area: 'MIGRATION_ROLLBACK',
      decision: 'BLOCKED_PENDING_STAGING',
      currentEvidence:
        'Prisma migrations and rollback/forward-repair runbooks exist, but there is no current staging migrate/rollback rehearsal for this release candidate.',
      evidencePaths: [
        'apps/api/prisma/migrations',
        // Evidence must be tracked in git: audit-output/ is ignored, so CI
        // checkouts cannot verify reports stored there.
        'apps/api/prisma/runbooks',
      ],
      requiredNextEvidence: [
        'Disposable staging migration dry-run with schema diff approval.',
        'Timed rollback rehearsal that preserves append-only audit data.',
      ],
      rollbackOrContainment:
        'Disable new release writes first; use forward repair after data writes rather than destructive schema rollback.',
      productionBlocker: true,
    },
    {
      gateId: 'backup-and-restore-rehearsal',
      area: 'BACKUP_RESTORE',
      decision: 'BLOCKED_PENDING_STAGING',
      currentEvidence:
        'No current staging backup artifact, restore checksum, recovery point, or recovery time evidence is present.',
      evidencePaths: [
        'docs/hoctap_minhhuong/production_hardening_go_live_gate.md',
      ],
      requiredNextEvidence: [
        'Encrypted staging backup with retention owner and checksum.',
        'Restore rehearsal with measured RPO/RTO and data integrity checks.',
      ],
      rollbackOrContainment:
        'Keep production_enabled=false until restore success is independently verified.',
      productionBlocker: true,
    },
    {
      gateId: 'monitoring-alerting-and-incident-runbook',
      area: 'MONITORING_INCIDENT',
      decision: 'BLOCKED_PENDING_STAGING',
      currentEvidence:
        'GET /health, local container healthchecks, and a disposable-local shared Prisma auth limiter/counter adapter exist; production dashboards, alerts, log correlation, on-call owner, retention approval, and incident rehearsal do not.',
      evidencePaths: [
        'apps/api/src/health/health.controller.ts',
        'apps/api/src/auth/auth-operational-control.ts',
        'apps/api/src/learning-local-demo/auth-operational-control-matrix.ts',
        'docker-compose.yml',
      ],
      requiredNextEvidence: [
        'Shared multi-instance rate-limit/metrics adapter plus staging health, error-rate, latency, auth-denial, refund, and payout alert smoke.',
        'Incident response and rollback owner acknowledgement.',
      ],
      rollbackOrContainment:
        'Use a release kill switch and stop new writes when health or reconciliation alerts breach approved thresholds.',
      productionBlocker: true,
    },
    {
      gateId: 'privacy-audit-and-retention',
      area: 'PRIVACY_AUDIT_RETENTION',
      decision: 'BLOCKED_PENDING_STAGING',
      currentEvidence:
        'Fixture permission/redaction and append-only audit expectations exist; approved retention, deletion, export, and incident access evidence does not.',
      evidencePaths: [
        'apps/api/src/learning-local-demo/learning-local-demo.production-hardening.gate-auth-session.spec.ts',
        'apps/api/src/learning-local-demo/learning-local-demo.production-hardening.auth-store-evidence.spec.ts',
        'apps/api/src/learning-local-demo/auth-persistence-security-gate-matrix.ts',
      ],
      requiredNextEvidence: [
        'Approved child-data, AI transcript, auth audit, and upload retention schedule.',
        'Staging redaction/export/deletion dry-run with support access audit.',
      ],
      rollbackOrContainment:
        'Disable exports/provider sends without deleting append-only audit records needed for investigation.',
      productionBlocker: true,
    },
    {
      gateId: 'auth-persistence-and-distributed-revocation',
      area: 'AUTH_PERSISTENCE',
      decision: 'BLOCKED_PENDING_STAGING',
      currentEvidence:
        'Prisma auth persistence, atomic refresh rotation, replay denial, repository fail-closed behavior, and two-client shared revocation are disposable-local verified; approved staging rehearsal is absent.',
      evidencePaths: [
        'apps/api/src/learning-local-demo/auth-refresh-lifecycle-matrix.ts',
        'apps/api/src/learning-local-demo/auth-session-repository-contract-matrix.ts',
        'apps/api/src/auth/prisma-auth-session.store.ts',
        'apps/api/src/auth/prisma-auth-session.integration.spec.ts',
      ],
      requiredNextEvidence: [
        'Approved staging migration, backup/restore, and retention evidence for the implemented persistent AuthSessionStore.',
        'Two-process staging API revocation and repository outage smoke.',
      ],
      rollbackOrContainment:
        'Disable new sessions and preserve token/audit hashes if the persistent store or distributed revocation layer fails.',
      productionBlocker: true,
    },
    {
      gateId: 'live-provider-execution-gates',
      area: 'LIVE_PROVIDER_EXECUTION',
      decision: 'BLOCKED_PENDING_MANUAL_APPROVAL',
      currentEvidence:
        'Payment, refund, payout, notification, and AI behavior is local-fixture/mock-only; no live provider call is authorized.',
      evidencePaths: [
        'docs/hoctap_minhhuong/production_hardening_go_live_gate.md',
        'apps/api/src/ai-chat/ai-chat.service.ts',
      ],
      requiredNextEvidence: [
        'Approved secret-store, webhook verification, idempotency, reconciliation, rate/loss limit, and kill-switch design per provider.',
        'Staging-only provider smoke with explicit human approval.',
      ],
      rollbackOrContainment:
        'Keep provider modes disabled and retain manual, fixture-only evidence until each provider has a separately approved rollback plan.',
      productionBlocker: true,
    },
    {
      gateId: 'manual-go-live-approval',
      area: 'MANUAL_GO_LIVE_APPROVAL',
      decision: 'BLOCKED_PENDING_MANUAL_APPROVAL',
      currentEvidence:
        'The canonical BA and hardening source of truth explicitly require production_ready=false and a separate manual approval.',
      evidencePaths: [
        'docs/hoctap_minhhuong/00_truc_lamviec_hoctap_minhhuong.md',
        'docs/hoctap_minhhuong/production_hardening_go_live_gate.md',
      ],
      requiredNextEvidence: [
        'Named approver, timestamp, release version, accepted residual risks, rollback owner, and production enablement record.',
      ],
      rollbackOrContainment:
        'No automatic loop may set production_ready or production_enabled to true.',
      productionBlocker: true,
    },
  ];

export const buildLearningProductionRuntimeGateMatrixReport = (
  generatedAt = new Date().toISOString(),
): LearningProductionRuntimeGateMatrixReport => {
  const rows = learningProductionRuntimeGateRows.map((row) => ({
    ...row,
    evidencePaths: [...row.evidencePaths],
    requiredNextEvidence: [...row.requiredNextEvidence],
  }));

  return {
    schemaVersion: 'learning-production-runtime-gate-matrix.v1',
    generatedAt,
    fixtureKind: 'learning-local-demo-only',
    productionReady: false,
    productionEnabled: false,
    decision: 'GO_LIVE_BLOCKED',
    rows,
    safety: {
      productionDbUsed: false,
      providerApiUsed: false,
      paymentMutationUsed: false,
      refundMutationUsed: false,
      payoutMutationUsed: false,
      notificationDeliveryUsed: false,
      liveAiProviderUsed: false,
      realStudentMutationUsed: false,
      productionDeployUsed: false,
      plaintextSecretsIncluded: false,
      manualGoLiveApprovalRequired: true,
    },
    totals: {
      gateCount: rows.length,
      closedByCodeCount: rows.filter((row) => row.decision === 'CLOSED_BY_CODE')
        .length,
      stagingBlockerCount: rows.filter(
        (row) => row.decision === 'BLOCKED_PENDING_STAGING',
      ).length,
      manualApprovalBlockerCount: rows.filter(
        (row) => row.decision === 'BLOCKED_PENDING_MANUAL_APPROVAL',
      ).length,
      productionBlockerCount: rows.filter((row) => row.productionBlocker)
        .length,
      gatesWithEvidencePathCount: rows.filter(
        (row) => row.evidencePaths.length > 0,
      ).length,
      gatesWithNextEvidenceCount: rows.filter(
        (row) => row.productionBlocker && row.requiredNextEvidence.length > 0,
      ).length,
      productionReadyClaimCount: 0,
      openSafetyGateCount: 0,
    },
  };
};

export const toLearningProductionRuntimeGateMatrixMarkdown = (
  report: LearningProductionRuntimeGateMatrixReport,
) =>
  [
    '# Learning Production Runtime Gate Matrix',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    '## Decision',
    '',
    `- decision=${report.decision}`,
    '- production_ready=false',
    '- production_enabled=false',
    '- fixture_only=true',
    '- manual_go_live_approval_required=true',
    '',
    '## Totals',
    '',
    `- Gates: ${report.totals.gateCount}`,
    `- Closed by code: ${report.totals.closedByCodeCount}`,
    `- Pending staging: ${report.totals.stagingBlockerCount}`,
    `- Pending manual approval: ${report.totals.manualApprovalBlockerCount}`,
    `- Production blockers: ${report.totals.productionBlockerCount}`,
    '',
    '## Gates',
    '',
    '| Gate | Area | Decision | Production blocker | Current evidence | Required next evidence | Rollback / containment |',
    '|---|---|---|---:|---|---|---|',
    ...report.rows.map(
      (row) =>
        `| ${row.gateId} | ${row.area} | ${row.decision} | ${row.productionBlocker ? 'yes' : 'no'} | ${row.currentEvidence} Paths: ${row.evidencePaths.join(', ')} | ${row.requiredNextEvidence.join(' ') || 'None; local control closed.'} | ${row.rollbackOrContainment} |`,
    ),
    '',
    '## Safety',
    '',
    '- productionDbUsed=false',
    '- providerApiUsed=false',
    '- paymentMutationUsed=false',
    '- refundMutationUsed=false',
    '- payoutMutationUsed=false',
    '- notificationDeliveryUsed=false',
    '- liveAiProviderUsed=false',
    '- realStudentMutationUsed=false',
    '- productionDeployUsed=false',
    '- plaintextSecretsIncluded=false',
    '',
  ].join('\n');
