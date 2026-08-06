import assert from 'node:assert/strict';
import test from 'node:test';
import { inspectMigrationEnvironment } from './run-hosted-migration.mjs';

const safeEnvironment = {
  DEPLOYMENT_ENVIRONMENT: 'hosted-staging',
  PRODUCTION_READY: 'false',
  PRODUCTION_ENABLED: 'false',
  LOCAL_DEMO_ROUTES_ENABLED: 'false',
  DATABASE_URL:
    'postgresql://staging_app:synthetic@postgres.internal:5432/minhhuong_staging',
  MIGRATION_BACKUP_PATH: '/backups/pre-migration.dump',
  MIGRATION_BACKUP_HOOK: '/app/deploy/hooks/backup-postgres.sh',
  MIGRATION_ROLLBACK_HOOK: '/app/deploy/hooks/rollback-postgres.sh',
};

test('accepts only the fail-closed hosted-staging migration contract', () => {
  const report = inspectMigrationEnvironment(safeEnvironment);

  assert.equal(report.databaseHost, 'postgres.internal');
  assert.match(report.backupPath, /pre-migration\.dump$/);
});

test('rejects production enablement and an unscoped migration target', () => {
  assert.throws(
    () =>
      inspectMigrationEnvironment({
        ...safeEnvironment,
        PRODUCTION_ENABLED: 'true',
      }),
    /PRODUCTION_ENABLED_MUST_BE_FALSE/,
  );
  assert.throws(
    () =>
      inspectMigrationEnvironment({
        ...safeEnvironment,
        DEPLOYMENT_ENVIRONMENT: 'production',
      }),
    /DEPLOYMENT_ENVIRONMENT_MUST_BE_HOSTED_STAGING/,
  );
});

test('rejects missing backup and rollback hooks', () => {
  assert.throws(
    () =>
      inspectMigrationEnvironment({
        ...safeEnvironment,
        MIGRATION_BACKUP_HOOK: '',
      }),
    /MIGRATION_BACKUP_HOOK_REQUIRED/,
  );
  assert.throws(
    () =>
      inspectMigrationEnvironment({
        ...safeEnvironment,
        MIGRATION_ROLLBACK_HOOK: '',
      }),
    /MIGRATION_ROLLBACK_HOOK_REQUIRED/,
  );
});
