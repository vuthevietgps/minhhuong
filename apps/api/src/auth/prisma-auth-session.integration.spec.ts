import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { config } from 'dotenv';
import { AuthSessionService } from './auth-session.service';
import { PrismaAuthSessionStore } from './prisma-auth-session.store';

const apiRoot = process.cwd().endsWith(`${join('apps', 'api')}`)
  ? process.cwd()
  : join(process.cwd(), 'apps', 'api');

config({ path: join(apiRoot, '../../.env') });
config({ path: join(apiRoot, '.env') });

const baseDatabaseUrl =
  process.env.DATABASE_URL ??
  'postgresql://minhhuong:minhhuong@localhost:5432/minhhuong?schema=public';
const migrationName = '20260710090000_prisma_auth_session_store';
const migrationPath = join(
  apiRoot,
  'prisma',
  'migrations',
  migrationName,
  'migration.sql',
);
const rollbackPath = join(
  apiRoot,
  'prisma',
  'runbooks',
  `${migrationName}_pre_activation_rollback.sql`,
);
const hashIntegrityMigrationName =
  '20260710140000_auth_refresh_token_hash_integrity';
const hashIntegrityMigrationPath = join(
  apiRoot,
  'prisma',
  'migrations',
  hashIntegrityMigrationName,
  'migration.sql',
);
const hashIntegrityRollbackPath = join(
  apiRoot,
  'prisma',
  'runbooks',
  `${hashIntegrityMigrationName}_pre_activation_rollback.sql`,
);
const hashIntegrityForwardRepairPath = join(
  apiRoot,
  'prisma',
  'runbooks',
  `${hashIntegrityMigrationName}_forward_repair.sql`,
);

