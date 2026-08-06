import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { createHash, randomUUID, scryptSync } from 'node:crypto';
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const scriptDir = dirname(fileURLToPath(import.meta.url));
const apiRoot = resolve(scriptDir, '..');
const repoRoot = resolve(apiRoot, '../..');
const exportsDir = join(repoRoot, 'exports');
config({ path: join(repoRoot, '.env') });
config({ path: join(apiRoot, '.env') });
const reportJsonPath = join(
  exportsDir,
  'learning-local-demo-auth-session-disposable-smoke-report.json',
);
const reportMarkdownPath = join(
  exportsDir,
  'learning-local-demo-auth-session-disposable-smoke-report.md',
);
const baseDatabaseUrl =
  process.env.AUTH_SESSION_SMOKE_BASE_DATABASE_URL ?? process.env.DATABASE_URL;
if (!baseDatabaseUrl) {
  throw new Error(
    'Set AUTH_SESSION_SMOKE_BASE_DATABASE_URL or DATABASE_URL to a localhost admin database; no credential fallback is embedded',
  );
}

const runId = randomUUID().replaceAll('-', '_');
const sourceDatabaseName = `auth_session_smoke_source_${runId}`;
const restoreDatabaseName = `auth_session_smoke_restore_${runId}`;
const temporaryRoot = join(repoRoot, '.runtime', 'auth-session-smoke', runId);
const backupPath = join(temporaryRoot, 'auth-session.backup');
const apiLogRoot = process.env.AUTH_SESSION_SMOKE_LOG_DIR ?? temporaryRoot;
const syntheticUserId = `auth-session-smoke-user-${runId}`;
const syntheticEmail = `auth-session-smoke-${runId}@example.test`;
const syntheticPassword = `LocalOnly-${randomUUID()}-A1!`;
const jwtSecret = `local-smoke-jwt-${randomUUID()}-${randomUUID()}`;

const report = {
  schemaVersion: 'minh_huong.auth_session_disposable_smoke.v1',
  generatedAt: new Date().toISOString(),
  scope: 'disposable_localhost_only',
  status: 'FAIL',
  productionReady: false,
  productionEnabled: false,
  databases: {
    source: sourceDatabaseName,
    restore: restoreDatabaseName,
    host: undefined,
    sourceDropped: false,
    restoreDropped: false,
  },
  twoProcessApi: {
    processCount: 2,
    preRevocationAccessStatus: undefined,
    replayDenialStatus: undefined,
    postRevocationAccessStatus: undefined,
    sharedRevocationVerified: false,
  },
  repositoryOutage: {
    protectedRequestStatus: undefined,
    failClosedVerified: false,
  },
  backupRestore: {
    backupFormat: 'pg_dump_custom',
    backupWindowMs: undefined,
    observedLocalRpoMs: undefined,
    restoreAndValidationRtoMs: undefined,
    sourceDigest: undefined,
    restoredDigest: undefined,
    rowCounts: undefined,
    hashOnlyRefreshPersistenceVerified: false,
    auditRowsRestored: false,
    integrityVerified: false,
    temporaryBackupRemoved: false,
  },
  cleanup: {
    exactRandomDatabaseCleanupVerified: false,
    temporaryDirectoryRemoved: false,
  },
  safety: {
    productionDatabaseUsed: false,
    stagingDatabaseUsed: false,
    realAccountUsed: false,
    rawTokenExported: false,
    providerApiUsed: false,
    paymentRefundPayoutMutationUsed: false,
  },
  failure: undefined,
};

const apiProcesses = [];
let adminPrisma;
let sourceConnectionsDisabled = false;
let harnessError;

