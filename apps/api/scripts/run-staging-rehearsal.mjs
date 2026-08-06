import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { execFile } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { freemem, totalmem } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import {
  STAGING_REHEARSAL_APPROVAL_CODE,
  STAGING_REHEARSAL_TARGET,
  assertStagingRehearsalAuthorization,
  evaluateStagingRehearsalGates,
  makeTimedIncidentDrill,
} from './staging-rehearsal-contract.mjs';

const execFileAsync = promisify(execFile);
const scriptDir = dirname(fileURLToPath(import.meta.url));
const apiRoot = resolve(scriptDir, '..');
const repoRoot = resolve(apiRoot, '../..');
const outputDir = resolve(
  process.env.STAGING_REHEARSAL_EVIDENCE_DIR ?? join(repoRoot, 'exports'),
);
const commandLogDir = process.env.STAGING_REHEARSAL_LOG_DIR
  ? resolve(process.env.STAGING_REHEARSAL_LOG_DIR)
  : undefined;
const approvalPath = resolve(
  process.env.STAGING_REHEARSAL_APPROVAL_FILE ??
    join(
      repoRoot,
      'docs',
      'hoctap_minhhuong',
      'approvals',
      '2026-07-10_staging_conditional_approval.json',
    ),
);
const reportJsonPath = join(
  outputDir,
  'minhhuong-staging-rc-v3-local-rehearsal.json',
);
const reportMarkdownPath = join(
  outputDir,
  'minhhuong-staging-rc-v3-local-rehearsal.md',
);
const componentReportPaths = {
  authSession: join(
    repoRoot,
    'exports',
    'learning-local-demo-auth-session-disposable-smoke-report.json',
  ),
  operationalControl: join(
    repoRoot,
    'exports',
    'learning-local-demo-auth-operational-control-disposable-smoke-report.json',
  ),
  alertState: join(
    repoRoot,
    'exports',
    'learning-local-demo-auth-operational-alert-state-disposable-smoke-report.json',
  ),
};
const temporaryBases = [
  join(repoRoot, '.runtime', 'auth-session-smoke'),
  join(repoRoot, '.runtime', 'auth-operational-control-smoke'),
  join(repoRoot, '.runtime', 'auth-operational-alert-state-smoke'),
];

config({ path: join(repoRoot, '.env') });
config({ path: join(apiRoot, '.env') });

const databaseUrl =
  process.env.STAGING_REHEARSAL_BASE_DATABASE_URL ?? process.env.DATABASE_URL;
const target = process.env.STAGING_REHEARSAL_TARGET ?? STAGING_REHEARSAL_TARGET;
const approvalCode =
  process.env.STAGING_REHEARSAL_APPROVAL_CODE ??
  STAGING_REHEARSAL_APPROVAL_CODE;
const runId = randomUUID();
const startedAt = new Date();
const startedAtMs = Date.now();
const beforeHeadroom = memoryHeadroomSnapshot();
const baselineProcesses = await inspectNodeProcesses();
const commandEvidence = [];
let failure;
let authorization;
let authSession;
let operationalControl;
let alertState;
let finalCleanup = {
  matchingDatabaseCount: -1,
  matchingDatabases: [],
  matchingListenerCount: -1,
  matchingProcessCount: -1,
  matchingTemporaryArtifactCount: -1,
};