describe('Prisma AuthSessionStore disposable database contract', () => {
  jest.setTimeout(180_000);

  const databaseName = `auth_session_store_${randomUUID().replace(/-/g, '_')}`;
  let databaseUrl: string;
  let adminPrisma: PrismaClient;
  let prismaA: PrismaClient;
  let prismaB: PrismaClient;

  beforeAll(async () => {
    assertLocalDatabaseUrl(baseDatabaseUrl);
    adminPrisma = new PrismaClient({ adapter: new PrismaPg(baseDatabaseUrl) });
    await adminPrisma.$connect();
    await adminPrisma.$executeRawUnsafe(`CREATE DATABASE "${databaseName}"`);

    databaseUrl = databaseUrlForDatabase(databaseName);
    runPrisma(
      ['migrate', 'deploy', '--schema', migrationSchemaPath()],
      databaseUrl,
    );

    prismaA = new PrismaClient({ adapter: new PrismaPg(databaseUrl) });
    prismaB = new PrismaClient({ adapter: new PrismaPg(databaseUrl) });
    await Promise.all([prismaA.$connect(), prismaB.$connect()]);
    await prismaA.user.create({
      data: {
        id: 'auth-store-local-user',
        email: 'auth-store-local-user@example.test',
        passwordHash: 'fixture-only-not-a-login-secret',
        status: 'ACTIVE',
      },
    });

    const currentDatabase = await prismaA.$queryRawUnsafe<
      Array<{ current_database: string }>
    >('select current_database()');
    expect(currentDatabase[0]?.current_database).toBe(databaseName);
  });

  afterAll(async () => {
    await Promise.allSettled([prismaA?.$disconnect(), prismaB?.$disconnect()]);
    if (adminPrisma) {
      await adminPrisma.$executeRawUnsafe(
        `DROP DATABASE IF EXISTS "${databaseName}" WITH (FORCE)`,
      );
      await adminPrisma.$disconnect();
    }
  });

  it('deploys the three persistent auth tables, constraints, and lookup indexes', async () => {
    const tables = await prismaA.$queryRawUnsafe<
      Array<{ table_name: string }>
    >(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN (
          'auth_sessions',
          'auth_refresh_tokens',
          'auth_session_audit_events'
        )
      ORDER BY table_name
    `);
    expect(tables.map((row) => row.table_name)).toEqual([
      'auth_refresh_tokens',
      'auth_session_audit_events',
      'auth_sessions',
    ]);

    const constraints = await prismaA.$queryRawUnsafe<
      Array<{ conname: string }>
    >(`
      SELECT conname
      FROM pg_constraint
      WHERE conname IN (
        'auth_sessions_user_id_fkey',
        'auth_refresh_tokens_session_id_fkey',
        'auth_refresh_tokens_user_id_fkey'
      )
      ORDER BY conname
    `);
    expect(constraints.map((row) => row.conname)).toEqual([
      'auth_refresh_tokens_session_id_fkey',
      'auth_refresh_tokens_user_id_fkey',
      'auth_sessions_user_id_fkey',
    ]);

    const indexes = await prismaA.$queryRawUnsafe<
      Array<{ indexname: string }>
    >(`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename IN (
          'auth_sessions',
          'auth_refresh_tokens',
          'auth_session_audit_events'
        )
    `);
    expect(indexes.map((row) => row.indexname)).toEqual(
      expect.arrayContaining([
        'auth_sessions_user_id_state_expires_at_idx',
        'auth_refresh_tokens_session_id_state_idx',
        'auth_refresh_tokens_token_hash_idx',
        'auth_session_audit_events_action_created_at_idx',
      ]),
    );

    const hashConstraints = await prismaA.$queryRawUnsafe<
      Array<{ conname: string; convalidated: boolean }>
    >(`
      SELECT conname, convalidated
      FROM pg_constraint
      WHERE conname = 'auth_refresh_tokens_token_hash_sha256_chk'
    `);
    expect(hashConstraints).toEqual([
      {
        conname: 'auth_refresh_tokens_token_hash_sha256_chk',
        convalidated: true,
      },
    ]);
  });

  it('shares revocation across two independent Prisma clients and persists hashes only', async () => {
    const instanceA = new AuthSessionService(
      new PrismaAuthSessionStore(prismaA),
    );
    const instanceB = new AuthSessionService(
      new PrismaAuthSessionStore(prismaB),
    );
    const session = await instanceA.createSession({
      userId: 'auth-store-local-user',
      email: 'auth-store-local-user@example.test',
      roles: ['PARENT'],
      deviceId: 'disposable-local-browser',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });
    const refreshToken = await instanceA.issueRefreshToken({
      sessionId: session.id,
      userId: session.userId,
    });

    await expect(instanceB.getSession(session.id)).resolves.toEqual(
      expect.objectContaining({ id: session.id, state: 'ACTIVE' }),
    );
    const persistedRefresh = await prismaB.authRefreshToken.findUniqueOrThrow({
      where: { id: refreshToken.id },
    });
    expect(persistedRefresh.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(persistedRefresh.tokenHash).not.toContain(refreshToken.token);

    await expect(
      instanceA.revokeSession(session.id, 'TWO_INSTANCE_LOCAL_REVOCATION'),
    ).resolves.toBe(true);
    await expect(
      instanceB.assertTokenSessionActive({
        sub: session.userId,
        email: session.email,
        roles: session.roles,
        sid: session.id,
      }),
    ).rejects.toThrow('Session has been revoked');
    await expect(instanceB.getRefreshToken(refreshToken.id)).resolves.toEqual(
      expect.objectContaining({
        state: 'REVOKED',
        reason: 'TWO_INSTANCE_LOCAL_REVOCATION',
      }),
    );
  });

  it('leaves no active refresh token after concurrent cross-instance rotation and revocation', async () => {
    const instanceA = new AuthSessionService(
      new PrismaAuthSessionStore(prismaA),
    );
    const instanceB = new AuthSessionService(
      new PrismaAuthSessionStore(prismaB),
    );

    for (let attempt = 0; attempt < 6; attempt += 1) {
      const session = await instanceA.createSession({
        userId: 'auth-store-local-user',
        email: 'auth-store-local-user@example.test',
        roles: ['PARENT'],
        deviceId: `concurrent-local-browser-${attempt}`,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      });
      const refreshToken = await instanceA.issueRefreshToken({
        sessionId: session.id,
        userId: session.userId,
      });

      const [rotation, revocation] = await Promise.allSettled([
        instanceA.rotateRefreshToken(refreshToken.token),
        instanceB.revokeSession(
          session.id,
          'CONCURRENT_TWO_INSTANCE_REVOCATION',
        ),
      ]);

      expect(revocation).toEqual({ status: 'fulfilled', value: true });
      expect(['fulfilled', 'rejected']).toContain(rotation.status);
      await expect(instanceB.getSession(session.id)).resolves.toEqual(
        expect.objectContaining({
          state: 'REVOKED',
          reason: 'CONCURRENT_TWO_INSTANCE_REVOCATION',
        }),
      );
      expect(
        await prismaA.authRefreshToken.count({
          where: { sessionId: session.id, state: 'ACTIVE' },
        }),
      ).toBe(0);
      await expect(
        instanceA.assertTokenSessionActive({
          sub: session.userId,
          email: session.email,
          roles: session.roles,
          sid: session.id,
        }),
      ).rejects.toThrow('Session has been revoked');
    }
  });

  it('leaves no active refresh token after concurrent cross-instance rotation and logout', async () => {
    const instanceA = new AuthSessionService(
      new PrismaAuthSessionStore(prismaA),
    );
    const instanceB = new AuthSessionService(
      new PrismaAuthSessionStore(prismaB),
    );

    for (let attempt = 0; attempt < 6; attempt += 1) {
      const session = await instanceA.createSession({
        userId: 'auth-store-local-user',
        email: 'auth-store-local-user@example.test',
        roles: ['PARENT'],
        deviceId: `concurrent-local-logout-${attempt}`,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      });
      const refreshToken = await instanceA.issueRefreshToken({
        sessionId: session.id,
        userId: session.userId,
      });

      const [rotation, logout] = await Promise.allSettled([
        instanceA.rotateRefreshToken(refreshToken.token),
        instanceB.endSession(session.id, session.userId, 'LOGOUT'),
      ]);

      expect(logout).toEqual({ status: 'fulfilled', value: true });
      expect(['fulfilled', 'rejected']).toContain(rotation.status);
      const finalSession = await instanceB.getSession(session.id);
      expect(['ENDED', 'REVOKED']).toContain(finalSession?.state);
      expect(finalSession?.reason).toBe(
        finalSession?.state === 'ENDED' ? 'LOGOUT' : 'REFRESH_TOKEN_REUSED',
      );
      expect(
        await prismaA.authRefreshToken.count({
          where: { sessionId: session.id, state: 'ACTIVE' },
        }),
      ).toBe(0);
      await expect(
        instanceA.assertTokenSessionActive({
          sub: session.userId,
          email: session.email,
          roles: session.roles,
          sid: session.id,
        }),
      ).rejects.toThrow(/Session has (ended|been revoked)/);
    }
  });

  it('executes rollback, audited malformed-hash repair, and constraint reactivation against the disposable database', async () => {
    await Promise.all([prismaA.$disconnect(), prismaB.$disconnect()]);
    runPrisma(['db', 'execute', '--file', rollbackPath], databaseUrl);

    const inspection = new PrismaClient({ adapter: new PrismaPg(databaseUrl) });
    await inspection.$connect();
    const afterRollback = await inspection.$queryRawUnsafe<
      Array<{ table_name: string }>
    >(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name LIKE 'auth_%'
    `);
    expect(afterRollback).toEqual([]);
    runPrisma(['db', 'execute', '--file', migrationPath], databaseUrl);
    await inspection.authSession.create({
      data: {
        id: 'hash-forward-repair-session',
        userId: 'auth-store-local-user',
        email: 'auth-store-local-user@example.test',
        roles: ['PARENT'],
        deviceId: 'hash-forward-repair-device',
        state: 'ACTIVE',
        issuedAt: new Date('2026-07-10T00:00:00.000Z'),
        expiresAt: new Date('2026-07-11T00:00:00.000Z'),
      },
    });
    await inspection.$executeRawUnsafe(`
      INSERT INTO "auth_refresh_tokens" (
        "id", "session_id", "user_id", "device_id", "token_hash", "state",
        "issued_at", "expires_at"
      ) VALUES (
        'hash-forward-repair-token',
        'hash-forward-repair-session',
        'auth-store-local-user',
        'hash-forward-repair-device',
        'plaintext-like-value',
        'ACTIVE',
        '2026-07-10T00:00:00.000Z',
        '2026-07-11T00:00:00.000Z'
      )
    `);
    await inspection.$disconnect();

    runPrisma(
      ['db', 'execute', '--file', hashIntegrityForwardRepairPath],
      databaseUrl,
    );
    runPrisma(
      ['db', 'execute', '--file', hashIntegrityMigrationPath],
      databaseUrl,
    );

    const repaired = new PrismaClient({ adapter: new PrismaPg(databaseUrl) });
    await repaired.$connect();
    const repairedToken = await repaired.authRefreshToken.findUniqueOrThrow({
      where: { id: 'hash-forward-repair-token' },
    });
    expect(repairedToken).toEqual(
      expect.objectContaining({
        state: 'REVOKED',
        reason: 'MALFORMED_TOKEN_HASH_FORWARD_REPAIR',
      }),
    );
    expect(repairedToken.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    const repairAudit = await repaired.authSessionAuditEvent.findUniqueOrThrow({
      where: {
        id: 'auth-refresh-hash-forward-repair:hash-forward-repair-token',
      },
    });
    expect(repairAudit).toEqual(
      expect.objectContaining({
        action: 'REFRESH_TOKEN_DENIED',
        reason: 'MALFORMED_TOKEN_HASH_FORWARD_REPAIR',
        refreshTokenId: 'hash-forward-repair-token',
      }),
    );

    runPrisma(
      ['db', 'execute', '--file', hashIntegrityRollbackPath],
      databaseUrl,
    );
    const constraintAfterRollback = await repaired.$queryRawUnsafe<
      Array<{ conname: string }>
    >(`
      SELECT conname
      FROM pg_constraint
      WHERE conname = 'auth_refresh_tokens_token_hash_sha256_chk'
    `);
    expect(constraintAfterRollback).toEqual([]);

    runPrisma(
      ['db', 'execute', '--file', hashIntegrityMigrationPath],
      databaseUrl,
    );
    await expect(
      repaired.$executeRawUnsafe(`
        INSERT INTO "auth_refresh_tokens" (
          "id", "session_id", "user_id", "device_id", "token_hash", "state",
          "issued_at", "expires_at"
        ) VALUES (
          'constraint-rejection-token',
          'hash-forward-repair-session',
          'auth-store-local-user',
          'hash-forward-repair-device',
          'raw-token-value',
          'ACTIVE',
          '2026-07-10T00:00:00.000Z',
          '2026-07-11T00:00:00.000Z'
        )
      `),
    ).rejects.toThrow();

    const afterRepair = await repaired.$queryRawUnsafe<
      Array<{ table_name: string }>
    >(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name LIKE 'auth_%'
      ORDER BY table_name
    `);
    expect(afterRepair.map((row) => row.table_name)).toEqual([
      'auth_refresh_tokens',
      'auth_session_audit_events',
      'auth_sessions',
    ]);
    const constraintAfterRepair = await repaired.$queryRawUnsafe<
      Array<{ conname: string; convalidated: boolean }>
    >(`
      SELECT conname, convalidated
      FROM pg_constraint
      WHERE conname = 'auth_refresh_tokens_token_hash_sha256_chk'
    `);
    expect(constraintAfterRepair).toEqual([
      {
        conname: 'auth_refresh_tokens_token_hash_sha256_chk',
        convalidated: true,
      },
    ]);
    await repaired.$disconnect();

    prismaA = new PrismaClient({ adapter: new PrismaPg(databaseUrl) });
    prismaB = new PrismaClient({ adapter: new PrismaPg(databaseUrl) });
  });
});

function migrationSchemaPath() {
  return join(apiRoot, 'prisma', 'schema.prisma');
}

function runPrisma(args: string[], url: string) {
  execFileSync(
    process.execPath,
    [join(apiRoot, 'node_modules/prisma/build/index.js'), ...args],
    {
      cwd: apiRoot,
      env: { ...process.env, DATABASE_URL: url },
      stdio: 'pipe',
    },
  );
}

function assertLocalDatabaseUrl(urlValue: string) {
  const url = new URL(urlValue);
  if (!['localhost', '127.0.0.1', '::1'].includes(url.hostname)) {
    throw new Error(
      `Disposable AuthSessionStore tests refuse non-local database host ${url.hostname}`,
    );
  }
  if (!readFileSync(migrationPath, 'utf8').includes('auth_sessions')) {
    throw new Error('Auth session migration fixture is missing');
  }
}

function databaseUrlForDatabase(database: string) {
  const url = new URL(baseDatabaseUrl);
  url.pathname = `/${database}`;
  url.searchParams.delete('schema');
  url.searchParams.delete('options');
  return url.toString();
}
