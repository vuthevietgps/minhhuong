import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { randomUUID } from 'node:crypto';
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  rmSync,
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
  'learning-local-demo-auth-operational-control-disposable-smoke-report.json',
);
const reportMarkdownPath = join(
  exportsDir,
  'learning-local-demo-auth-operational-control-disposable-smoke-report.md',
);
const baseDatabaseUrl =
  process.env.AUTH_OPERATIONAL_CONTROL_SMOKE_BASE_DATABASE_URL ??
  process.env.DATABASE_URL;
if (!baseDatabaseUrl) {
  throw new Error(
    'Set AUTH_OPERATIONAL_CONTROL_SMOKE_BASE_DATABASE_URL or DATABASE_URL to a localhost admin database; no credential fallback is embedded',
  );
}

const runId = randomUUID().replaceAll('-', '_');
const databaseName = `auth_operational_control_smoke_${runId}`;
const temporaryRoot = join(
  repoRoot,
  '.runtime',
  'auth-operational-control-smoke',
  runId,
);
const apiLogRoot =
  process.env.AUTH_OPERATIONAL_CONTROL_SMOKE_LOG_DIR ?? temporaryRoot;
const keySecret = `local-auth-control-${randomUUID()}-${randomUUID()}`;
const jwtSecret = `local-auth-control-jwt-${randomUUID()}-${randomUUID()}`;