try {
  const safety = assertDisposableLocalScope(baseDatabaseUrl);
  report.databases.host = safety.hostname;
  mkdirSync(temporaryRoot, { recursive: true });
  mkdirSync(apiLogRoot, { recursive: true });

  const adminUrl = databaseUrlForDatabase(baseDatabaseUrl, 'postgres');
  adminPrisma = createPrisma(adminUrl);
  await adminPrisma.$connect();
  await createDatabase(adminPrisma, sourceDatabaseName);

  const sourceUrl = databaseUrlForDatabase(baseDatabaseUrl, sourceDatabaseName);
  await runPrisma(
    ['migrate', 'deploy', '--schema', 'prisma/schema.prisma'],
    sourceUrl,
  );
  await seedSyntheticAdmin(sourceUrl);

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

  const preRevocation = await requestJson(`${baseB}/v1/me/admin-surface`, {
    token: login.body.accessToken,
    expectedStatus: 200,
  });
  report.twoProcessApi.preRevocationAccessStatus = preRevocation.status;

  await requestJson(`${baseA}/v1/auth/refresh`, {
    method: 'POST',
    body: { refreshToken: login.body.refreshToken },
    expectedStatus: 201,
  });
  const replay = await requestJson(`${baseA}/v1/auth/refresh`, {
    method: 'POST',
    body: { refreshToken: login.body.refreshToken },
    expectedStatus: 401,
  });
  report.twoProcessApi.replayDenialStatus = replay.status;

  const postRevocation = await requestJson(`${baseB}/v1/me/admin-surface`, {
    token: login.body.accessToken,
    expectedStatus: 401,
  });
  report.twoProcessApi.postRevocationAccessStatus = postRevocation.status;
  report.twoProcessApi.sharedRevocationVerified = true;

  const sourceSnapshot = await readAuthSnapshot(sourceUrl);
  assertSourceSnapshot(sourceSnapshot, login.body.refreshToken);
  const sourceDigest = digestSnapshot(sourceSnapshot);
  const latestAuditAt = Math.max(
    ...sourceSnapshot.auditEvents.map((event) =>
      new Date(event.createdAt).getTime(),
    ),
  );

  const backupStartedAt = Date.now();
  await runPgTool(
    'pg_dump',
    ['--format=custom', '--no-owner', '--no-privileges', '--file', backupPath],
    sourceDatabaseName,
  );
  const backupCompletedAt = Date.now();

  await createDatabase(adminPrisma, restoreDatabaseName);
  const restoreStartedAt = Date.now();
  await runPgTool(
    'pg_restore',
    [
      '--exit-on-error',
      '--no-owner',
      '--no-privileges',
      '--dbname',
      restoreDatabaseName,
      backupPath,
    ],
    undefined,
  );
  const restoreUrl = databaseUrlForDatabase(
    baseDatabaseUrl,
    restoreDatabaseName,
  );
  const restoredSnapshot = await readAuthSnapshot(restoreUrl);
  const restoredDigest = digestSnapshot(restoredSnapshot);
  const restoreValidatedAt = Date.now();

  if (restoredDigest !== sourceDigest) {
    throw new Error(
      'Restored auth-session rows do not match the source snapshot',
    );
  }

  report.backupRestore.backupWindowMs = backupCompletedAt - backupStartedAt;
  report.backupRestore.observedLocalRpoMs = Math.max(
    0,
    backupCompletedAt - latestAuditAt,
  );
  report.backupRestore.restoreAndValidationRtoMs =
    restoreValidatedAt - restoreStartedAt;
  report.backupRestore.sourceDigest = sourceDigest;
  report.backupRestore.restoredDigest = restoredDigest;
  report.backupRestore.rowCounts = {
    sessions: sourceSnapshot.sessions.length,
    refreshTokens: sourceSnapshot.refreshTokens.length,
    auditEvents: sourceSnapshot.auditEvents.length,
  };
  report.backupRestore.hashOnlyRefreshPersistenceVerified = true;
  report.backupRestore.auditRowsRestored =
    restoredSnapshot.auditEvents.length === sourceSnapshot.auditEvents.length &&
    restoredSnapshot.auditEvents.length > 0;
  report.backupRestore.integrityVerified = true;

  await adminPrisma.$executeRawUnsafe(
    `ALTER DATABASE "${sourceDatabaseName}" WITH ALLOW_CONNECTIONS false`,
  );
  sourceConnectionsDisabled = true;
  await adminPrisma.$queryRawUnsafe(
    `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${sourceDatabaseName}' AND pid <> pg_backend_pid()`,
  );
  const outage = await requestJson(`${baseB}/v1/me/admin-surface`, {
    token: login.body.accessToken,
    expectedStatus: 503,
  });
  report.repositoryOutage.protectedRequestStatus = outage.status;
  report.repositoryOutage.failClosedVerified = true;
} catch (error) {
  harnessError = error instanceof Error ? error.message : String(error);
} finally {
  if (sourceConnectionsDisabled && adminPrisma) {
    try {
      await adminPrisma.$executeRawUnsafe(
        `ALTER DATABASE "${sourceDatabaseName}" WITH ALLOW_CONNECTIONS true`,
      );
      sourceConnectionsDisabled = false;
    } catch (error) {
      harnessError ??=
        error instanceof Error
          ? error.message
          : 'Failed to re-enable source database';
    }
  }

  await Promise.allSettled(apiProcesses.map(stopApiProcess));

  if (adminPrisma) {
    try {
      await dropDatabase(adminPrisma, sourceDatabaseName);
      await dropDatabase(adminPrisma, restoreDatabaseName);
      const remaining = await adminPrisma.$queryRawUnsafe(
        `SELECT datname FROM pg_database WHERE datname IN ('${sourceDatabaseName}', '${restoreDatabaseName}')`,
      );
      report.databases.sourceDropped = !remaining.some(
        (row) => row.datname === sourceDatabaseName,
      );
      report.databases.restoreDropped = !remaining.some(
        (row) => row.datname === restoreDatabaseName,
      );
      report.cleanup.exactRandomDatabaseCleanupVerified =
        remaining.length === 0;
    } catch (error) {
      harnessError ??=
        error instanceof Error ? error.message : 'Database cleanup failed';
    }
    await adminPrisma.$disconnect().catch(() => undefined);
  }

  rmSync(temporaryRoot, { recursive: true, force: true });
  report.backupRestore.temporaryBackupRemoved = !existsSync(backupPath);
  report.cleanup.temporaryDirectoryRemoved = !existsSync(temporaryRoot);
  report.status = harnessError ? 'FAIL' : 'PASS';
  report.failure = harnessError;
  report.generatedAt = new Date().toISOString();
  writeReports(report);
}

