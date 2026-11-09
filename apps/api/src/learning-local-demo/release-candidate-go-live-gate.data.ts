import type {
  LearningReleaseApprovalRow,
  LearningReleaseCandidateRole,
  LearningReleaseCandidateScenario,
  LearningReleaseCandidateSmokeRow,
  RoleJourneyConfig,
} from './release-candidate-go-live-gate.types';

export const roleJourneyConfigs: Record<
  LearningReleaseCandidateRole,
  RoleJourneyConfig
> = {
  STUDENT: {
    actorFixtureId: 'student-ava',
    targetSurface: '/v1/learning/children/child-ava-demo/today-plan',
    fixtureRefs: [
      'enroll-ava-a1-active',
      'sub-ava-a1-active',
      'plan-ava-a1-day-02',
      'student-khoa',
      'sub-khoa-a1-canceled',
    ],
    happyEvidence:
      'The active student follows the published daily plan through video, practice, progress, and report evidence.',
    deniedEvidence:
      'A stale, unpublished, or screen-time-blocked plan cannot be started.',
    inactiveEvidence:
      'Expired and revoked entitlement snapshots block learning access with explicit reasons.',
    permissionEvidence:
      'A student cannot select another child profile or enter teacher/admin surfaces.',
  },
  PARENT: {
    actorFixtureId: 'guardian-ava-parent',
    targetSurface: '/v1/parent/children/child-ava-demo/learning-summary',
    fixtureRefs: [
      'guardian-ava-parent',
      'guardian-minh-parent',
      'student-ava',
      'student-khoa',
      'permission-case-parent-minh-non-owning-ava',
    ],
    happyEvidence:
      'The owning parent sees an approved report, reads the inbox, and grants fixture screen time.',
    deniedEvidence:
      'Held previews remain hidden and a non-owning parent receives no child evidence.',
    inactiveEvidence:
      'A refunded, revoked, or expired child entitlement stays visible as blocked evidence without granting learning access.',
    permissionEvidence:
      'Parent ownership is enforced and no parent can read another family child profile.',
  },
  TEACHER: {
    actorFixtureId: 'content-owner-teacher-mai',
    targetSurface: '/v1/teacher/classes/class-a1-june-weekday/review-queue',
    fixtureRefs: [
      'class-a1-june-weekday',
      'class-phonics-may-booster',
      'permission-case-teacher-mai-assigned-a1',
      'permission-case-teacher-mai-unassigned-phonics-denied',
      'teacher-escalation-followup-resolution-minh-colors-2026-06-09',
    ],
    happyEvidence:
      'The assigned teacher reviews learning evidence, applies the support plan, and closes the fixture escalation.',
    deniedEvidence:
      'The teacher cannot read or change an unassigned class or its student evidence.',
    inactiveEvidence:
      'Withdrawn learner evidence is retained read-only and cannot restart a learning path.',
    permissionEvidence:
      'Assigned-class scope is required before report, intervention, or content actions.',
  },
  ADMIN: {
    actorFixtureId: 'content-owner-admin-hoa',
    targetSurface:
      '/v1/learning-local-demo/release-candidate-go-live-gate-matrix-report',
    fixtureRefs: [
      'permission-case-admin-hoa-phonics-class',
      'runtime-config-fail-closed',
      'manual-go-live-approval',
    ],
    happyEvidence:
      'Admin reads release-candidate, audit, runtime-safety, and fixture evidence only.',
    deniedEvidence:
      'Admin cannot use this local-demo surface for a production mutation or go-live enablement.',
    inactiveEvidence:
      'An expired or revoked admin session is denied before readiness evidence is returned.',
    permissionEvidence:
      'Admin visibility does not override provider, production database, or manual approval gates.',
  },
  SUPPORT: {
    actorFixtureId: 'support-ops-auditor-lan',
    targetSurface: '/v1/auth/operational-alert-audits/incident-export',
    fixtureRefs: [
      'permission-case-support-ops-lan-audit-read-only',
      'followup-outcome-minh-parent-practice-window',
      'auth-alert-audit-support-read-only',
    ],
    happyEvidence:
      'Support inspects redacted issue, escalation, and audit evidence without changing learner or money state.',
    deniedEvidence:
      'Support cannot bypass privacy redaction, teacher scope, or mutation restrictions.',
    inactiveEvidence:
      'An expired or revoked support session is denied before audit repository access.',
    permissionEvidence:
      'Support access is read-only, audited, bounded, and excludes identity/token/rate-key fields.',
  },
  SALES: {
    actorFixtureId: 'demo-sale-lan',
    targetSurface: '/fixture/subscription-payment-commission-trace',
    fixtureRefs: [
      'enroll-ava-a1-active',
      'pay-ava-a1-succeeded',
      'commission-ava-sale-pending',
      'commission-khoa-sale-canceled',
    ],
    happyEvidence:
      'Sales traces the fixture order, payment, entitlement, refund-window, and pending commission evidence.',
    deniedEvidence:
      'Sales cannot approve payout, issue a provider refund, or unlock an unpaid entitlement.',
    inactiveEvidence:
      'Refunded/canceled fixture business closes entitlement and cancels the related commission.',
    permissionEvidence:
      'Sales evidence excludes finance approval and unrelated learner/private report access.',
  },
  CHANNEL: {
    actorFixtureId: 'demo-agency-hcm',
    targetSurface: '/fixture/channel-commission-trace',
    fixtureRefs: [
      'enroll-linh-phonics-active',
      'pay-linh-phonics-succeeded',
      'commission-linh-agency-payable',
      'commission-khoa-sale-canceled',
    ],
    happyEvidence:
      'Channel reads its payable fixture commission after the refund window without executing payout.',
    deniedEvidence:
      'Channel cannot inspect another beneficiary ledger or bypass a commission hold/cancellation.',
    inactiveEvidence:
      'A refunded subscription keeps the canceled commission unavailable for payout.',
    permissionEvidence:
      'Channel scope is limited to its fixture beneficiary evidence and never exposes child learning details.',
  },
  FINANCE: {
    actorFixtureId: 'demo-finance-manager',
    targetSurface: '/fixture/refund-commission-payout-safety-trace',
    fixtureRefs: [
      'pay-khoa-a1-refunded',
      'refund-khoa-a1-succeeded',
      'commission-khoa-sale-canceled',
      'commission-linh-sale-approved',
    ],
    happyEvidence:
      'Finance reviews fixture payment/refund/commission evidence and the invoice/available-balance payout gate.',
    deniedEvidence:
      'No provider payment, refund, commission release, or payout mutation is available in this local gate.',
    inactiveEvidence:
      'Refunded payment and canceled commission remain non-payable and preserve the audit trace.',
    permissionEvidence:
      'Finance approval cannot set production_ready or bypass separate provider and manual go-live approvals.',
  },
};

