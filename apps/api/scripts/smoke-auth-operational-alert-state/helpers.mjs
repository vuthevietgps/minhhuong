// Helpers for smoke-auth-operational-alert-state-disposable.mjs that do not
// depend on the smoke run state (database names, secrets, report).
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { createServer } from 'node:net';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';

const execFileAsync = promisify(execFile);

export function assertDisposableLocalScope(urlValue) {
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

export function databaseUrlForDatabase(baseUrlValue, targetDatabaseName) {
  const url = new URL(baseUrlValue);
  url.pathname = `/${targetDatabaseName}`;
  url.searchParams.delete('schema');
  url.searchParams.delete('options');
  return url.toString();
}

export function createPrisma(url) {
  return new PrismaClient({ adapter: new PrismaPg(url) });
}

export async function holdSharedEvaluationLock(prisma) {
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

export async function createDatabase(prisma, targetDatabaseName) {
  assertDisposableDatabaseName(targetDatabaseName);
  await prisma.$executeRawUnsafe(`CREATE DATABASE "${targetDatabaseName}"`);
}

export async function dropDatabase(prisma, targetDatabaseName) {
  assertDisposableDatabaseName(targetDatabaseName);
  await prisma.$executeRawUnsafe(
    `DROP DATABASE IF EXISTS "${targetDatabaseName}" WITH (FORCE)`,
  );
}

export function assertDisposableDatabaseName(targetDatabaseName) {
  if (
    !/^auth_operational_alert_state_smoke_[a-f0-9_]+$/.test(targetDatabaseName)
  ) {
    throw new Error(`Unsafe disposable database name ${targetDatabaseName}`);
  }
}

export async function findOpenPort() {
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

export async function stopApiProcess(processRecord) {
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

export async function waitForApi(baseUrl, processRecord) {
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

export async function requestJson(url, options = {}) {
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

export async function rejectsWithName(task, expectedName) {
  try {
    await task();
    return false;
  } catch (error) {
    return error?.name === expectedName;
  }
}

export async function rejects(task) {
  try {
    await task();
    return false;
  } catch {
    return true;
  }
}

export function formatError(error) {
  if (!(error instanceof Error)) return String(error);
  const causes = [];
  let current = error;
  while (current instanceof Error) {
    causes.push(current.message);
    current = current.cause;
  }
  return causes.join(' <- ');
}

export function renderMarkdown(value) {
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
