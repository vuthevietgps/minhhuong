import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { randomUUID, scryptSync } from 'node:crypto';
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  rmSync,
  rmdirSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:net';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const require = createRequire(import.meta.url);
const scriptDir = dirname(fileURLToPath(import.meta.url));
const apiRoot = resolve(scriptDir, '..');
const repoRoot = resolve(apiRoot, '../..');
const exportsDir = join(repoRoot, 'exports');
config({ path: join(repoRoot, '.env') });
config({ path: join(apiRoot, '.env') });

const reportJsonPath = join(
  exportsDir,
  'learning-local-demo-auth-operational-alert-state-disposable-smoke-report.json',
);
const reportMarkdownPath = join(
  exportsDir,
  'learning-local-demo-auth-operational-alert-state-disposable-smoke-report.md',
);
const baseDatabaseUrl =
  process.env.AUTH_OPERATIONAL_ALERT_STATE_SMOKE_BASE_DATABASE_URL ??
  process.env.DATABASE_URL;
if (!baseDatabaseUrl) {
  throw new Error(
    'Set AUTH_OPERATIONAL_ALERT_STATE_SMOKE_BASE_DATABASE_URL or DATABASE_URL to a localhost admin database; no credential fallback is embedded',
  );
}

const runId = randomUUID().replaceAll('-', '_');
const databaseName = `auth_operational_alert_state_smoke_${runId}`;
const temporaryBase = join(
  repoRoot,
  '.runtime',
  'auth-operational-alert-state-smoke',
);
const temporaryRoot = join(temporaryBase, runId);
const apiLogRoot =
  process.env.AUTH_OPERATIONAL_ALERT_STATE_SMOKE_LOG_DIR ?? temporaryRoot;
const syntheticUserId = `auth-alert-state-smoke-user-${runId}`;
const syntheticEmail = `auth-alert-state-smoke-${runId}@example.test`;
const syntheticPassword = `LocalOnly-${randomUUID()}-A1!`;
const keySecret = `local-auth-alert-state-${randomUUID()}-${randomUUID()}`;
const jwtSecret = `local-auth-alert-state-jwt-${randomUUID()}-${randomUUID()}`;

const report = {
  schemaVersion: 'minh_huong.auth_operational_alert_state_disposable_smoke.v3',
  generatedAt: new Date().toISOString(),
  scope: 'disposable_localhost_only',
  status: 'FAIL',
  productionReady: false,
  productionEnabled: false,
  database: {
    name: databaseName,
    host: undefined,
    randomDatabaseCount: 1,
    randomDatabaseCreated: false,
    randomDatabaseDropped: false,
  },
  twoProcessEvaluation: {
    processCount: 2,
    responseCount: 0,
    openCandidateSetCount: 0,
    cooldownSuppressedSetCount: 0,
    openCandidateCount: 0,
    cooldownSuppressedCandidateCount: 0,
    exactlyOneOpenAndRemainingSuppressedSets: false,
  },
  rollingWindow: {
    requestedWindowMs: 60 * 60 * 1000,
    responseWindowCount: 0,
    explicitWindowVerified: false,
    retainedSnapshotTotalsOnly: false,
  },
  inspection: {
    adminReadOnlyStatus: undefined,
    adminRoleReturned: false,
    actorIdentityExposed: false,
    redactionVerified: false,
  },
  sharedState: {
    persistedCurrentRows: 0,
    fingerprintsRedacted: false,
    sharedPrismaScopeVerified: false,
  },
  appendOnlyAudit: {
    persistedResponseAuditRows: 0,
    uniqueResponseCorrelationIds: 0,
    redactionVerified: false,
    databaseUpdateRejected: false,
    idempotentCorrelationRowCount: 0,
    idempotentReplayVerified: false,
    correlationConflictFailedClosed: false,
  },
  auditReadModel: {
    correlationLookupStatus: undefined,
    correlationLookupVerified: false,
    incidentExportPageSize: 3,
    incidentExportPageCount: 0,
    incidentExportRowCount: 0,
    uniqueCorrelationCount: 0,
    deterministicPaginationVerified: false,
    boundedWindowRejectionStatus: undefined,
    boundedWindowVerified: false,
    adminReadOnlyVerified: false,
    redactionVerified: false,
  },
  capacity: {
    sampleCount: 8,
    forcedContentionHoldMs: 500,
    localTechnicalThresholdMs: 5_000,
    maxLockWaitMs: 0,
    p95LockWaitMs: 0,
    maxEvaluationDurationMs: 0,
    maxClientDurationMs: 0,
    contentionObserved: false,
    withinLocalTechnicalThreshold: false,
  },
  retention: {
    expiredFixtureRowsCreated: 2,
    expiredAuditFixtureRowsCreated: 2,
    expiredAlertStatesRemoved: 0,
    expiredEvaluationAuditsRemoved: 0,
    currentAlertStatesPreserved: 0,
    currentEvaluationAuditsPreserved: 0,
    exactCleanupVerified: false,
  },
  outage: {
    stateProviderFailedClosed: false,
    auditProviderFailedClosed: false,
    snapshotProviderFailedClosed: false,
    inspectionHttpStatus: undefined,
    inspectionFailedClosed: false,
    auditCorrelationLookupHttpStatus: undefined,
    auditIncidentExportHttpStatus: undefined,
    auditReadModelFailedClosed: false,
  },
  cleanup: {
    apiProcessesStopped: false,
    temporaryDirectoryRemoved: false,
    exactRandomDatabaseCleanupVerified: false,
  },
  safety: {
    productionDatabaseUsed: false,
    stagingDatabaseUsed: false,
    realIdentityOrSessionUsed: false,
    externalAlertProviderUsed: false,
    liveNotificationUsed: false,
    rawRateLimitKeysExported: false,
    rawCredentialsOrTokensExported: false,
    paymentRefundCommissionPayoutMutationUsed: false,
    liveAiProviderUsed: false,
  },
  failure: undefined,
};