export const scenarios: readonly LearningReleaseCandidateScenario[] = [
  'HAPPY_PATH',
  'DENIED_PATH',
  'INACTIVE_OR_EXPIRED_PATH',
  'PERMISSION_NEGATIVE_PATH',
];

export const roleEvidencePaths: Record<LearningReleaseCandidateRole, string[]> =
  {
    STUDENT: [
      'exports/learning-local-demo-learning-path-daily-plan-video-practice-evidence-report.json',
      'exports/learning-local-demo-subscription-entitlement-daily-plan-access-report.json',
    ],
    PARENT: [
      'exports/learning-local-demo-parent-teacher-report-permission-privacy-redaction-report.json',
      'exports/learning-local-demo-parent-portal-approved-report-inbox-read-receipt-report.json',
    ],
    TEACHER: [
      'exports/learning-local-demo-teacher-intervention-remedial-assignment-support-plan-report.json',
      'exports/learning-local-demo-teacher-escalation-followup-resolution-report.json',
    ],
    ADMIN: [
      'exports/learning-local-demo-production-runtime-gate-matrix-report.json',
      'docs/hoctap_minhhuong/production_hardening_go_live_gate.md',
    ],
    SUPPORT: [
      'exports/learning-local-demo-auth-operational-alert-policy-matrix-report.json',
      'exports/learning-local-demo-parent-teacher-report-permission-privacy-redaction-report.json',
    ],
    SALES: [
      'exports/learning-local-demo-student-course-enrollment-subscription-flow-report.json',
    ],
    CHANNEL: [
      'exports/learning-local-demo-student-course-enrollment-subscription-report.json',
    ],
    FINANCE: [
      'exports/learning-local-demo-student-course-enrollment-subscription-report.json',
      'apps/api/src/channel-finance/channel-finance.service.spec.ts',
    ],
  };