const report = {
  schemaVersion: 'minh_huong.auth_operational_control_disposable_smoke.v1',
  generatedAt: new Date().toISOString(),
  scope: 'disposable_localhost_only',
  status: 'FAIL',
  productionReady: false,
  productionEnabled: false,
  database: {
    name: databaseName,
    host: undefined,
    randomDatabaseCreated: false,
    randomDatabaseDropped: false,
  },
  twoProcessAtomicRateLimit: {
    processCount: 2,
    loginConcurrentRequests: 12,
    loginDeniedStatuses: 0,
    loginThrottledStatuses: 0,
    loginAdmissionLimit: 5,
    refreshConcurrentRequests: 16,
    refreshDeniedStatuses: 0,
    refreshThrottledStatuses: 0,
    refreshAdmissionLimit: 10,
    atomicLimitVerified: false,
  },
  sharedCounters: {
    expected: {
      LOGIN_ATTEMPT: 5,
      LOGIN_DENIED: 5,
      LOGIN_THROTTLED: 7,
      REFRESH_ATTEMPT: 10,
      REFRESH_DENIED: 10,
      REFRESH_THROTTLED: 6,
    },
    observed: {},
    crossProcessAggregationVerified: false,
  },
  retention: {
    metricRetentionMsUnderTest: 60_000,
    expiredRateLimitAttemptsRemoved: 0,
    expiredMetricBucketsRemoved: 0,
    currentRowsPreserved: false,
    cleanupVerified: false,
  },
  outage: {
    loginStatus: undefined,
    failClosedVerified: false,
  },
  keyProtection: {
    algorithm: 'HMAC_SHA256',
    persistedKeysAreOpaqueHex: false,
    rawRateKeysExported: false,
    rawTokensExported: false,
  },
  cleanup: {
    apiProcessesStopped: false,
    temporaryDirectoryRemoved: false,
    exactRandomDatabaseCleanupVerified: false,
  },
  safety: {
    productionDatabaseUsed: false,
    stagingDatabaseUsed: false,
    realIdentityUsed: false,
    externalProviderUsed: false,
    paymentRefundPayoutMutationUsed: false,
    liveNotificationUsed: false,
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
    ['migrate', 'deploy', '--schema', 'prisma'],
    sourceUrl,
  );
  sourcePrisma = createPrisma(sourceUrl);
  await sourcePrisma.$connect();

  const { PrismaAuthOperationalControl } = require(
    join(apiRoot, 'dist/src/auth/prisma-auth-operational-control.js'),
  );
  const retentionControl = new PrismaAuthOperationalControl(sourcePrisma, {
    keySecret,
    metricRetentionMs: 60_000,
    metricBucketMs: 60_000,
    policies: {
      LOGIN: { maxAttempts: 1, windowMs: 60_000 },
    },
  });
  const cleanupNow = new Date();
  const expiredAt = new Date(cleanupNow.getTime() - 2 * 60_000);
  await retentionControl.assertRateLimit({
    surface: 'LOGIN',
    key: `retention-${runId}@example.test`,
    now: expiredAt,
  });
  await retentionControl.record({
    kind: 'SESSION_CLEANUP_RUN',
    occurredAt: expiredAt,
  });
  const retentionCleanup = await retentionControl.cleanupExpired(cleanupNow);
  report.retention.expiredRateLimitAttemptsRemoved =
    retentionCleanup.expiredRateLimitAttempts;
  report.retention.expiredMetricBucketsRemoved =
    retentionCleanup.expiredMetricBuckets;
  if (
    retentionCleanup.expiredRateLimitAttempts !== 1 ||
    retentionCleanup.expiredMetricBuckets !== 2
  ) {
    throw new Error('Retention cleanup did not remove the exact expired rows');
  }

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

  const bases = [`http://127.0.0.1:${portA}`, `http://127.0.0.1:${portB}`];
  const loginStatuses = await Promise.all(
    Array.from({ length: 12 }, (_, index) =>
      requestStatus(`${bases[index % 2]}/v1/auth/login`, {
        email: `shared-login-${runId}@example.test`,
        password: 'Synthetic-Wrong-Password-01!',
      }),
    ),
  );
  report.twoProcessAtomicRateLimit.loginDeniedStatuses = countStatus(
    loginStatuses,
    401,
  );
  report.twoProcessAtomicRateLimit.loginThrottledStatuses = countStatus(
    loginStatuses,
    429,
  );

  const refreshStatuses = await Promise.all(
    Array.from({ length: 16 }, (_, index) =>
      requestStatus(`${bases[index % 2]}/v1/auth/refresh`, {
        refreshToken: `synthetic-refresh-${runId}`,
      }),
    ),
  );
  report.twoProcessAtomicRateLimit.refreshDeniedStatuses = countStatus(
    refreshStatuses,
    401,
  );
  report.twoProcessAtomicRateLimit.refreshThrottledStatuses = countStatus(
    refreshStatuses,
    429,
  );

  const atomicLimitVerified =
    report.twoProcessAtomicRateLimit.loginDeniedStatuses === 5 &&
    report.twoProcessAtomicRateLimit.loginThrottledStatuses === 7 &&
    report.twoProcessAtomicRateLimit.refreshDeniedStatuses === 10 &&
    report.twoProcessAtomicRateLimit.refreshThrottledStatuses === 6;
  if (!atomicLimitVerified) {
    throw new Error(
      `Atomic admission mismatch: login=${loginStatuses.join(',')}; refresh=${refreshStatuses.join(',')}`,
    );
  }
  report.twoProcessAtomicRateLimit.atomicLimitVerified = true;

  const sharedControl = new PrismaAuthOperationalControl(sourcePrisma, {
    keySecret,
  });
  const snapshot = await sharedControl.snapshot();
  const observedCounters = Object.fromEntries(
    snapshot.counters.map((counter) => [counter.kind, counter.count]),
  );
  report.sharedCounters.observed = Object.fromEntries(
    Object.keys(report.sharedCounters.expected).map((kind) => [
      kind,
      observedCounters[kind] ?? 0,
    ]),
  );
  if (
    JSON.stringify(report.sharedCounters.observed) !==
      JSON.stringify(report.sharedCounters.expected) ||
    snapshot.safety.sharedStore !== true ||
    snapshot.safety.rateLimitKeyProtection !== 'HMAC_SHA256'
  ) {
    throw new Error('Shared auth operational counters do not match requests');
  }
  report.sharedCounters.crossProcessAggregationVerified = true;

  const persistedAttempts = await sourcePrisma.authRateLimitAttempt.findMany({
    select: { keyHash: true },
  });
  report.keyProtection.persistedKeysAreOpaqueHex =
    persistedAttempts.length === 15 &&
    persistedAttempts.every((attempt) =>
      /^[a-f0-9]{64}$/.test(attempt.keyHash),
    );
  if (!report.keyProtection.persistedKeysAreOpaqueHex) {
    throw new Error('Persisted rate-limit keys are not HMAC-SHA256 values');
  }

  const currentRowsBeforeCleanup = {
    attempts: await sourcePrisma.authRateLimitAttempt.count(),
    metrics: await sourcePrisma.authOperationalMetricBucket.count(),
  };
  const currentCleanup = await sharedControl.cleanupExpired(new Date());
  const currentRowsAfterCleanup = {
    attempts: await sourcePrisma.authRateLimitAttempt.count(),
    metrics: await sourcePrisma.authOperationalMetricBucket.count(),
  };
  report.retention.currentRowsPreserved =
    currentCleanup.expiredRateLimitAttempts === 0 &&
    currentCleanup.expiredMetricBuckets === 0 &&
    JSON.stringify(currentRowsBeforeCleanup) ===
      JSON.stringify(currentRowsAfterCleanup);
  report.retention.cleanupVerified =
    report.retention.expiredRateLimitAttemptsRemoved === 1 &&
    report.retention.expiredMetricBucketsRemoved === 2 &&
    report.retention.currentRowsPreserved;
  if (!report.retention.cleanupVerified) {
    throw new Error('Retention cleanup removed current operational rows');
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
  const outageStatus = await requestStatus(`${bases[0]}/v1/auth/login`, {
    email: `outage-${runId}@example.test`,
    password: 'Synthetic-Wrong-Password-02!',
  });
  report.outage.loginStatus = outageStatus;
  report.outage.failClosedVerified = outageStatus === 503;
  if (!report.outage.failClosedVerified) {
    throw new Error(`Operational-control outage returned ${outageStatus}`);
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
      harnessError ??=
        error instanceof Error
          ? error.message
          : 'Failed to re-enable disposable database';
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
      harnessError ??=
        error instanceof Error ? error.message : 'Database cleanup failed';
    }
    await adminPrisma.$disconnect().catch(() => undefined);
  }

  rmSync(temporaryRoot, { recursive: true, force: true });
  report.cleanup.temporaryDirectoryRemoved = !existsSync(temporaryRoot);
  report.status = harnessError ? 'FAIL' : 'PASS';
  report.failure = harnessError;
  report.generatedAt = new Date().toISOString();
  writeReports(report);
}