const apiProcesses = [];
let adminPrisma;
let sourcePrisma;
let sourceConnectionsDisabled = false;
let harnessError;

try {
  const safety = assertDisposableLocalScope(baseDatabaseUrl);
  report.database.host = safety.hostname;
  mkdirSync(temporaryRoot, { recursive: true });
  mkdirSync(apiLogRoot, { recursive: true });

  const adminUrl = databaseUrlForDatabase(baseDatabaseUrl, 'postgres');
  adminPrisma = createPrisma(adminUrl);
  await adminPrisma.$connect();
  await createDatabase(adminPrisma, databaseName);
  report.database.randomDatabaseCreated = true;

  const sourceUrl = databaseUrlForDatabase(baseDatabaseUrl, databaseName);
  await runPrisma(
    ['migrate', 'deploy', '--schema', 'prisma/schema.prisma'],
    sourceUrl,
  );
  await seedSyntheticAdmin(sourceUrl);
  sourcePrisma = createPrisma(sourceUrl);
  await sourcePrisma.$connect();

  const portA = await findOpenPort();
  let portB = await findOpenPort();
  while (portB === portA) {
    portB = await findOpenPort();
  }
  apiProcesses.push(
    spawnApiProcess('instance-a', portA, sourceUrl),
    spawnApiProcess('instance-b', portB, sourceUrl),
  );
  await Promise.all([
    waitForApi(`http://127.0.0.1:${portA}`, apiProcesses[0]),
    waitForApi(`http://127.0.0.1:${portB}`, apiProcesses[1]),
  ]);

  const baseA = `http://127.0.0.1:${portA}`;
  const baseB = `http://127.0.0.1:${portB}`;
  const login = await requestJson(`${baseA}/v1/auth/login`, {
    method: 'POST',
    body: { email: syntheticEmail, password: syntheticPassword },
    expectedStatus: 201,
  });

  const { PrismaAuthOperationalControl } = require(
    join(apiRoot, 'dist/src/auth/prisma-auth-operational-control.js'),
  );
  const { PrismaAuthOperationalAlertState } = require(
    join(apiRoot, 'dist/src/auth/prisma-auth-operational-alert-state.js'),
  );
  const operationalControl = new PrismaAuthOperationalControl(sourcePrisma, {
    keySecret,
  });
  const occurredAt = new Date(Date.now() - 60_000);
  await Promise.all([
    operationalControl.record({
      kind: 'LOGIN_THROTTLED',
      value: 7,
      occurredAt,
    }),
    operationalControl.record({
      kind: 'REFRESH_THROTTLED',
      value: 6,
      occurredAt,
    }),
    operationalControl.record({
      kind: 'REFRESH_REPLAY_DENIED',
      value: 2,
      occurredAt,
    }),
    operationalControl.record({
      kind: 'SESSION_REPOSITORY_ERROR',
      occurredAt,
    }),
  ]);

  const lockBlocker = await holdSharedEvaluationLock(sourcePrisma);
  const responsePromise = Promise.all(
    Array.from(
      { length: report.capacity.sampleCount },
      (_, index) => [baseA, baseB][index % 2],
    ).map((base) =>
      requestJson(`${base}/v1/auth/operational-alerts`, {
        token: login.body.accessToken,
        expectedStatus: 200,
      }),
    ),
  );
  await new Promise((resolveDelay) =>
    setTimeout(resolveDelay, report.capacity.forcedContentionHoldMs),
  );
  lockBlocker.release();
  const responses = await responsePromise;
  await lockBlocker.completion;
  report.twoProcessEvaluation.responseCount = responses.length;
  report.twoProcessEvaluation.openCandidateSetCount = responses.filter(
    (response) => response.body.decision === 'ALERT_CANDIDATES_OPEN',
  ).length;
  report.twoProcessEvaluation.cooldownSuppressedSetCount = responses.filter(
    (response) => response.body.decision === 'ALERT_CANDIDATES_SUPPRESSED',
  ).length;
  report.twoProcessEvaluation.openCandidateCount = responses.reduce(
    (total, response) => total + response.body.totals.openCandidateCount,
    0,
  );
  report.twoProcessEvaluation.cooldownSuppressedCandidateCount =
    responses.reduce(
      (total, response) =>
        total + response.body.totals.suppressedCandidateCount,
      0,
    );
  report.twoProcessEvaluation.exactlyOneOpenAndRemainingSuppressedSets =
    report.twoProcessEvaluation.openCandidateSetCount === 1 &&
    report.twoProcessEvaluation.cooldownSuppressedSetCount ===
      responses.length - 1 &&
    report.twoProcessEvaluation.openCandidateCount === 4 &&
    report.twoProcessEvaluation.cooldownSuppressedCandidateCount ===
      4 * (responses.length - 1);
  if (!report.twoProcessEvaluation.exactlyOneOpenAndRemainingSuppressedSets) {
    throw new Error(
      'Two-process alert evaluation was not one whole OPEN set plus whole suppressed sets',
    );
  }

  const lockWaitSamples = responses
    .map((response) => response.body.contention?.lockWaitMs)
    .filter((value) => Number.isFinite(value));
  const evaluationDurationSamples = responses
    .map((response) => response.body.contention?.evaluationDurationMs)
    .filter((value) => Number.isFinite(value));
  const sortedLockWaitSamples = [...lockWaitSamples].sort((a, b) => a - b);
  report.capacity.maxLockWaitMs = Math.max(...lockWaitSamples, 0);
  report.capacity.p95LockWaitMs =
    sortedLockWaitSamples[
      Math.max(0, Math.ceil(sortedLockWaitSamples.length * 0.95) - 1)
    ] ?? 0;
  report.capacity.maxEvaluationDurationMs = Math.max(
    ...evaluationDurationSamples,
    0,
  );
  report.capacity.maxClientDurationMs = Math.max(
    ...responses.map((response) => response.durationMs),
    0,
  );
  report.capacity.contentionObserved =
    lockWaitSamples.length === report.capacity.sampleCount &&
    report.capacity.maxLockWaitMs >=
      report.capacity.forcedContentionHoldMs * 0.5;
  report.capacity.withinLocalTechnicalThreshold =
    report.capacity.contentionObserved &&
    report.capacity.maxEvaluationDurationMs <=
      report.capacity.localTechnicalThresholdMs &&
    report.capacity.maxClientDurationMs <=
      report.capacity.localTechnicalThresholdMs;
  if (!report.capacity.withinLocalTechnicalThreshold) {
    throw new Error('Local alert-state contention capacity check failed');
  }

  report.rollingWindow.responseWindowCount = responses.filter(
    (response) =>
      response.body.snapshotWindow?.requestedWindowMs ===
        report.rollingWindow.requestedWindowMs &&
      response.body.snapshotWindow?.requestedStartedAt &&
      response.body.snapshotWindow?.effectiveStartedAt &&
      response.body.snapshotWindow?.endedAt,
  ).length;
  report.rollingWindow.explicitWindowVerified = responses.every(
    (response) =>
      response.body.safety.explicitRollingWindow === true &&
      response.body.safety.retainedSnapshotTotalsOnly === false,
  );
  if (
    report.rollingWindow.responseWindowCount !== responses.length ||
    !report.rollingWindow.explicitWindowVerified
  ) {
    throw new Error('Alert responses did not expose explicit rolling windows');
  }

  report.inspection.adminReadOnlyStatus = responses[0].status;
  report.inspection.adminRoleReturned = responses.every(
    (response) =>
      JSON.stringify(response.body.inspection.viewerRoles) ===
      JSON.stringify(['ADMIN']),
  );
  report.inspection.actorIdentityExposed = responses.some(
    (response) => response.body.inspection.actorIdentityExposed !== false,
  );
  const serializedResponses = JSON.stringify(responses.map((row) => row.body));
  report.inspection.redactionVerified =
    report.inspection.adminRoleReturned &&
    !report.inspection.actorIdentityExposed &&
    !serializedResponses.includes(syntheticEmail) &&
    !serializedResponses.includes(syntheticUserId) &&
    !serializedResponses.includes(login.body.accessToken) &&
    !serializedResponses.includes(keySecret);
  if (!report.inspection.redactionVerified) {
    throw new Error(
      'Operational alert inspection exposed synthetic identity or token data',
    );
  }

  const currentStateRows =
    await sourcePrisma.authOperationalAlertState.findMany({
      orderBy: { fingerprint: 'asc' },
    });
  report.sharedState.persistedCurrentRows = currentStateRows.length;
  report.sharedState.fingerprintsRedacted =
    currentStateRows.length === 4 &&
    currentStateRows.every((row) =>
      /^auth-operational-alert:[A-Z0-9_:-]+$/.test(row.fingerprint),
    ) &&
    !JSON.stringify(currentStateRows).includes(syntheticEmail) &&
    !JSON.stringify(currentStateRows).includes(syntheticUserId);
  report.sharedState.sharedPrismaScopeVerified = responses.every(
    (response) =>
      response.body.safety.deduplicationScope === 'SHARED_PRISMA_STATE',
  );
  if (
    !report.sharedState.fingerprintsRedacted ||
    !report.sharedState.sharedPrismaScopeVerified
  ) {
    throw new Error('Shared Prisma alert state was not redacted or reported');
  }

  const responseCorrelationIds = responses.map(
    (response) => response.body.evaluationAudit?.correlationId,
  );
  const responseAuditRows =
    await sourcePrisma.authOperationalAlertEvaluationAudit.findMany({
      where: { correlationId: { in: responseCorrelationIds } },
      orderBy: { correlationId: 'asc' },
    });
  report.appendOnlyAudit.persistedResponseAuditRows = responseAuditRows.length;
  report.appendOnlyAudit.uniqueResponseCorrelationIds = new Set(
    responseCorrelationIds,
  ).size;
  const serializedAuditRows = JSON.stringify(responseAuditRows);
  report.appendOnlyAudit.redactionVerified =
    responseAuditRows.length === responses.length &&
    responseAuditRows.every(
      (row) =>
        /^auth-alert-evaluation:[0-9a-f-]{36}$/.test(row.correlationId) &&
        /^[0-9a-f]{64}$/.test(row.inputDigest) &&
        Array.isArray(row.decisionsJson),
    ) &&
    !serializedAuditRows.includes(syntheticEmail) &&
    !serializedAuditRows.includes(syntheticUserId) &&
    !serializedAuditRows.includes(login.body.accessToken) &&
    !serializedAuditRows.includes(keySecret);
  report.appendOnlyAudit.databaseUpdateRejected = await rejects(() =>
    sourcePrisma.authOperationalAlertEvaluationAudit.update({
      where: { correlationId: responseAuditRows[0].correlationId },
      data: { expiresAt: new Date(Date.now() + 60_000) },
    }),
  );
  if (
    report.appendOnlyAudit.uniqueResponseCorrelationIds !== responses.length ||
    !report.appendOnlyAudit.redactionVerified ||
    !report.appendOnlyAudit.databaseUpdateRejected
  ) {
    throw new Error(
      'Append-only evaluation audit was duplicated or unredacted',
    );
  }

  const alertState = new PrismaAuthOperationalAlertState(sourcePrisma);
  const idempotentInput = {
    correlationId: `auth-alert-evaluation:${randomUUID()}`,
    evaluatedAt: new Date(),
    candidates: [],
  };
  const firstIdempotentEvaluation = await alertState.evaluate(idempotentInput);
  const replayedIdempotentEvaluation =
    await alertState.evaluate(idempotentInput);
  report.appendOnlyAudit.idempotentCorrelationRowCount =
    await sourcePrisma.authOperationalAlertEvaluationAudit.count({
      where: { correlationId: idempotentInput.correlationId },
    });
  report.appendOnlyAudit.idempotentReplayVerified =
    report.appendOnlyAudit.idempotentCorrelationRowCount === 1 &&
    firstIdempotentEvaluation.audit.idempotentReplay === false &&
    replayedIdempotentEvaluation.audit.idempotentReplay === true &&
    JSON.stringify(firstIdempotentEvaluation.decisions) ===
      JSON.stringify(replayedIdempotentEvaluation.decisions);
  report.appendOnlyAudit.correlationConflictFailedClosed =
    await rejectsWithName(
      () =>
        alertState.evaluate({
          ...idempotentInput,
          evaluatedAt: new Date(idempotentInput.evaluatedAt.getTime() + 1),
        }),
      'AuthOperationalAlertStateUnavailableError',
    );
  if (
    !report.appendOnlyAudit.idempotentReplayVerified ||
    !report.appendOnlyAudit.correlationConflictFailedClosed
  ) {
    throw new Error('Append-only evaluation audit idempotency failed');
  }

  const auditReadWindowStartedAt = new Date(
    Math.min(
      ...responseAuditRows.map((row) => row.evaluatedAt.getTime()),
      idempotentInput.evaluatedAt.getTime(),
    ) - 1_000,
  );
  const auditReadWindowEndedAt = new Date(
    Math.max(
      ...responseAuditRows.map((row) => row.evaluatedAt.getTime()),
      idempotentInput.evaluatedAt.getTime(),
    ) + 1_000,
  );
  const lookupCorrelationId = responseCorrelationIds[0];
  const correlationLookup = await requestJson(
    `${baseA}/v1/auth/operational-alert-audits/${encodeURIComponent(lookupCorrelationId)}`,
    { token: login.body.accessToken, expectedStatus: 200 },
  );
  report.auditReadModel.correlationLookupStatus = correlationLookup.status;
  report.auditReadModel.correlationLookupVerified =
    correlationLookup.body.audit?.correlationId === lookupCorrelationId &&
    correlationLookup.body.audit?.appendOnly === true &&
    correlationLookup.body.audit?.redacted === true;

  const incidentRows = [];
  let incidentCursor;
  do {
    const query = new URLSearchParams({
      windowStartedAt: auditReadWindowStartedAt.toISOString(),
      windowEndedAt: auditReadWindowEndedAt.toISOString(),
      limit: String(report.auditReadModel.incidentExportPageSize),
    });
    if (incidentCursor) query.set('cursor', incidentCursor);
    const page = await requestJson(
      `${baseA}/v1/auth/operational-alert-audits/incident-export?${query.toString()}`,
      { token: login.body.accessToken, expectedStatus: 200 },
    );
    report.auditReadModel.incidentExportPageCount += 1;
    incidentRows.push(...page.body.items);
    incidentCursor = page.body.pagination.nextCursor ?? undefined;
  } while (incidentCursor);
  report.auditReadModel.incidentExportRowCount = incidentRows.length;
  report.auditReadModel.uniqueCorrelationCount = new Set(
    incidentRows.map((row) => row.correlationId),
  ).size;
  const expectedIncidentRows = [...incidentRows].sort((left, right) => {
    const timeDifference =
      new Date(right.evaluatedAt).getTime() -
      new Date(left.evaluatedAt).getTime();
    return (
      timeDifference || right.correlationId.localeCompare(left.correlationId)
    );
  });
  report.auditReadModel.deterministicPaginationVerified =
    incidentRows.length === responses.length + 1 &&
    report.auditReadModel.uniqueCorrelationCount === incidentRows.length &&
    JSON.stringify(incidentRows) === JSON.stringify(expectedIncidentRows);
  const overlongWindow = new URLSearchParams({
    windowStartedAt: auditReadWindowStartedAt.toISOString(),
    windowEndedAt: new Date(
      auditReadWindowStartedAt.getTime() + 8 * 24 * 60 * 60 * 1000,
    ).toISOString(),
  });
  const overlongWindowResponse = await requestJson(
    `${baseA}/v1/auth/operational-alert-audits/incident-export?${overlongWindow.toString()}`,
    { token: login.body.accessToken, expectedStatus: 400 },
  );
  report.auditReadModel.boundedWindowRejectionStatus =
    overlongWindowResponse.status;
  report.auditReadModel.boundedWindowVerified =
    overlongWindowResponse.status === 400;
  report.auditReadModel.adminReadOnlyVerified =
    correlationLookup.body.inspection?.readOnly === true &&
    JSON.stringify(correlationLookup.body.inspection?.viewerRoles) ===
      JSON.stringify(['ADMIN']);
  const serializedReadModel = JSON.stringify({
    lookup: correlationLookup.body,
    incidentRows,
  });
  report.auditReadModel.redactionVerified =
    !serializedReadModel.includes(syntheticEmail) &&
    !serializedReadModel.includes(syntheticUserId) &&
    !serializedReadModel.includes(login.body.accessToken) &&
    !serializedReadModel.includes(keySecret) &&
    !serializedReadModel.includes('inputDigest') &&
    !serializedReadModel.includes('fingerprint') &&
    !serializedReadModel.includes('rateKey') &&
    !serializedReadModel.includes('refreshToken');
  if (
    !report.auditReadModel.correlationLookupVerified ||
    !report.auditReadModel.deterministicPaginationVerified ||
    !report.auditReadModel.boundedWindowVerified ||
    !report.auditReadModel.adminReadOnlyVerified ||
    !report.auditReadModel.redactionVerified
  ) {
    throw new Error('Auth alert evaluation audit read-model checks failed');
  }

  const cleanupNow = new Date();
  const expiredOpenedAt = new Date(cleanupNow.getTime() - 2 * 60 * 60 * 1000);
  const expiredAt = new Date(cleanupNow.getTime() - 60 * 60 * 1000);
  await sourcePrisma.authOperationalAlertState.createMany({
    data: ['A', 'B'].map((suffix) => ({
      fingerprint: `auth-operational-alert:EXPIRED_FIXTURE_${suffix}`,
      alertCode: 'LOGIN_THROTTLE_THRESHOLD',
      lastOpenedAt: expiredOpenedAt,
      cooldownUntil: expiredAt,
      expiresAt: expiredAt,
    })),
  });
  await sourcePrisma.authOperationalAlertEvaluationAudit.createMany({
    data: ['a', 'b'].map((digestCharacter) => ({
      correlationId: `auth-alert-evaluation:${randomUUID()}`,
      inputDigest: digestCharacter.repeat(64),
      evaluatedAt: expiredOpenedAt,
      decision: 'NO_ALERT_CANDIDATES',
      candidateCount: 0,
      openCandidateCount: 0,
      suppressedCandidateCount: 0,
      decisionsJson: [],
      expiresAt: expiredAt,
    })),
  });
  const cleanupResult = await alertState.cleanupExpired(cleanupNow);
  report.retention.expiredAlertStatesRemoved = cleanupResult.expiredAlertStates;
  report.retention.expiredEvaluationAuditsRemoved =
    cleanupResult.expiredEvaluationAudits;
  report.retention.currentAlertStatesPreserved =
    await sourcePrisma.authOperationalAlertState.count();
  report.retention.currentEvaluationAuditsPreserved =
    await sourcePrisma.authOperationalAlertEvaluationAudit.count();
  report.retention.exactCleanupVerified =
    cleanupResult.expiredAlertStates === 2 &&
    cleanupResult.expiredEvaluationAudits === 2 &&
    report.retention.currentAlertStatesPreserved === 4 &&
    report.retention.currentEvaluationAuditsPreserved === responses.length + 1;
  if (!report.retention.exactCleanupVerified) {
    throw new Error(
      'Alert-state/audit cleanup did not delete exactly expired rows',
    );
  }

  await sourcePrisma.$disconnect();
  sourcePrisma = undefined;
  await adminPrisma.$executeRawUnsafe(
    `ALTER DATABASE "${databaseName}" WITH ALLOW_CONNECTIONS false`,
  );
  sourceConnectionsDisabled = true;
  await adminPrisma.$queryRawUnsafe(
    `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${databaseName}' AND pid <> pg_backend_pid()`,
  );

  const outagePrisma = createPrisma(sourceUrl);
  const outageState = new PrismaAuthOperationalAlertState(outagePrisma);
  const outageControl = new PrismaAuthOperationalControl(outagePrisma, {
    keySecret,
  });
  report.outage.stateProviderFailedClosed = await rejectsWithName(
    () =>
      outageState.evaluate({
        correlationId: `auth-alert-evaluation:${randomUUID()}`,
        evaluatedAt: new Date(),
        candidates: [],
      }),
    'AuthOperationalAlertStateUnavailableError',
  );
  report.outage.auditProviderFailedClosed = await rejectsWithName(
    () =>
      outageState.evaluate({
        correlationId: `auth-alert-evaluation:${randomUUID()}`,
        evaluatedAt: new Date(),
        candidates: [],
      }),
    'AuthOperationalAlertStateUnavailableError',
  );
  report.outage.snapshotProviderFailedClosed = await rejectsWithName(
    () =>
      outageControl.snapshot({
        now: new Date(),
        windowMs: report.rollingWindow.requestedWindowMs,
      }),
    'AuthOperationalControlUnavailableError',
  );
  await outagePrisma.$disconnect().catch(() => undefined);
  const outageInspection = await requestJson(
    `${baseA}/v1/auth/operational-alerts`,
    { token: login.body.accessToken, expectedStatus: 503 },
  );
  report.outage.inspectionHttpStatus = outageInspection.status;
  report.outage.inspectionFailedClosed = outageInspection.status === 503;
  const outageCorrelationLookup = await requestJson(
    `${baseA}/v1/auth/operational-alert-audits/${encodeURIComponent(lookupCorrelationId)}`,
    { token: login.body.accessToken, expectedStatus: 503 },
  );
  report.outage.auditCorrelationLookupHttpStatus =
    outageCorrelationLookup.status;
  const outageIncidentQuery = new URLSearchParams({
    windowStartedAt: auditReadWindowStartedAt.toISOString(),
    windowEndedAt: auditReadWindowEndedAt.toISOString(),
  });
  const outageIncidentExport = await requestJson(
    `${baseA}/v1/auth/operational-alert-audits/incident-export?${outageIncidentQuery.toString()}`,
    { token: login.body.accessToken, expectedStatus: 503 },
  );
  report.outage.auditIncidentExportHttpStatus = outageIncidentExport.status;
  report.outage.auditReadModelFailedClosed =
    outageCorrelationLookup.status === 503 &&
    outageIncidentExport.status === 503;
  if (
    !report.outage.stateProviderFailedClosed ||
    !report.outage.auditProviderFailedClosed ||
    !report.outage.snapshotProviderFailedClosed ||
    !report.outage.inspectionFailedClosed ||
    !report.outage.auditReadModelFailedClosed
  ) {
    throw new Error('Alert state or snapshot outage did not fail closed');
  }
} catch (error) {
  harnessError = formatError(error);
} finally {
  if (sourceConnectionsDisabled && adminPrisma) {
    try {
      await adminPrisma.$executeRawUnsafe(
        `ALTER DATABASE "${databaseName}" WITH ALLOW_CONNECTIONS true`,
      );
      sourceConnectionsDisabled = false;
    } catch (error) {
      harnessError ??= formatError(error);
    }
  }

  await sourcePrisma?.$disconnect().catch(() => undefined);
  const stopResults = await Promise.allSettled(
    apiProcesses.map(stopApiProcess),
  );
  report.cleanup.apiProcessesStopped = stopResults.every(
    (result) => result.status === 'fulfilled' && result.value === true,
  );
  if (!report.cleanup.apiProcessesStopped) {
    harnessError ??= 'One or more disposable API processes did not stop';
  }

  if (adminPrisma) {
    try {
      await dropDatabase(adminPrisma, databaseName);
      const remaining = await adminPrisma.$queryRawUnsafe(
        `SELECT datname FROM pg_database WHERE datname = '${databaseName}'`,
      );
      report.database.randomDatabaseDropped = remaining.length === 0;
      report.cleanup.exactRandomDatabaseCleanupVerified =
        report.database.randomDatabaseDropped;
    } catch (error) {
      harnessError ??= formatError(error);
    }
    await adminPrisma.$disconnect().catch(() => undefined);
  }

  rmSync(temporaryRoot, { recursive: true, force: true });
  report.cleanup.temporaryDirectoryRemoved = !existsSync(temporaryRoot);
  try {
    rmdirSync(temporaryBase);
  } catch (error) {
    if (error?.code !== 'ENOTEMPTY' && error?.code !== 'ENOENT') {
      harnessError ??= formatError(error);
    }
  }
  report.status = harnessError ? 'FAIL' : 'PASS';
  report.failure = harnessError;
  report.generatedAt = new Date().toISOString();
  writeReports(report);
}