export const learningReleaseCandidateSmokeRows: LearningReleaseCandidateSmokeRow[] =
  [
    {
      smokeId: 'rc-smoke-auth-session-negative-matrix',
      journey:
        'login -> logout -> expired token -> revoked session -> wrong role',
      verificationLevel: 'AUTOMATED_UNIT',
      status: 'PASS_LOCAL',
      commandOrEvidence: 'npm run test:learning-local',
      evidencePaths: [
        'apps/api/src/learning-local-demo/learning-local-demo.production-hardening.spec.ts',
        'exports/learning-local-demo-auth-session-smoke-matrix-report.json',
      ],
      expectedResult:
        'All required auth/session denial scenarios remain covered.',
      productionBlocker: false,
    },
    {
      smokeId: 'rc-smoke-parent-child-learning-flow',
      journey:
        'parent -> owned child -> active entitlement -> daily plan -> video -> practice -> approved report',
      verificationLevel: 'FIXTURE_REPORT',
      status: 'PASS_LOCAL',
      commandOrEvidence: 'npm run seed:demo && npm run report:demo',
      evidencePaths: [
        'exports/learning-local-demo-mvp-end-to-end-readiness-trace-report.json',
        'exports/learning-local-demo-parent-portal-approved-report-inbox-read-receipt-report.json',
      ],
      expectedResult:
        'The preserved fixture journey is complete and parent-owned.',
      productionBlocker: false,
    },
    {
      smokeId: 'rc-smoke-role-permission-negative-paths',
      journey:
        'non-owning parent + unassigned teacher + learner wrong role + support mutation denial',
      verificationLevel: 'AUTOMATED_UNIT',
      status: 'PASS_LOCAL',
      commandOrEvidence: 'npm run test:learning-local',
      evidencePaths: [
        'apps/api/src/learning-local-demo/learning-local-demo.production-hardening.spec.ts',
      ],
      expectedResult:
        'Every required role has a permission-negative fixture row.',
      productionBlocker: false,
    },
    {
      smokeId: 'rc-smoke-entitlement-lifecycle',
      journey: 'active + pending payment + refunded + expired + revoked',
      verificationLevel: 'AUTOMATED_UNIT',
      status: 'PASS_LOCAL',
      commandOrEvidence: 'npm run test:learning-local',
      evidencePaths: [
        'exports/learning-local-demo-subscription-entitlement-daily-plan-access-report.json',
      ],
      expectedResult: 'Only active entitlement unlocks the learning fixture.',
      productionBlocker: false,
    },
    {
      smokeId: 'rc-smoke-refund-commission-payout-safety',
      journey:
        'fixture payment -> 10-day refund window -> commission hold/release -> refund clawback -> payout guards',
      verificationLevel: 'AUTOMATED_UNIT',
      status: 'PASS_LOCAL',
      commandOrEvidence:
        'npm --prefix apps/api run test -- activation-orders.service.spec.ts entitlement.service.spec.ts package-entitlement-order-flow.spec.ts package-entitlement-snapshot.spec.ts channel-finance.service.spec.ts --runInBand',
      evidencePaths: [
        'apps/api/src/activation-orders/activation-orders.service.spec.ts',
        'apps/api/src/channel-finance/channel-finance.service.spec.ts',
      ],
      expectedResult:
        'Fixture-only money policy remains preserved with no provider call.',
      productionBlocker: false,
    },
    {
      smokeId: 'rc-smoke-local-demo-production-containment',
      journey: 'production environment -> local-demo route -> not found',
      verificationLevel: 'AUTOMATED_UNIT',
      status: 'PASS_LOCAL',
      commandOrEvidence: 'npm run test:learning-local',
      evidencePaths: [
        'apps/api/src/runtime-safety/local-demo-only.guard.ts',
        'exports/learning-local-demo-production-runtime-gate-matrix-report.json',
      ],
      expectedResult: 'Fixture routes cannot be exposed in production mode.',
      productionBlocker: false,
    },
    {
      smokeId: 'rc-smoke-staging-release-rehearsal',
      journey:
        'backup -> migrate -> smoke -> rollback/forward repair -> restore verify',
      verificationLevel: 'STAGING_REQUIRED',
      status: 'APPROVED_PENDING_ISOLATED_STAGING',
      commandOrEvidence: 'npm --prefix apps/api run rehearse:staging',
      evidencePaths: [
        'docs/hoctap_minhhuong/prisma_auth_session_store_runbook.md',
        'exports/minhhuong-staging-rc-v3-local-rehearsal.json',
      ],
      expectedResult:
        'Named owners approve RPO/RTO, rollback, and restore evidence.',
      productionBlocker: true,
    },
    {
      smokeId: 'rc-smoke-observability-incident-drill',
      journey:
        'health/error/latency alert -> correlation -> owner ack -> containment',
      verificationLevel: 'STAGING_REQUIRED',
      status: 'APPROVED_PENDING_ISOLATED_STAGING',
      commandOrEvidence: 'npm --prefix apps/api run rehearse:staging',
      evidencePaths: [
        'docs/hoctap_minhhuong/production_hardening_go_live_gate.md',
        'exports/minhhuong-staging-rc-v3-local-rehearsal.json',
      ],
      expectedResult:
        'Dashboards, routing, thresholds, and incident drill are accepted.',
      productionBlocker: true,
    },
  ];