if (harnessError) {
  throw new Error(`Auth-session disposable smoke failed: ${harnessError}`);
}

process.stdout.write(
  `${JSON.stringify({
    status: report.status,
    processCount: report.twoProcessApi.processCount,
    sharedRevocationVerified: report.twoProcessApi.sharedRevocationVerified,
    outageFailClosedVerified: report.repositoryOutage.failClosedVerified,
    backupWindowMs: report.backupRestore.backupWindowMs,
    observedLocalRpoMs: report.backupRestore.observedLocalRpoMs,
    restoreAndValidationRtoMs: report.backupRestore.restoreAndValidationRtoMs,
    integrityVerified: report.backupRestore.integrityVerified,
    cleanupVerified:
      report.cleanup.exactRandomDatabaseCleanupVerified &&
      report.cleanup.temporaryDirectoryRemoved,
    productionReady: false,
  })}\n`,
);

function assertDisposableLocalScope(urlValue) {
  if (process.env.NODE_ENV?.trim().toLowerCase() === 'production') {
    throw new Error(
      'Disposable auth-session smoke refuses NODE_ENV=production',
    );
  }

  const url = new URL(urlValue);
  if (!['postgresql:', 'postgres:'].includes(url.protocol)) {
    throw new Error('Disposable auth-session smoke requires PostgreSQL');
  }
  if (!['localhost', '127.0.0.1', '::1'].includes(url.hostname)) {
    throw new Error(
      `Disposable auth-session smoke refuses non-local host ${url.hostname}`,
    );
  }
  if (!url.username || !url.pathname.slice(1)) {
    throw new Error('Disposable auth-session smoke requires a local admin URL');
  }
  return { hostname: url.hostname };
}