if (harnessError) {
  throw new Error(
    `Auth operational control disposable smoke failed: ${harnessError}`,
  );
}

process.stdout.write(
  `${JSON.stringify({
    status: report.status,
    processCount: report.twoProcessAtomicRateLimit.processCount,
    loginDenied: report.twoProcessAtomicRateLimit.loginDeniedStatuses,
    loginThrottled: report.twoProcessAtomicRateLimit.loginThrottledStatuses,
    refreshDenied: report.twoProcessAtomicRateLimit.refreshDeniedStatuses,
    refreshThrottled: report.twoProcessAtomicRateLimit.refreshThrottledStatuses,
    sharedCounters: report.sharedCounters.crossProcessAggregationVerified,
    failClosedOutage: report.outage.failClosedVerified,
    retentionCleanup: report.retention.cleanupVerified,
    exactCleanup: report.cleanup.exactRandomDatabaseCleanupVerified,
    productionReady: false,
  })}\n`,
);

function assertDisposableLocalScope(urlValue) {
  if (process.env.NODE_ENV?.trim().toLowerCase() === 'production') {
    throw new Error(
      'Disposable auth operational control smoke refuses NODE_ENV=production',
    );
  }
  const url = new URL(urlValue);
  if (!['postgresql:', 'postgres:'].includes(url.protocol)) {
    throw new Error(
      'Disposable auth operational control smoke requires PostgreSQL',
    );
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
  if (!/^auth_operational_control_smoke_[a-f0-9_]+$/.test(targetDatabaseName)) {
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
      AUTH_SESSION_STORE_PROVIDER: 'fixture',
      AUTH_OPERATIONAL_CONTROL_PROVIDER: 'prisma',
      AUTH_OPERATIONAL_CONTROL_KEY_SECRET: keySecret,
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
      if (response.ok) {
        return;
      }
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

async function requestStatus(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  await response.arrayBuffer();
  return response.status;
}

function countStatus(statuses, expected) {
  return statuses.filter((status) => status === expected).length;
}

function formatError(error) {
  if (!(error instanceof Error)) {
    return String(error);
  }
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
    '# Shared Auth Operational Control Disposable Smoke\n\n' +
    `Generated: ${value.generatedAt}\n\n` +
    `- Status: **${value.status}**\n` +
    '- Scope: two local API processes and one random localhost PostgreSQL database\n' +
    '- Production ready: **false**\n' +
    `- Atomic login admission: ${value.twoProcessAtomicRateLimit.loginDeniedStatuses} denied + ${value.twoProcessAtomicRateLimit.loginThrottledStatuses} throttled across 12 concurrent requests\n` +
    `- Atomic refresh admission: ${value.twoProcessAtomicRateLimit.refreshDeniedStatuses} denied + ${value.twoProcessAtomicRateLimit.refreshThrottledStatuses} throttled across 16 concurrent requests\n` +
    `- Shared counters verified: ${value.sharedCounters.crossProcessAggregationVerified}\n` +
    `- Adapter outage failed closed with HTTP ${value.outage.loginStatus ?? 'n/a'}: ${value.outage.failClosedVerified}\n` +
    `- Expired attempts removed: ${value.retention.expiredRateLimitAttemptsRemoved}\n` +
    `- Expired metric buckets removed: ${value.retention.expiredMetricBucketsRemoved}\n` +
    `- Current operational rows preserved: ${value.retention.currentRowsPreserved}\n` +
    '- Persisted rate keys: HMAC-SHA256 only; raw keys/tokens exported: false\n' +
    `- API processes stopped: ${value.cleanup.apiProcessesStopped}\n` +
    `- Exact random-database cleanup: ${value.cleanup.exactRandomDatabaseCleanupVerified}\n` +
    `- Temporary directory cleanup: ${value.cleanup.temporaryDirectoryRemoved}\n` +
    (value.failure ? `- Failure: ${value.failure}\n` : '')
  );
}
