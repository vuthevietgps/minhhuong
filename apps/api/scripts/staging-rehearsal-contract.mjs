export const STAGING_REHEARSAL_TARGET = 'minhhuong-staging-rc-v3-local';
export const STAGING_REHEARSAL_APPROVAL_CODE =
  'MH_RC_V3_USER_DELEGATED_STAGING_CONDITIONAL_20260710_01';
export const STAGING_REHEARSAL_DECISION_ID =
  'MH-RC-V3-STAGING-CONDITIONAL-20260710-01';

const LOCAL_DATABASE_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

export function assertStagingRehearsalAuthorization({
  approval,
  approvalCode,
  databaseUrl,
  nodeEnv,
  target,
}) {
  if (nodeEnv?.trim().toLowerCase() === 'production') {
    throw new Error('The staging rehearsal refuses NODE_ENV=production');
  }
  if (target !== STAGING_REHEARSAL_TARGET) {
    throw new Error(`The staging rehearsal refuses target ${target}`);
  }
  if (approvalCode !== STAGING_REHEARSAL_APPROVAL_CODE) {
    throw new Error('The staging rehearsal approval code does not match');
  }
  if (approval?.decision_id !== STAGING_REHEARSAL_DECISION_ID) {
    throw new Error('The staging rehearsal decision id does not match');
  }
  if (approval?.approved_target?.name !== STAGING_REHEARSAL_TARGET) {
    throw new Error('The approval does not name the requested staging target');
  }
  if (
    approval?.decision_summary?.staging !== 'APPROVED_WITH_CONDITIONS' ||
    approval?.decision_summary?.production !== 'NOT_APPROVED' ||
    approval?.decision_summary?.production_ready !== false
  ) {
    throw new Error(
      'The approval does not authorize the isolated staging rehearsal',
    );
  }
  if (
    approval?.approved_target?.classification !==
      'isolated_nonproduction_local_staging' ||
    approval?.approved_target?.production_credentials_allowed !== false ||
    approval?.approved_target?.production_data_allowed !== false ||
    approval?.approved_target?.external_provider_mutation_allowed !== false
  ) {
    throw new Error('The approved target safety conditions are incomplete');
  }
  if (!Array.isArray(approval?.owner_decisions)) {
    throw new Error('The approval owner decisions are missing');
  }
  const ownerRoles = new Set(
    approval.owner_decisions.map((decision) => decision.owner_role),
  );
  for (const requiredRole of [
    'database_owner',
    'privacy_retention_owner',
    'incident_owner',
    'security_owner',
    'provider_owner',
    'release_owner',
  ]) {
    if (!ownerRoles.has(requiredRole)) {
      throw new Error(`The approval is missing owner decision ${requiredRole}`);
    }
  }

  if (!databaseUrl) {
    throw new Error(
      'The staging rehearsal requires a localhost PostgreSQL URL',
    );
  }
  const parsedDatabaseUrl = new URL(databaseUrl);
  if (!['postgres:', 'postgresql:'].includes(parsedDatabaseUrl.protocol)) {
    throw new Error('The staging rehearsal requires PostgreSQL');
  }
  if (!LOCAL_DATABASE_HOSTS.has(parsedDatabaseUrl.hostname)) {
    throw new Error(
      `The staging rehearsal refuses non-local database host ${parsedDatabaseUrl.hostname}`,
    );
  }
  if (!parsedDatabaseUrl.username || !parsedDatabaseUrl.pathname.slice(1)) {
    throw new Error(
      'The staging rehearsal requires a local admin database URL',
    );
  }

  return {
    approvalCode,
    classification: approval.approved_target.classification,
    databaseHost: parsedDatabaseUrl.hostname,
    decisionId: approval.decision_id,
    productionApproved: false,
    target,
  };
}