function databaseUrlForDatabase(baseUrlValue, databaseName) {
  const url = new URL(baseUrlValue);
  url.pathname = `/${databaseName}`;
  url.searchParams.delete('schema');
  url.searchParams.delete('options');
  return url.toString();
}

function createPrisma(url) {
  return new PrismaClient({ adapter: new PrismaPg(url) });
}

async function createDatabase(prisma, databaseName) {
  assertDisposableDatabaseName(databaseName);
  await prisma.$executeRawUnsafe(`CREATE DATABASE "${databaseName}"`);
}

async function dropDatabase(prisma, databaseName) {
  assertDisposableDatabaseName(databaseName);
  await prisma.$executeRawUnsafe(
    `DROP DATABASE IF EXISTS "${databaseName}" WITH (FORCE)`,
  );
}

function assertDisposableDatabaseName(databaseName) {
  if (!/^auth_session_smoke_(source|restore)_[a-f0-9_]+$/.test(databaseName)) {
    throw new Error(`Unsafe disposable database name ${databaseName}`);
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
        id: `auth-session-smoke-admin-role-${runId}`,
        name: 'ADMIN',
        description: 'Disposable localhost auth-session smoke role',
      },
    });
    await prisma.user.create({
      data: {
        id: syntheticUserId,
        email: syntheticEmail,
        passwordHash,
        status: 'ACTIVE',
        profile: {
          create: { displayName: 'Disposable Auth Session Smoke' },
        },
        roles: {
          create: { roleId: role.id },
        },
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
      AUTH_OPERATIONAL_CONTROL_PROVIDER: 'fixture',
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
      {
        windowsHide: true,
      },
    ).catch(() => undefined);
  }
  output.end();
  errors.end();
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

async function requestJson(url, options = {}) {
  const headers = { 'content-type': 'application/json' };
  if (options.token) {
    headers.authorization = `Bearer ${options.token}`;
  }
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
  return { status: response.status, body };
}

async function readAuthSnapshot(databaseUrl) {
  const prisma = createPrisma(databaseUrl);
  await prisma.$connect();
  try {
    const [sessions, refreshTokens, auditEvents] = await Promise.all([
      prisma.authSession.findMany({ orderBy: { id: 'asc' } }),
      prisma.authRefreshToken.findMany({ orderBy: { id: 'asc' } }),
      prisma.authSessionAuditEvent.findMany({
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      }),
    ]);
    return {
      sessions: sessions.map(normalizePrismaRow),
      refreshTokens: refreshTokens.map(normalizePrismaRow),
      auditEvents: auditEvents.map(normalizePrismaRow),
    };
  } finally {
    await prisma.$disconnect();
  }
}

function normalizePrismaRow(row) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key,
      value instanceof Date ? value.toISOString() : value,
    ]),
  );
}

function assertSourceSnapshot(snapshot, rawRefreshToken) {
  if (
    snapshot.sessions.length !== 1 ||
    snapshot.sessions[0].state !== 'REVOKED'
  ) {
    throw new Error('Source snapshot does not contain one revoked session');
  }
  if (snapshot.refreshTokens.length !== 2) {
    throw new Error(
      'Source snapshot does not contain the refresh-token family',
    );
  }
  if (
    snapshot.refreshTokens.some(
      (token) =>
        !/^[a-f0-9]{64}$/.test(token.tokenHash) ||
        token.tokenHash.includes(rawRefreshToken) ||
        Object.values(token).includes(rawRefreshToken),
    )
  ) {
    throw new Error('Refresh persistence is not hash-only');
  }
  const tokenStates = snapshot.refreshTokens.map((token) => token.state).sort();
  if (JSON.stringify(tokenStates) !== JSON.stringify(['REUSED', 'REVOKED'])) {
    throw new Error('Refresh-token family does not reflect replay revocation');
  }
  const auditActions = new Set(
    snapshot.auditEvents.map((event) => event.action),
  );
  for (const required of [
    'SESSION_CREATED',
    'SESSION_REVOKED',
    'REFRESH_TOKEN_ISSUED',
    'REFRESH_TOKEN_ROTATED',
    'REFRESH_TOKEN_REUSE_DENIED',
  ]) {
    if (!auditActions.has(required)) {
      throw new Error(`Missing auth audit action ${required}`);
    }
  }
}