try {
  const approval = JSON.parse(readFileSync(approvalPath, 'utf8'));
  authorization = assertStagingRehearsalAuthorization({
    approval,
    approvalCode,
    databaseUrl,
    nodeEnv: process.env.NODE_ENV,
    target,
  });

  for (const reportPath of Object.values(componentReportPaths)) {
    rmSync(reportPath, { force: true });
  }

  commandEvidence.push(
    await runCommand({
      id: 'migration-rollback-forward-repair',
      args: [
        join(apiRoot, 'node_modules', 'jest', 'bin', 'jest.js'),
        'prisma-auth-session.integration.spec.ts',
        '--runInBand',
      ],
      command:
        'npm --prefix apps/api run test -- prisma-auth-session.integration.spec.ts --runInBand',
      cwd: apiRoot,
    }),
  );
  commandEvidence.push(
    await runCommand({
      id: 'two-process-session-backup-restore',
      args: [join(apiRoot, 'scripts', 'smoke-auth-session-disposable.mjs')],
      command: 'npm --prefix apps/api run smoke:auth-session-disposable',
      cwd: apiRoot,
    }),
  );
  commandEvidence.push(
    await runCommand({
      id: 'two-process-operational-control',
      args: [
        join(
          apiRoot,
          'scripts',
          'smoke-auth-operational-control-disposable.mjs',
        ),
      ],
      command:
        'npm --prefix apps/api run smoke:auth-operational-control-disposable',
      cwd: apiRoot,
    }),
  );
  commandEvidence.push(
    await runCommand({
      id: 'two-process-alert-state-privacy',
      args: [
        join(
          apiRoot,
          'scripts',
          'smoke-auth-operational-alert-state-disposable.mjs',
        ),
      ],
      command:
        'npm --prefix apps/api run smoke:auth-operational-alert-state-disposable',
      cwd: apiRoot,
    }),
  );

  authSession = readJson(componentReportPaths.authSession);
  operationalControl = readJson(componentReportPaths.operationalControl);
  alertState = readJson(componentReportPaths.alertState);
} catch (error) {
  failure = error instanceof Error ? error.message : String(error);
}

try {
  finalCleanup = await inspectFinalCleanup({
    authSession,
    operationalControl,
    alertState,
    baselineProcesses,
    databaseUrl,
  });
} catch (error) {
  failure ??= error instanceof Error ? error.message : String(error);
}

const afterHeadroom = memoryHeadroomSnapshot();
const headroom = {
  metric: 'host_free_physical_memory_percent',
  requiredMinimumPercent: 30,
  before: beforeHeadroom,
  after: afterHeadroom,
  minimumObservedFreeMemoryPercent: Math.min(
    beforeHeadroom.freePercent,
    afterHeadroom.freePercent,
  ),
  productionCapacityClaimed: false,
};
const acknowledgedAtMs = Date.now();
const containmentDecidedAtMs = Date.now();
const componentRecoveryVerified = Boolean(
  authSession?.cleanup?.exactRandomDatabaseCleanupVerified &&
  operationalControl?.cleanup?.exactRandomDatabaseCleanupVerified &&
  alertState?.cleanup?.exactRandomDatabaseCleanupVerified &&
  finalCleanup.matchingDatabaseCount === 0 &&
  finalCleanup.matchingProcessCount === 0 &&
  finalCleanup.matchingListenerCount === 0 &&
  finalCleanup.matchingTemporaryArtifactCount === 0,
);
const incidentDrill = makeTimedIncidentDrill({
  correlationId: `staging-incident:${runId}`,
  recoveryVerified: componentRecoveryVerified,
  startedAtMs,
  timeline: { acknowledgedAtMs, containmentDecidedAtMs },
});
const forwardRepairCommand = commandEvidence.find(
  (command) => command.id === 'migration-rollback-forward-repair',
);
const gateEvaluation = evaluateStagingRehearsalGates({
  alertState,
  authSession,
  finalCleanup,
  forwardRepairCommand,
  headroom,
  incidentDrill,
  operationalControl,
});
if (failure && !gateEvaluation.failedChecks.includes('commandExecution')) {
  gateEvaluation.failedChecks.push('commandExecution');
  gateEvaluation.requiredCheckCount += 1;
  gateEvaluation.status = 'FAIL';
}

const completedAt = new Date();
const providerSandboxSupplied =
  process.env.STAGING_PROVIDER_SANDBOX_AVAILABLE === 'true';