export function evaluateStagingRehearsalGates({
  alertState,
  authSession,
  finalCleanup,
  forwardRepairCommand,
  headroom,
  incidentDrill,
  operationalControl,
}) {
  const checks = {
    migrationRollbackForwardRepair:
      forwardRepairCommand?.status === 'PASS' &&
      forwardRepairCommand?.testCount >= 5,
    backupChecksumRestore:
      authSession?.status === 'PASS' &&
      authSession?.backupRestore?.integrityVerified === true &&
      authSession?.backupRestore?.sourceDigest ===
        authSession?.backupRestore?.restoredDigest &&
      authSession?.backupRestore?.hashOnlyRefreshPersistenceVerified === true,
    stagingRpoObjective:
      Number.isFinite(authSession?.backupRestore?.observedLocalRpoMs) &&
      authSession.backupRestore.observedLocalRpoMs <= 24 * 60 * 60 * 1000,
    stagingRtoObjective:
      Number.isFinite(authSession?.backupRestore?.restoreAndValidationRtoMs) &&
      authSession.backupRestore.restoreAndValidationRtoMs <= 4 * 60 * 60 * 1000,
    twoProcessSession:
      authSession?.twoProcessApi?.processCount === 2 &&
      authSession?.twoProcessApi?.sharedRevocationVerified === true &&
      authSession?.repositoryOutage?.failClosedVerified === true,
    twoProcessOperational:
      operationalControl?.status === 'PASS' &&
      operationalControl?.twoProcessAtomicRateLimit?.processCount === 2 &&
      operationalControl?.twoProcessAtomicRateLimit?.atomicLimitVerified ===
        true &&
      operationalControl?.sharedCounters?.crossProcessAggregationVerified ===
        true &&
      operationalControl?.outage?.failClosedVerified === true,
    twoProcessAlert:
      alertState?.status === 'PASS' &&
      alertState?.twoProcessEvaluation?.processCount === 2 &&
      alertState?.twoProcessEvaluation
        ?.exactlyOneOpenAndRemainingSuppressedSets === true &&
      alertState?.outage?.inspectionFailedClosed === true &&
      alertState?.outage?.auditReadModelFailedClosed === true,
    privacyRedactionAccessExport:
      alertState?.inspection?.redactionVerified === true &&
      alertState?.auditReadModel?.adminReadOnlyVerified === true &&
      alertState?.auditReadModel?.redactionVerified === true &&
      alertState?.auditReadModel?.boundedWindowVerified === true,
    privacyExactRetentionCleanup:
      operationalControl?.retention?.cleanupVerified === true &&
      alertState?.retention?.exactCleanupVerified === true,
    incidentDrill:
      incidentDrill?.acknowledgementWithinObjective === true &&
      incidentDrill?.containmentDecisionWithinObjective === true &&
      incidentDrill?.providerKillSwitchVerified === true &&
      incidentDrill?.recoveryVerified === true,
    resourceHeadroom:
      Number.isFinite(headroom?.minimumObservedFreeMemoryPercent) &&
      headroom.minimumObservedFreeMemoryPercent >= 30,
    exactCleanup:
      authSession?.cleanup?.exactRandomDatabaseCleanupVerified === true &&
      authSession?.cleanup?.temporaryDirectoryRemoved === true &&
      authSession?.backupRestore?.temporaryBackupRemoved === true &&
      operationalControl?.cleanup?.apiProcessesStopped === true &&
      operationalControl?.cleanup?.exactRandomDatabaseCleanupVerified ===
        true &&
      operationalControl?.cleanup?.temporaryDirectoryRemoved === true &&
      alertState?.cleanup?.apiProcessesStopped === true &&
      alertState?.cleanup?.exactRandomDatabaseCleanupVerified === true &&
      alertState?.cleanup?.temporaryDirectoryRemoved === true &&
      finalCleanup?.matchingDatabaseCount === 0 &&
      finalCleanup?.matchingListenerCount === 0 &&
      finalCleanup?.matchingTemporaryArtifactCount === 0,
  };

  const failedChecks = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);
  return {
    checks,
    failedChecks,
    passedCheckCount: Object.keys(checks).length - failedChecks.length,
    requiredCheckCount: Object.keys(checks).length,
    status: failedChecks.length === 0 ? 'PASS' : 'FAIL',
  };
}

export function makeTimedIncidentDrill({
  correlationId,
  recoveryVerified,
  startedAtMs,
  timeline,
}) {
  const acknowledgedAtMs = timeline.acknowledgedAtMs;
  const containmentDecidedAtMs = timeline.containmentDecidedAtMs;
  return {
    schemaVersion: 'minh_huong.synthetic_incident_drill.v1',
    correlationId,
    syntheticFixtureOnly: true,
    thresholds: {
      fiveXxPercent: 1,
      fiveXxWindowMinutes: 5,
      databaseUtilizationPercent: 80,
      databaseWindowMinutes: 10,
      authFailureBaselineMultiplier: 3,
      authFailureBaselineWindowMinutes: 15,
    },
    simulatedSignal: {
      availability: 'DEGRADED_FIXTURE',
      fiveXxPercent: 1,
      authFailureBaselineMultiplier: 3,
      databaseUtilizationPercent: 0,
      queueBacklog: 0,
      providerState: 'DISABLED',
    },
    acknowledgementMs: acknowledgedAtMs - startedAtMs,
    containmentDecisionMs: containmentDecidedAtMs - startedAtMs,
    acknowledgementObjectiveMs: 15 * 60 * 1000,
    containmentDecisionObjectiveMs: 30 * 60 * 1000,
    acknowledgementWithinObjective:
      acknowledgedAtMs - startedAtMs <= 15 * 60 * 1000,
    containmentDecisionWithinObjective:
      containmentDecidedAtMs - startedAtMs <= 30 * 60 * 1000,
    escalation: 'LOCAL_REHEARSAL_INCIDENT_OWNER_FIXTURE',
    providerKillSwitchVerified: true,
    containmentDecision:
      'KEEP_PRODUCTION_DISABLED_AND_ROLL_BACK_TO_CLEAN_DISPOSABLE_STATE',
    recoveryVerified,
    productionEnabled: false,
    externalAlertDeliveryUsed: false,
    events: [
      'synthetic_alert_correlated',
      'incident_acknowledged',
      'fixture_escalation_recorded',
      'provider_kill_switch_confirmed',
      'containment_decision_recorded',
      'cleanup_and_recovery_verified',
    ],
  };
}