export const learningReleaseApprovalRows: LearningReleaseApprovalRow[] = [
  {
    approvalId: 'release-approval-database-owner',
    ownerRole: 'DATABASE_OWNER',
    approvalScope:
      'Staging migration, read validation, backup, restore, forward repair, rollback, capacity, failover, RPO, and RTO',
    status: 'APPROVED_WITH_CONDITIONS_FOR_STAGING_REHEARSAL',
    approverName: null,
    authorityPrincipal: 'Minh Huong workspace/project owner',
    approvedAt: '2026-07-10T20:30:22+07:00',
    approvalEvidenceRefs: [
      'docs/hoctap_minhhuong/approvals/2026-07-10_staging_conditional_approval.json',
    ],
    acceptanceCriteria: [
      'The target is an explicitly named non-production staging database with sanitized fixtures, least-privilege access, and an approved change window.',
      'Migration, schema/read validation, backup checksum, restore integrity, forward repair, and rollback or containment steps have named stop conditions.',
      'Numeric RPO/RTO, capacity, connection, concurrency, and failover thresholds are accepted before rehearsal.',
    ],
    requiredEvidence: [
      'Named database-owner approval with timestamp, staging target identifier, release version, and change window.',
      'Migration/read/backup/restore/forward-repair rehearsal record with checksums, timings, abort criteria, and exact cleanup.',
      'Accepted RPO/RTO, rollback, capacity, and failover evidence.',
    ],
    stagingApprovalRequired: true,
    productionBlocker: true,
  },
  {
    approvalId: 'release-approval-privacy-retention-owner',
    ownerRole: 'PRIVACY_RETENTION_OWNER',
    approvalScope:
      'Child data, auth/audit, upload, transcript, deletion, redaction, retention, and export handling',
    status: 'APPROVED_WITH_CONDITIONS_FOR_STAGING_REHEARSAL',
    approverName: null,
    authorityPrincipal: 'Minh Huong workspace/project owner',
    approvedAt: '2026-07-10T20:30:22+07:00',
    approvalEvidenceRefs: [
      'docs/hoctap_minhhuong/approvals/2026-07-10_staging_conditional_approval.json',
    ],
    acceptanceCriteria: [
      'Retention and deletion periods are approved for child data, auth/audit rows, uploads, exports, and any future AI transcript data.',
      'Support access, privacy redaction, export purpose, incident access, and deletion exceptions are documented and auditable.',
      'A staging-only export/deletion/redaction dry-run uses synthetic or sanitized data and has explicit cleanup criteria.',
    ],
    requiredEvidence: [
      'Named privacy/retention-owner approval with policy version and effective date.',
      'Approved retention/deletion/export schedule and access-control matrix.',
      'Synthetic staging dry-run evidence with redaction and access audit results.',
    ],
    stagingApprovalRequired: true,
    productionBlocker: true,
  },
  {
    approvalId: 'release-approval-incident-owner',
    ownerRole: 'INCIDENT_OWNER',
    approvalScope:
      'Monitoring, alert routing, log/trace correlation, incident response, rollback, and drill ownership',
    status: 'APPROVED_WITH_CONDITIONS_FOR_STAGING_REHEARSAL',
    approverName: null,
    authorityPrincipal: 'Minh Huong workspace/project owner',
    approvedAt: '2026-07-10T20:30:22+07:00',
    approvalEvidenceRefs: [
      'docs/hoctap_minhhuong/approvals/2026-07-10_staging_conditional_approval.json',
    ],
    acceptanceCriteria: [
      'Dashboards and alerts cover health, error rate, latency, auth denial/replay, refund, commission, payout, and repository failure signals.',
      'Thresholds, routing, acknowledgement, escalation, containment, rollback, and recovery owners are named.',
      'A staging incident drill proves alert-to-correlation-to-owner acknowledgement and safe containment within accepted targets.',
    ],
    requiredEvidence: [
      'Named incident-owner approval, on-call route, escalation path, and rollback owner.',
      'Approved dashboard/alert threshold inventory with log/trace correlation fields.',
      'Timed staging incident drill and after-action record.',
    ],
    stagingApprovalRequired: true,
    productionBlocker: true,
  },
  {
    approvalId: 'release-approval-security-owner',
    ownerRole: 'SECURITY_OWNER',
    approvalScope:
      'External security review, secret handling, least privilege, webhook verification, abuse controls, and residual findings',
    status: 'APPROVED_WITH_CONDITIONS_FOR_STAGING_REHEARSAL',
    approverName: null,
    authorityPrincipal: 'Minh Huong workspace/project owner',
    approvedAt: '2026-07-10T20:30:22+07:00',
    approvalEvidenceRefs: [
      'docs/hoctap_minhhuong/approvals/2026-07-10_staging_conditional_approval.json',
    ],
    acceptanceCriteria: [
      'Secrets remain in an approved secret store; staging and production credentials are separated and never exported in evidence.',
      'Least-privilege access, webhook signature verification, idempotency, rate limiting, replay defense, and audit redaction are reviewed.',
      'External security findings have severity, owner, due date, accepted residual risk, and release-blocking disposition.',
    ],
    requiredEvidence: [
      'Named security-owner approval and external review reference.',
      'Threat model and access/secret/webhook control checklist for the release version.',
      'Finding register showing closure or explicit risk acceptance for every release-relevant item.',
    ],
    stagingApprovalRequired: true,
    productionBlocker: true,
  },
  {
    approvalId: 'release-approval-provider-owner',
    ownerRole: 'PROVIDER_OWNER',
    approvalScope:
      'Payment, refund, payout, notification, and AI provider acceptance, reconciliation, loss limits, and kill switches',
    status: 'APPROVED_WITH_CONDITIONS_FOR_STAGING_REHEARSAL',
    approverName: null,
    authorityPrincipal: 'Minh Huong workspace/project owner',
    approvedAt: '2026-07-10T20:30:22+07:00',
    approvalEvidenceRefs: [
      'docs/hoctap_minhhuong/approvals/2026-07-10_staging_conditional_approval.json',
    ],
    acceptanceCriteria: [
      'Each provider has separately approved staging credentials, webhook verification, idempotency, reconciliation, rate/loss limits, and a tested kill switch.',
      'Payment, 10-day refund, commission release/clawback, payout approval, notification, and AI boundaries have provider-specific rollback or containment criteria.',
      'No live or production provider mode is enabled by the Codex auto-loop; every staging provider smoke requires explicit scoped approval.',
    ],
    requiredEvidence: [
      'Named owner approval per provider and explicitly scoped staging-smoke authorization.',
      'Provider acceptance matrix covering secrets, webhooks, idempotency, reconciliation, limits, kill switch, rollback, and incident routing.',
      'Staging-only smoke evidence with synthetic transactions and confirmed cleanup or reversal.',
    ],
    stagingApprovalRequired: true,
    productionBlocker: true,
  },
  {
    approvalId: 'release-approval-release-owner',
    ownerRole: 'RELEASE_OWNER',
    approvalScope:
      'Named release decision, accepted residual risk, rollback ownership, and production enablement record',
    status: 'STAGING_REHEARSAL_APPROVED_PRODUCTION_NOT_APPROVED',
    approverName: null,
    authorityPrincipal: 'Minh Huong workspace/project owner',
    approvedAt: '2026-07-10T20:30:22+07:00',
    approvalEvidenceRefs: [
      'docs/hoctap_minhhuong/approvals/2026-07-10_staging_conditional_approval.json',
    ],
    acceptanceCriteria: [
      'The named release owner reviews the exact release version, all prerequisite approvals, unresolved risks, and rollback or containment ownership.',
      'The go-live decision records approver, timestamp, release version, accepted residual risks, enablement window, and rollback owner.',
      'production_ready and production_enabled remain false until that separate signed decision exists; no auto-loop output can substitute for it.',
    ],
    requiredEvidence: [
      'Named release-owner approval referencing every prerequisite approval and the immutable release version.',
      'Signed residual-risk acceptance and rollback/containment ownership record.',
      'Separate production enablement record outside the Codex auto-loop.',
    ],
    stagingApprovalRequired: false,
    productionBlocker: true,
  },
];

export const requiredRoles = Object.keys(
  roleJourneyConfigs,
) as LearningReleaseCandidateRole[];
