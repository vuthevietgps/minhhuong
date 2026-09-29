import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const require = createRequire(import.meta.url);
const { Client } = require('pg');
require('dotenv').config({ path: resolve('../../.env'), quiet: true });
const base = new URL(process.env.DATABASE_URL || 'postgresql://minhhuong:minhhuong@localhost:5432/minhhuong');
if (!['localhost', '127.0.0.1'].includes(base.hostname)) throw new Error('This test runner only operates on local PostgreSQL');
const database = `minhhuong_browser_test_${Date.now()}`;
const adminUrl = new URL(base); adminUrl.pathname = '/postgres'; adminUrl.search = '';
const admin = new Client({ connectionString: adminUrl.href }); await admin.connect();
const testUrl = new URL(base); testUrl.pathname = '/' + database; testUrl.search = '';
const env = { ...process.env, DATABASE_URL: testUrl.href, BROWSER_CONTROL_TEST_DATABASE_URL: testUrl.href };
function run(bin, args) {
  const result = spawnSync(process.execPath, [bin, ...args], { env, encoding: 'utf8', stdio: 'pipe' });
  // Database URL may contain credentials; do not echo raw CLI output on failure.
  const output = `${result.stdout || ''}${result.stderr || ''}`.replace(/postgres(?:ql)?:\/\/[^\s"']+/g, '[database URL]');
  process.stdout.write(output);
  if (result.status !== 0) throw new Error(`${args[0]} failed (${result.status})`);
}
try {
  await admin.query(`CREATE DATABASE "${database}"`);
  run(require.resolve('prisma/build/index.js'), ['db', 'push']);
  // Validate the migration itself in a rollback-only schema, independently of db push.
  const migration = new Client({ connectionString: testUrl.href }); await migration.connect();
  try {
    await migration.query('BEGIN; CREATE SCHEMA migration_check; SET LOCAL search_path = migration_check; CREATE TABLE "ChildProfile" ("id" TEXT PRIMARY KEY);');
    await migration.query(readFileSync('prisma/migrations/20260919100000_browser_control/migration.sql', 'utf8'));
    await migration.query('CREATE TABLE "AiContextSource" ("id" TEXT PRIMARY KEY);');
    await migration.query(readFileSync('prisma/migrations/20260919120000_browser_content_preparation/migration.sql', 'utf8'));
    await migration.query('ROLLBACK');
    console.log('Browser control migration SQL: passed');
  } finally { await migration.end(); }
  run(require.resolve('jest/bin/jest'), ['browser-control', '--runInBand']);
} finally {
  // The exact database name is generated above; no existing application data is touched.
  await admin.query(`DROP DATABASE IF EXISTS "${database}" WITH (FORCE)`);
  await admin.end();
}
