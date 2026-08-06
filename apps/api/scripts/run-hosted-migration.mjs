import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import pg from 'pg';

const { Client } = pg;
const advisoryLockNamespace = 74821;
const advisoryLockKey = 1;

const emit = (level, event, details = {}) => {
  process.stdout.write(
    `${JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      service: 'minhhuong-migration',
      event,
      ...details,
    })}\n`,
  );
};

const requireValue = (environment, name) => {
  const value = environment[name]?.trim();
  if (!value) {
    throw new Error(`${name}_REQUIRED`);
  }
  return value;
};

const requireFalse = (environment, name) => {
  if (requireValue(environment, name).toLowerCase() !== 'false') {
    throw new Error(`${name}_MUST_BE_FALSE`);
  }
};

export const inspectMigrationEnvironment = (environment) => {
  const deploymentEnvironment = requireValue(
    environment,
    'DEPLOYMENT_ENVIRONMENT',
  ).toLowerCase();
  if (deploymentEnvironment !== 'hosted-staging') {
    throw new Error('DEPLOYMENT_ENVIRONMENT_MUST_BE_HOSTED_STAGING');
  }

  requireFalse(environment, 'PRODUCTION_READY');
  requireFalse(environment, 'PRODUCTION_ENABLED');
  requireFalse(environment, 'LOCAL_DEMO_ROUTES_ENABLED');

  const databaseUrl = new URL(requireValue(environment, 'DATABASE_URL'));
  if (!['postgres:', 'postgresql:'].includes(databaseUrl.protocol)) {
    throw new Error('DATABASE_URL_MUST_BE_POSTGRESQL');
  }
  if (!databaseUrl.hostname || !databaseUrl.pathname.replace(/^\//, '')) {
    throw new Error('DATABASE_URL_HOST_AND_DATABASE_REQUIRED');
  }

  const backupPath = resolve(
    requireValue(environment, 'MIGRATION_BACKUP_PATH'),
  );
  const backupHook = resolve(
    requireValue(environment, 'MIGRATION_BACKUP_HOOK'),
  );
  const rollbackHook = resolve(
    requireValue(environment, 'MIGRATION_ROLLBACK_HOOK'),
  );

  return {
    databaseUrl: databaseUrl.toString(),
    databaseHost: databaseUrl.hostname,
    backupPath,
    backupHook,
    rollbackHook,
  };
};

const run = (command, args, options = {}) =>
  new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit',
      shell: false,
      ...options,
    });
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolvePromise();
        return;
      }
      reject(
        new Error(
          `${command.toUpperCase().replace(/[^A-Z0-9]+/g, '_')}_FAILED_${
            signal ?? code ?? 'UNKNOWN'
          }`,
        ),
      );
    });
  });

const runPrisma = async (...args) => {
  await run(process.execPath, ['node_modules/prisma/build/index.js', ...args]);
};

const sha256File = async (path) => {
  const contents = await readFile(path);
  return createHash('sha256').update(contents).digest('hex');
};

const safeErrorCode = (error) => {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/[^A-Za-z0-9_.:-]+/g, '_').slice(0, 160);
};

export const runHostedMigration = async ({
  environment = process.env,
  preflightOnly = false,
} = {}) => {
  const startedAt = new Date();
  const config = inspectMigrationEnvironment(environment);
  emit('info', 'preflight_started', {
    deploymentEnvironment: 'hosted-staging',
    databaseHost: config.databaseHost,
    productionReady: false,
    productionEnabled: false,
  });

  await runPrisma('validate');
  if (preflightOnly) {
    emit('info', 'preflight_passed', { databaseConnectionUsed: false });
    return { status: 'PREFLIGHT_PASS' };
  }

  const client = new Client({ connectionString: config.databaseUrl });
  let lockAcquired = false;
  let backupCreated = false;
  let migrationStarted = false;

  try {
    await client.connect();
    await client.query('SELECT 1 AS ready');
    const lockResult = await client.query(
      'SELECT pg_try_advisory_lock($1::int, $2::int) AS acquired',
      [advisoryLockNamespace, advisoryLockKey],
    );
    lockAcquired = lockResult.rows[0]?.acquired === true;
    if (!lockAcquired) {
      throw new Error('MIGRATION_ADVISORY_LOCK_BUSY');
    }
    emit('info', 'advisory_lock_acquired');

    await run('sh', [config.backupHook]);
    backupCreated = true;
    const backupSha256 = await sha256File(config.backupPath);
    emit('info', 'backup_verified', { backupSha256 });

    migrationStarted = true;
    await runPrisma('migrate', 'deploy');
    await runPrisma('migrate', 'status');
    await client.query('SELECT 1 AS ready');

    const completedAt = new Date();
    const manifest = {
      schemaVersion: 'minhhuong-hosted-staging-migration.v1',
      status: 'PASS',
      deploymentEnvironment: 'hosted-staging',
      productionReady: false,
      productionEnabled: false,
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs: completedAt.getTime() - startedAt.getTime(),
      backupSha256,
      advisoryLockUsed: true,
      migrateCommand: 'prisma migrate deploy',
    };
    await writeFile(
      resolve(dirname(config.backupPath), 'migration-manifest.json'),
      `${JSON.stringify(manifest, null, 2)}\n`,
      'utf8',
    );
    emit('info', 'migration_passed', {
      durationMs: manifest.durationMs,
      backupSha256,
    });
    return manifest;
  } catch (error) {
    const errorCode = safeErrorCode(error);
    emit('error', 'migration_failed', {
      errorCode,
      backupCreated,
      migrationStarted,
    });
    if (backupCreated && migrationStarted) {
      try {
        await run('sh', [config.rollbackHook]);
        emit('warn', 'rollback_hook_completed', {
          automaticRestoreRequested:
            environment.MIGRATION_AUTO_RESTORE_ON_FAILURE === 'true',
        });
      } catch (rollbackError) {
        emit('error', 'rollback_hook_failed', {
          errorCode: safeErrorCode(rollbackError),
        });
      }
    }
    throw new Error(errorCode);
  } finally {
    if (lockAcquired) {
      await client
        .query('SELECT pg_advisory_unlock($1::int, $2::int)', [
          advisoryLockNamespace,
          advisoryLockKey,
        ])
        .catch(() => undefined);
    }
    await client.end().catch(() => undefined);
  }
};

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  runHostedMigration({
    preflightOnly: process.argv.includes('--preflight-only'),
  }).catch((error) => {
    emit('fatal', 'migration_process_exit', {
      errorCode: safeErrorCode(error),
    });
    process.exitCode = 1;
  });
}