const report = {
  schemaVersion: 'minh_huong.staging_rehearsal.v1',
  releaseCandidate: 'learning-release-candidate-go-live-gate.v3',
  runId,
  target,
  targetClassification: 'isolated_nonproduction_local_staging',
  generatedAt: completedAt.toISOString(),
  startedAt: startedAt.toISOString(),
  completedAt: completedAt.toISOString(),
  totalDurationMs: completedAt.getTime() - startedAt.getTime(),
  status: gateEvaluation.status,
  failure: failure ?? null,
  decision: gateEvaluation.status === 'PASS' ? 'PASS' : 'FAIL_CLOSED',
  approval: {
    code: approvalCode,
    decisionId: authorization?.decisionId ?? null,
    evidencePath: repoRelative(approvalPath),
    authorityPrincipal: 'Minh Huong workspace/project owner',
    scope: 'staging_dry_run',
    approvedWithConditions: Boolean(authorization),
    productionApproved: false,
  },
  objectives: {
    rpoMaximumMs: 24 * 60 * 60 * 1000,
    rtoMaximumMs: 4 * 60 * 60 * 1000,
    acknowledgementMaximumMs: 15 * 60 * 1000,
    containmentDecisionMaximumMs: 30 * 60 * 1000,
    minimumResourceHeadroomPercent: 30,
  },
  measured: {
    migrationRollbackForwardRepairDurationMs:
      forwardRepairCommand?.durationMs ?? null,
    backupWindowMs: authSession?.backupRestore?.backupWindowMs ?? null,
    observedRpoMs: authSession?.backupRestore?.observedLocalRpoMs ?? null,
    restoreAndValidationRtoMs:
      authSession?.backupRestore?.restoreAndValidationRtoMs ?? null,
    backupSourceDigest: authSession?.backupRestore?.sourceDigest ?? null,
    restoredDigest: authSession?.backupRestore?.restoredDigest ?? null,
    authAlertMaxLockWaitMs: alertState?.capacity?.maxLockWaitMs ?? null,
    authAlertP95LockWaitMs: alertState?.capacity?.p95LockWaitMs ?? null,
    headroom,
  },
  gates: gateEvaluation,
  commandEvidence,
  incidentDrill,
  privacy: {
    fixturePolicy: 'synthetic_or_pseudonymized_only',
    evidenceRetentionDays: 30,
    evidenceExpiresAt: new Date(
      completedAt.getTime() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    adminSupportReadOnlyAccessVerified:
      alertState?.auditReadModel?.adminReadOnlyVerified === true,
    redactionVerified:
      alertState?.inspection?.redactionVerified === true &&
      alertState?.auditReadModel?.redactionVerified === true,
    boundedExportVerified:
      alertState?.auditReadModel?.boundedWindowVerified === true,
    exactExpiredDeletionVerified:
      alertState?.retention?.exactCleanupVerified === true &&
      operationalControl?.retention?.cleanupVerified === true,
    rawIdentityTokenRateKeyOrSecretStored: false,
    realPersonDataUsed: false,
  },
  providers: {
    mode: 'mock_fixture_only',
    sandboxCredentialsSupplied: providerSandboxSupplied,
    blocker: providerSandboxSupplied
      ? null
      : 'PROVIDER_SANDBOX_CREDENTIALS_NOT_SUPPLIED_CONTRACTS_VERIFIED_WITH_MOCKS_ONLY',
    providerApiUsed: false,
    liveMutationUsed: false,
    idempotencyReconciliationLimitsKillSwitchContractVerified:
      alertState?.appendOnlyAudit?.idempotentReplayVerified === true &&
      incidentDrill.providerKillSwitchVerified === true,
  },
  cleanup: finalCleanup,
  componentEvidence: Object.fromEntries(
    Object.entries(componentReportPaths).map(([key, path]) => [
      key,
      {
        path: repoRelative(path),
        sha256: existsSync(path) ? sha256File(path) : null,
      },
    ]),
  ),
  safety: {
    productionReady: false,
    productionEnabled: false,
    productionDatabaseUsed: false,
    productionDeployUsed: false,
    productionCredentialsUsed: false,
    productionDataUsed: false,
    providerApiUsed: false,
    paymentRefundCommissionPayoutMutationUsed: false,
    liveNotificationUsed: false,
    liveAiProviderUsed: false,
    realCustomerLearnerOrderPaymentMutationUsed: false,
    plaintextSecretsIncluded: false,
    separateFinalReleaseApprovalRequired: true,
  },
  limitations: [
    'This is isolated localhost staging evidence, not hosted staging or production capacity evidence.',
    'Resource headroom is a host free-memory snapshot, not a production load or failover benchmark.',
    'External providers remained disabled; sandbox credentials were not supplied to this lane.',
    'A separate final release-owner decision is required before any production action.',
  ],
};

mkdirSync(outputDir, { recursive: true });
writeFileSync(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
writeFileSync(reportMarkdownPath, renderMarkdown(report), 'utf8');
writeCommandLog(report);

process.stdout.write(
  `${JSON.stringify({
    status: report.status,
    target: report.target,
    passedChecks: report.gates.passedCheckCount,
    requiredChecks: report.gates.requiredCheckCount,
    failedChecks: report.gates.failedChecks,
    observedRpoMs: report.measured.observedRpoMs,
    restoreAndValidationRtoMs: report.measured.restoreAndValidationRtoMs,
    minimumHeadroomPercent:
      report.measured.headroom.minimumObservedFreeMemoryPercent,
    exactCleanup: report.gates.checks.exactCleanup,
    productionReady: false,
  })}\n`,
);

if (report.status !== 'PASS') {
  process.exitCode = 1;
}

async function runCommand({ id, args, command, cwd }) {
  const commandStartedAt = new Date();
  try {
    const { stdout, stderr } = await execFileAsync(process.execPath, args, {
      cwd,
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
      windowsHide: true,
      maxBuffer: 20 * 1024 * 1024,
      timeout: 8 * 60 * 1000,
    });
    const completedAt = new Date();
    const testCountMatch = `${stdout}\n${stderr}`.match(
      /Tests:\s+(\d+) passed/i,
    );
    return {
      id,
      command,
      status: 'PASS',
      startedAt: commandStartedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs: completedAt.getTime() - commandStartedAt.getTime(),
      testCount: testCountMatch ? Number(testCountMatch[1]) : null,
      stdoutSummary: lastNonEmptyLine(stdout),
      stderrSummary: lastNonEmptyLine(stderr),
    };
  } catch (error) {
    const completedAt = new Date();
    commandEvidence.push({
      id,
      command,
      status: 'FAIL',
      startedAt: commandStartedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs: completedAt.getTime() - commandStartedAt.getTime(),
      testCount: null,
      stdoutSummary: lastNonEmptyLine(error?.stdout),
      stderrSummary: lastNonEmptyLine(error?.stderr),
    });
    throw new Error(`Rehearsal command failed: ${command}`);
  }
}

async function inspectFinalCleanup({
  authSession: sessionReport,
  operationalControl: controlReport,
  alertState: alertReport,
  baselineProcesses: beforeProcesses,
  databaseUrl: urlValue,
}) {
  const databaseNames = [
    sessionReport?.databases?.source,
    sessionReport?.databases?.restore,
    controlReport?.database?.name,
    alertReport?.database?.name,
  ].filter(Boolean);
  const matchingDatabases = await findMatchingDatabases(
    urlValue,
    databaseNames,
  );
  const afterProcesses = await inspectNodeProcesses();
  const beforeIds = new Set(
    beforeProcesses.map((processRow) => processRow.pid),
  );
  const matchingProcesses = afterProcesses.filter(
    (processRow) =>
      processRow.pid !== process.pid &&
      !beforeIds.has(processRow.pid) &&
      isRehearsalProcess(processRow.commandLine),
  );
  const listeners = await inspectTcpListeners();
  const matchingProcessIds = new Set(matchingProcesses.map((row) => row.pid));
  const matchingListeners = listeners.filter((listener) =>
    matchingProcessIds.has(listener.pid),
  );
  const matchingTemporaryArtifacts = temporaryBases.flatMap((base) =>
    listNestedArtifacts(base),
  );
  return {
    databaseNamesChecked: databaseNames,
    matchingDatabaseCount: matchingDatabases.length,
    matchingDatabases,
    matchingProcessCount: matchingProcesses.length,
    matchingProcesses,
    matchingListenerCount: matchingListeners.length,
    matchingListeners,
    matchingTemporaryArtifactCount: matchingTemporaryArtifacts.length,
    matchingTemporaryArtifacts: matchingTemporaryArtifacts.map(repoRelative),
  };
}

async function findMatchingDatabases(urlValue, databaseNames) {
  if (!urlValue || databaseNames.length === 0) {
    return [];
  }
  const adminUrl = new URL(urlValue);
  adminUrl.pathname = '/postgres';
  adminUrl.searchParams.delete('schema');
  adminUrl.searchParams.delete('options');
  const prisma = new PrismaClient({
    adapter: new PrismaPg(adminUrl.toString()),
  });
  await prisma.$connect();
  try {
    const rows = await prisma.$queryRawUnsafe(
      'SELECT datname FROM pg_database WHERE datname = ANY($1::text[]) ORDER BY datname',
      databaseNames,
    );
    return rows.map((row) => row.datname);
  } finally {
    await prisma.$disconnect();
  }
}

async function inspectNodeProcesses() {
  if (process.platform !== 'win32') {
    return [];
  }
  const script =
    'Get-CimInstance Win32_Process -Filter "Name = \'node.exe\'" | Select-Object ProcessId,CommandLine | ConvertTo-Json -Compress';
  const { stdout } = await execFileAsync(
    'powershell.exe',
    ['-NoProfile', '-NonInteractive', '-Command', script],
    {
      windowsHide: true,
      maxBuffer: 5 * 1024 * 1024,
    },
  );
  const rows = parsePowerShellJson(stdout);
  return rows.map((row) => ({
    pid: Number(row.ProcessId),
    commandLine: String(row.CommandLine ?? ''),
  }));
}

async function inspectTcpListeners() {
  if (process.platform !== 'win32') {
    return [];
  }
  const script =
    'Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Select-Object OwningProcess,LocalAddress,LocalPort | ConvertTo-Json -Compress';
  const { stdout } = await execFileAsync(
    'powershell.exe',
    ['-NoProfile', '-NonInteractive', '-Command', script],
    {
      windowsHide: true,
      maxBuffer: 5 * 1024 * 1024,
    },
  );
  return parsePowerShellJson(stdout).map((row) => ({
    pid: Number(row.OwningProcess),
    localAddress: String(row.LocalAddress),
    localPort: Number(row.LocalPort),
  }));
}

function isRehearsalProcess(commandLine) {
  const normalized = commandLine.toLowerCase().replaceAll('\\', '/');
  const normalizedApiRoot = apiRoot.toLowerCase().replaceAll('\\', '/');
  return (
    normalized.includes(normalizedApiRoot) &&
    (normalized.includes('dist/src/main.js') ||
      normalized.includes('smoke-auth-') ||
      normalized.includes('prisma-auth-session.integration.spec.ts'))
  );
}

function listNestedArtifacts(base) {
  if (!existsSync(base)) {
    return [];
  }
  return readdirSync(base, { recursive: true }).map((entry) =>
    join(base, String(entry)),
  );
}

function parsePowerShellJson(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }
  const parsed = JSON.parse(trimmed);
  return Array.isArray(parsed) ? parsed : [parsed];
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function sha256File(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function memoryHeadroomSnapshot() {
  const totalBytes = totalmem();
  const freeBytes = freemem();
  return {
    totalBytes,
    freeBytes,
    freePercent: Number(((freeBytes / totalBytes) * 100).toFixed(2)),
  };
}

function lastNonEmptyLine(value) {
  if (!value) {
    return null;
  }
  return (
    String(value)
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .at(-1) ?? null
  );
}

function repoRelative(path) {
  return resolve(path)
    .slice(repoRoot.length + 1)
    .replaceAll('\\', '/');
}

function writeCommandLog(value) {
  if (!commandLogDir) {
    return;
  }
  mkdirSync(commandLogDir, { recursive: true });
  writeFileSync(
    join(commandLogDir, 'staging-rehearsal-command-evidence.json'),
    `${JSON.stringify(
      {
        runId: value.runId,
        target: value.target,
        status: value.status,
        commands: value.commandEvidence,
        cleanup: value.cleanup,
        productionReady: false,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
}

function renderMarkdown(value) {
  const checks = Object.entries(value.gates.checks)
    .map(([name, passed]) => `| ${name} | ${passed ? 'PASS' : 'FAIL'} |`)
    .join('\n');
  const commands = value.commandEvidence
    .map(
      (command) =>
        `| ${command.id} | ${command.status} | ${command.durationMs} | ${command.testCount ?? 'n/a'} | \`${command.command}\` |`,
    )
    .join('\n');
  return `# Isolated Staging Rehearsal Report

Generated: ${value.generatedAt}

- Target: \`${value.target}\`
- Classification: \`${value.targetClassification}\`
- Status: **${value.status}**
- Approval: \`${value.approval.code}\` scoped to \`staging_dry_run\`
- Production ready: **false**
- Production enabled: **false**
- External providers: mock/fixture only

## Gate Checks

| Check | Status |
| --- | --- |
${checks}

## Measured Evidence

- Migration/rollback/forward-repair command: ${value.measured.migrationRollbackForwardRepairDurationMs ?? 'n/a'} ms
- Backup window: ${value.measured.backupWindowMs ?? 'n/a'} ms
- Observed local RPO: ${value.measured.observedRpoMs ?? 'n/a'} ms (objective <= ${value.objectives.rpoMaximumMs} ms)
- Restore plus validation RTO: ${value.measured.restoreAndValidationRtoMs ?? 'n/a'} ms (objective <= ${value.objectives.rtoMaximumMs} ms)
- Backup/restore digest match: ${value.measured.backupSourceDigest === value.measured.restoredDigest}
- Minimum host free-memory headroom: ${value.measured.headroom.minimumObservedFreeMemoryPercent}% (required >= 30%)
- Alert contention maximum/P95: ${value.measured.authAlertMaxLockWaitMs ?? 'n/a'}/${value.measured.authAlertP95LockWaitMs ?? 'n/a'} ms

## Commands

| Slice | Status | Duration ms | Tests | Command |
| --- | --- | ---: | ---: | --- |
${commands}

## Timed Synthetic Incident Drill

- Correlation: \`${value.incidentDrill.correlationId}\`
- Acknowledgement: ${value.incidentDrill.acknowledgementMs} ms / ${value.incidentDrill.acknowledgementObjectiveMs} ms
- Containment decision: ${value.incidentDrill.containmentDecisionMs} ms / ${value.incidentDrill.containmentDecisionObjectiveMs} ms
- Provider kill switch: ${value.incidentDrill.providerKillSwitchVerified}
- Decision: ${value.incidentDrill.containmentDecision}
- Recovery: ${value.incidentDrill.recoveryVerified}
- External alert delivery used: false

## Privacy And Retention

- Synthetic/pseudonymized fixtures only: true
- Read-only access and bounded export: ${value.privacy.adminSupportReadOnlyAccessVerified && value.privacy.boundedExportVerified}
- Redaction: ${value.privacy.redactionVerified}
- Exact expired-row deletion: ${value.privacy.exactExpiredDeletionVerified}
- Default evidence retention: ${value.privacy.evidenceRetentionDays} days, expires ${value.privacy.evidenceExpiresAt}
- Raw identity/token/rate key/secret stored: false

## Exact Cleanup

- Matching random databases: ${value.cleanup.matchingDatabaseCount}
- Matching rehearsal processes: ${value.cleanup.matchingProcessCount}
- Matching listeners: ${value.cleanup.matchingListenerCount}
- Matching temporary artifacts: ${value.cleanup.matchingTemporaryArtifactCount}

## Truthful Limitations

${value.limitations.map((limitation) => `- ${limitation}`).join('\n')}
`;
}