if (harnessError) {
  throw new Error(
    `Auth operational alert state disposable smoke failed: ${harnessError}`,
  );
}

process.stdout.write(
  `${JSON.stringify({
    status: report.status,
    processCount: report.twoProcessEvaluation.processCount,
    openCandidateSets: report.twoProcessEvaluation.openCandidateSetCount,
    cooldownSuppressedSets:
      report.twoProcessEvaluation.cooldownSuppressedSetCount,
    appendOnlyAuditRows: report.appendOnlyAudit.persistedResponseAuditRows,
    idempotentAudit: report.appendOnlyAudit.idempotentReplayVerified,
    auditReadModelRows: report.auditReadModel.incidentExportRowCount,
    auditReadModelPages: report.auditReadModel.incidentExportPageCount,
    auditReadModelDeterministic:
      report.auditReadModel.deterministicPaginationVerified,
    auditReadModelBoundedWindow: report.auditReadModel.boundedWindowVerified,
    auditReadModelRedacted: report.auditReadModel.redactionVerified,
    maxLockWaitMs: report.capacity.maxLockWaitMs,
    contentionCapacityWithinThreshold:
      report.capacity.withinLocalTechnicalThreshold,
    explicitRollingWindow: report.rollingWindow.explicitWindowVerified,
    stateOutageFailClosed: report.outage.stateProviderFailedClosed,
    auditOutageFailClosed: report.outage.auditProviderFailedClosed,
    auditReadModelOutageFailClosed: report.outage.auditReadModelFailedClosed,
    snapshotOutageFailClosed: report.outage.snapshotProviderFailedClosed,
    exactRetentionCleanup: report.retention.exactCleanupVerified,
    exactDatabaseCleanup: report.cleanup.exactRandomDatabaseCleanupVerified,
    productionReady: false,
  })}\n`,
);