function digestSnapshot(snapshot) {
  return createHash('sha256').update(JSON.stringify(snapshot)).digest('hex');
}

async function runPgTool(toolName, args, databaseName) {
  const toolPath = resolvePgTool(toolName);
  const baseUrl = new URL(baseDatabaseUrl);
  const connectionArgs = [
    '--host',
    baseUrl.hostname,
    '--port',
    baseUrl.port || '5432',
    '--username',
    decodeURIComponent(baseUrl.username),
  ];
  if (databaseName) {
    connectionArgs.push('--dbname', databaseName);
  }
  await execFileAsync(toolPath, [...connectionArgs, ...args], {
    cwd: repoRoot,
    env: {
      ...process.env,
      PGPASSWORD: decodeURIComponent(baseUrl.password),
    },
    windowsHide: true,
    maxBuffer: 10 * 1024 * 1024,
  });
}

function resolvePgTool(toolName) {
  const executable =
    process.platform === 'win32' ? `${toolName}.exe` : toolName;
  const candidates = [
    process.env.AUTH_SESSION_SMOKE_PG_BIN
      ? join(process.env.AUTH_SESSION_SMOKE_PG_BIN, executable)
      : undefined,
    join(repoRoot, '.runtime', 'postgresql-17.10', 'pgsql', 'bin', executable),
    executable,
  ].filter(Boolean);
  return candidates.find((candidate) => existsSync(candidate)) ?? executable;
}

function writeReports(value) {
  mkdirSync(exportsDir, { recursive: true });
  writeFileSync(reportJsonPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  writeFileSync(reportMarkdownPath, renderMarkdown(value), 'utf8');
}

function renderMarkdown(value) {
  const counts = value.backupRestore.rowCounts ?? {
    sessions: 0,
    refreshTokens: 0,
    auditEvents: 0,
  };
  return (
    `# Auth Session Disposable Backup/Restore And Two-Process Smoke\n\n` +
    `Generated: ${value.generatedAt}\n\n` +
    `- Status: **${value.status}**\n` +
    `- Scope: disposable localhost PostgreSQL and synthetic account only\n` +
    `- Production ready: **false**\n` +
    `- Two API processes: ${value.twoProcessApi.processCount}\n` +
    `- Shared replay/session revocation: ${value.twoProcessApi.sharedRevocationVerified}\n` +
    `- Repository outage fail-closed (HTTP 503): ${value.repositoryOutage.failClosedVerified}\n` +
    `- Backup/restore integrity: ${value.backupRestore.integrityVerified}\n` +
    `- Auth rows restored: ${counts.sessions} session, ${counts.refreshTokens} token hashes, ${counts.auditEvents} audit events\n` +
    `- Raw token exported: false\n` +
    `- Backup window: ${value.backupRestore.backupWindowMs ?? 'n/a'} ms\n` +
    `- Observed local RPO: ${value.backupRestore.observedLocalRpoMs ?? 'n/a'} ms\n` +
    `- Restore plus validation RTO: ${value.backupRestore.restoreAndValidationRtoMs ?? 'n/a'} ms\n` +
    `- Exact random-database cleanup: ${value.cleanup.exactRandomDatabaseCleanupVerified}\n` +
    `- Temporary dump cleanup: ${value.backupRestore.temporaryBackupRemoved}\n` +
    (value.failure ? `- Failure: ${value.failure}\n` : '')
  );
}
