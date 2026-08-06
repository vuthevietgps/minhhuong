import assert from 'node:assert/strict';
import test from 'node:test';
import {
  STAGING_REHEARSAL_APPROVAL_CODE,
  STAGING_REHEARSAL_DECISION_ID,
  STAGING_REHEARSAL_TARGET,
  assertStagingRehearsalAuthorization,
  evaluateStagingRehearsalGates,
  makeTimedIncidentDrill,
} from './staging-rehearsal-contract.mjs';

const approval = {
  decision_id: STAGING_REHEARSAL_DECISION_ID,
  decision_summary: {
    staging: 'APPROVED_WITH_CONDITIONS',
    production: 'NOT_APPROVED',
    production_ready: false,
  },
  approved_target: {
    name: STAGING_REHEARSAL_TARGET,
    classification: 'isolated_nonproduction_local_staging',
    production_credentials_allowed: false,
    production_data_allowed: false,
    external_provider_mutation_allowed: false,
  },
  owner_decisions: [
    'database_owner',
    'privacy_retention_owner',
    'incident_owner',
    'security_owner',
    'provider_owner',
    'release_owner',
  ].map((owner_role) => ({ owner_role })),
};

test('authorizes only the exact isolated local staging target', () => {
  const result = assertStagingRehearsalAuthorization({
    approval,
    approvalCode: STAGING_REHEARSAL_APPROVAL_CODE,
    databaseUrl: 'postgresql://fixture:fixture@localhost:5432/fixture',
    nodeEnv: 'test',
    target: STAGING_REHEARSAL_TARGET,
  });
  assert.equal(result.target, STAGING_REHEARSAL_TARGET);
  assert.equal(result.productionApproved, false);

  assert.throws(
    () =>
      assertStagingRehearsalAuthorization({
        approval,
        approvalCode: STAGING_REHEARSAL_APPROVAL_CODE,
        databaseUrl: 'postgresql://fixture:fixture@production.example/fixture',
        nodeEnv: 'test',
        target: STAGING_REHEARSAL_TARGET,
      }),
    /refuses non-local database host/,
  );
  assert.throws(
    () =>
      assertStagingRehearsalAuthorization({
        approval,
        approvalCode: STAGING_REHEARSAL_APPROVAL_CODE,
        databaseUrl: 'postgresql://fixture:fixture@localhost:5432/fixture',
        nodeEnv: 'production',
        target: STAGING_REHEARSAL_TARGET,
      }),
    /refuses NODE_ENV=production/,
  );
});

test('passes only when migration, privacy, incident, headroom, and exact cleanup evidence all pass', () => {
  const incidentDrill = makeTimedIncidentDrill({
    correlationId: 'staging-incident:fixture',
    recoveryVerified: true,
    startedAtMs: 100,
    timeline: { acknowledgedAtMs: 110, containmentDecidedAtMs: 120 },
  });
  const result = evaluateStagingRehearsalGates({
    authSession: {
      status: 'PASS',
      backupRestore: {
        integrityVerified: true,
        sourceDigest: 'same',
        restoredDigest: 'same',
        hashOnlyRefreshPersistenceVerified: true,
        observedLocalRpoMs: 10,
        restoreAndValidationRtoMs: 20,
        temporaryBackupRemoved: true,
      },
      twoProcessApi: { processCount: 2, sharedRevocationVerified: true },
      repositoryOutage: { failClosedVerified: true },
      cleanup: {
        exactRandomDatabaseCleanupVerified: true,
        temporaryDirectoryRemoved: true,
      },
    },
    operationalControl: {
      status: 'PASS',
      twoProcessAtomicRateLimit: { processCount: 2, atomicLimitVerified: true },
      sharedCounters: { crossProcessAggregationVerified: true },
      outage: { failClosedVerified: true },
      retention: { cleanupVerified: true },
      cleanup: {
        apiProcessesStopped: true,
        exactRandomDatabaseCleanupVerified: true,
        temporaryDirectoryRemoved: true,
      },
    },
    alertState: {
      status: 'PASS',
      twoProcessEvaluation: {
        processCount: 2,
        exactlyOneOpenAndRemainingSuppressedSets: true,
      },
      inspection: { redactionVerified: true },
      auditReadModel: {
        adminReadOnlyVerified: true,
        redactionVerified: true,
        boundedWindowVerified: true,
      },
      outage: {
        inspectionFailedClosed: true,
        auditReadModelFailedClosed: true,
      },
      retention: { exactCleanupVerified: true },
      cleanup: {
        apiProcessesStopped: true,
        exactRandomDatabaseCleanupVerified: true,
        temporaryDirectoryRemoved: true,
      },
    },
    finalCleanup: {
      matchingDatabaseCount: 0,
      matchingListenerCount: 0,
      matchingTemporaryArtifactCount: 0,
    },
    forwardRepairCommand: { status: 'PASS', testCount: 5 },
    headroom: { minimumObservedFreeMemoryPercent: 40 },
    incidentDrill,
  });
  assert.equal(result.status, 'PASS');
  assert.deepEqual(result.failedChecks, []);

  const failed = evaluateStagingRehearsalGates({
    authSession: {},
    operationalControl: {},
    alertState: {},
    finalCleanup: {},
    forwardRepairCommand: {},
    headroom: { minimumObservedFreeMemoryPercent: 29.9 },
    incidentDrill: {},
  });
  assert.equal(failed.status, 'FAIL');
  assert.ok(failed.failedChecks.includes('resourceHeadroom'));
  assert.ok(failed.failedChecks.includes('exactCleanup'));
});