function assertDisposableLocalScope(urlValue) {
  if (process.env.NODE_ENV?.trim().toLowerCase() === 'production') {
    throw new Error(
      'Disposable auth alert-state smoke refuses NODE_ENV=production',
    );
  }
  const url = new URL(urlValue);
  if (!['postgresql:', 'postgres:'].includes(url.protocol)) {
    throw new Error('Disposable auth alert-state smoke requires PostgreSQL');
  }
  if (!['localhost', '127.0.0.1', '::1'].includes(url.hostname)) {
    throw new Error(`Disposable smoke refuses non-local host ${url.hostname}`);
  }
  if (!url.username || !url.pathname.slice(1)) {
    throw new Error('Disposable smoke requires a local admin database URL');
  }
  return { hostname: url.hostname };
}

function databaseUrlForDatabase(baseUrlValue, targetDatabaseName) {
  const url = new URL(baseUrlValue);
  url.pathname = `/${targetDatabaseName}`;
  url.searchParams.delete('schema');
  url.searchParams.delete('options');
  return url.toString();
}

function createPrisma(url) {
  return new PrismaClient({ adapter: new PrismaPg(url) });
}

async function holdSharedEvaluationLock(prisma) {
  let release;
  let resolveAcquired;
  let rejectAcquired;
  const acquired = new Promise((resolveReady, rejectReady) => {
    resolveAcquired = resolveReady;
    rejectAcquired = rejectReady;
  });
  const released = new Promise((resolveReleased) => {
    release = resolveReleased;
  });
  const completion = prisma
    .$transaction(
      async (tx) => {
        await tx.$queryRaw`
          SELECT pg_advisory_xact_lock(hashtextextended('auth-operational-alert-state:evaluate', 0)) IS NULL AS "locked"
        `;
        resolveAcquired();
        await released;
      },
      { timeout: 10_000 },
    )
    .catch((error) => {
      rejectAcquired(error);
      throw error;
    });
  await acquired;
  return { release, completion };
}

async function createDatabase(prisma, targetDatabaseName) {
  assertDisposableDatabaseName(targetDatabaseName);
  await prisma.$executeRawUnsafe(`CREATE DATABASE "${targetDatabaseName}"`);
}

async function dropDatabase(prisma, targetDatabaseName) {
  assertDisposableDatabaseName(targetDatabaseName);
  await prisma.$executeRawUnsafe(
    `DROP DATABASE IF EXISTS "${targetDatabaseName}" WITH (FORCE)`,
  );
}

function assertDisposableDatabaseName(targetDatabaseName) {
  if (
    !/^auth_operational_alert_state_smoke_[a-f0-9_]+$/.test(targetDatabaseName)
  ) {
    throw new Error(`Unsafe disposable database name ${targetDatabaseName}`);
  }
}

async function runPrisma(args, databaseUrl) {
  await execFileAsync(
    process.execPath,
    [join(apiRoot, 'node_modules/prisma/build/index.js'), ...args],
    {
      cwd: apiRoot,
      env: { ...process.env, DATABASE_URL: databaseUrl },
      windowsHide: true,
      maxBuffer: 10 * 1024 * 1024,
    },
  );
}

async function seedSyntheticAdmin(databaseUrl) {
  const prisma = createPrisma(databaseUrl);
  await prisma.$connect();
  try {
    const salt = randomUUID();
    const passwordHash = `${salt}:${scryptSync(syntheticPassword, salt, 64).toString('hex')}`;
    const role = await prisma.role.create({
      data: {
        id: `auth-alert-state-admin-role-${runId}`,
        name: 'ADMIN',
        description: 'Disposable localhost auth alert-state smoke role',
      },
    });
    await prisma.user.create({
      data: {
        id: syntheticUserId,
        email: syntheticEmail,
        passwordHash,
        status: 'ACTIVE',
        profile: {
          create: { displayName: 'Disposable Auth Alert State Smoke' },
        },
        roles: { create: { roleId: role.id } },
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function findOpenPort() {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      server.close((error) => (error ? reject(error) : resolvePort(port)));
    });
  });
}

function spawnApiProcess(name, port, databaseUrl) {
  const output = createWriteStream(join(apiLogRoot, `${name}.stdout.log`));
  const errors = createWriteStream(join(apiLogRoot, `${name}.stderr.log`));
  const child = spawn(process.execPath, ['dist/src/main.js'], {
    cwd: apiRoot,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      DATABASE_URL: databaseUrl,
      AUTH_SESSION_STORE_PROVIDER: 'prisma',
      AUTH_OPERATIONAL_CONTROL_PROVIDER: 'prisma',
      AUTH_OPERATIONAL_CONTROL_KEY_SECRET: keySecret,
      AUTH_OPERATIONAL_ALERT_STATE_PROVIDER: 'prisma',
      JWT_SECRET: jwtSecret,
      API_PORT: String(port),
      LOCAL_DEMO_ROUTES_ENABLED: 'false',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  child.stdout.pipe(output);
  child.stderr.pipe(errors);
  return { name, port, child, output, errors };
}

async function stopApiProcess(processRecord) {
  const { child, output, errors } = processRecord;
  if (child.exitCode === null && !child.killed) {
    child.kill();
    await Promise.race([
      new Promise((resolveExit) => child.once('exit', resolveExit)),
      new Promise((resolveTimeout) => setTimeout(resolveTimeout, 5_000)),
    ]);
  }
  if (child.exitCode === null && process.platform === 'win32') {
    await execFileAsync(
      'taskkill.exe',
      ['/PID', String(child.pid), '/T', '/F'],
      { windowsHide: true },
    ).catch(() => undefined);
  }
  output.end();
  errors.end();
  return child.exitCode !== null || child.killed;
}

async function waitForApi(baseUrl, processRecord) {
  let lastError;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (processRecord.child.exitCode !== null) {
      throw new Error(
        `${processRecord.name} exited before readiness with code ${processRecord.child.exitCode}`,
      );
    }
    try {
      const response = await fetch(`${baseUrl}/v1/health`);
      if (response.ok) return;
      lastError = new Error(`health returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 250));
  }
  throw new Error(
    `API did not become ready: ${lastError?.message ?? 'timeout'}`,
  );
}

async function requestJson(url, options = {}) {
  const startedAt = performance.now();
  const headers = { 'content-type': 'application/json' };
  if (options.token) headers.authorization = `Bearer ${options.token}`;
  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const body = await response.json().catch(() => ({}));
  if (response.status !== options.expectedStatus) {
    throw new Error(
      `Unexpected HTTP status for ${new URL(url).pathname}: expected ${options.expectedStatus}, got ${response.status}`,
    );
  }
  return {
    status: response.status,
    body,
    durationMs: performance.now() - startedAt,
  };
}

async function rejectsWithName(task, expectedName) {
  try {
    await task();
    return false;
  } catch (error) {
    return error?.name === expectedName;
  }
}

async function rejects(task) {
  try {
    await task();
    return false;
  } catch {
    return true;
  }
}

function formatError(error) {
  if (!(error instanceof Error)) return String(error);
  const causes = [];
  let current = error;
  while (current instanceof Error) {
    causes.push(current.message);
    current = current.cause;
  }
  return causes.join(' <- ');
}

function writeReports(value) {
  mkdirSync(exportsDir, { recursive: true });
  writeFileSync(reportJsonPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  writeFileSync(reportMarkdownPath, renderMarkdown(value), 'utf8');
}

function renderMarkdown(value) {
  return (
    '# Shared Auth Operational Alert State Disposable Smoke\n\n' +
    `Generated: ${value.generatedAt}\n\n` +
    `- Status: **${value.status}**\n` +
    '- Scope: two independent Nest processes and one random localhost PostgreSQL database\n' +
    '- Production ready: **false**\n' +
    `- OPEN candidate sets: ${value.twoProcessEvaluation.openCandidateSetCount}\n` +
    `- Cooldown-suppressed candidate sets: ${value.twoProcessEvaluation.cooldownSuppressedSetCount}\n` +
    `- Explicit rolling-window responses: ${value.rollingWindow.responseWindowCount}/${value.capacity.sampleCount}\n` +
    `- ADMIN read-only redaction verified: ${value.inspection.redactionVerified}\n` +
    `- Shared Prisma state rows: ${value.sharedState.persistedCurrentRows}\n` +
    `- Append-only response audit rows: ${value.appendOnlyAudit.persistedResponseAuditRows}\n` +
    `- Unique redacted correlation IDs: ${value.appendOnlyAudit.uniqueResponseCorrelationIds}\n` +
    `- Idempotent correlation replay verified: ${value.appendOnlyAudit.idempotentReplayVerified}\n` +
    `- Database update rejected: ${value.appendOnlyAudit.databaseUpdateRejected}\n` +
    `- Correlation conflict failed closed: ${value.appendOnlyAudit.correlationConflictFailedClosed}\n` +
    `- Audit correlation lookup verified: ${value.auditReadModel.correlationLookupVerified}\n` +
    `- Incident export pages/rows: ${value.auditReadModel.incidentExportPageCount}/${value.auditReadModel.incidentExportRowCount}\n` +
    `- Deterministic pagination verified: ${value.auditReadModel.deterministicPaginationVerified}\n` +
    `- Seven-day window bound verified: ${value.auditReadModel.boundedWindowVerified}\n` +
    `- Read-model redaction verified: ${value.auditReadModel.redactionVerified}\n` +
    `- Contention samples: ${value.capacity.sampleCount}\n` +
    `- Maximum lock wait (ms): ${value.capacity.maxLockWaitMs}\n` +
    `- P95 lock wait (ms): ${value.capacity.p95LockWaitMs}\n` +
    `- Local technical threshold (ms): ${value.capacity.localTechnicalThresholdMs}\n` +
    `- Contention capacity within threshold: ${value.capacity.withinLocalTechnicalThreshold}\n` +
    `- Expired state rows removed exactly: ${value.retention.expiredAlertStatesRemoved}\n` +
    `- Expired audit rows removed exactly: ${value.retention.expiredEvaluationAuditsRemoved}\n` +
    `- Current state rows preserved: ${value.retention.currentAlertStatesPreserved}\n` +
    `- Current audit rows preserved: ${value.retention.currentEvaluationAuditsPreserved}\n` +
    `- State/audit/snapshot outage failed closed: ${value.outage.stateProviderFailedClosed}/${value.outage.auditProviderFailedClosed}/${value.outage.snapshotProviderFailedClosed}\n` +
    `- Inspection outage HTTP status: ${value.outage.inspectionHttpStatus ?? 'n/a'}\n` +
    `- Audit lookup/export outage HTTP status: ${value.outage.auditCorrelationLookupHttpStatus ?? 'n/a'}/${value.outage.auditIncidentExportHttpStatus ?? 'n/a'}\n` +
    '- External alert/notification provider used: false\n' +
    '- Raw identity, rate key, credential, or token exported: false\n' +
    `- API processes stopped: ${value.cleanup.apiProcessesStopped}\n` +
    `- Exact random-database cleanup: ${value.cleanup.exactRandomDatabaseCleanupVerified}\n` +
    `- Temporary directory cleanup: ${value.cleanup.temporaryDirectoryRemoved}\n` +
    (value.failure ? `- Failure: ${value.failure}\n` : '')
  );
}
