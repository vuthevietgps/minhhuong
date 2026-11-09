import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const apiRoot = process.cwd().endsWith(`${join('apps', 'api')}`)
  ? process.cwd()
  : join(process.cwd(), 'apps', 'api');

config({ path: join(apiRoot, '../../.env') });
config({ path: join(apiRoot, '.env') });

const baseDatabaseUrl =
  process.env.DATABASE_URL ??
  'postgresql://minhhuong:minhhuong@localhost:5432/minhhuong?schema=public';

describe('ChannelParticipant parent FK deploy safety', () => {
  jest.setTimeout(120_000);

  const databaseName = `prompt10_parent_fk_${randomUUID().replace(/-/g, '_')}`;
  let adminPrisma: PrismaClient;
  let prisma: PrismaClient;

  beforeAll(async () => {
    adminPrisma = new PrismaClient({
      adapter: new PrismaPg(baseDatabaseUrl),
    });
    await adminPrisma.$connect();
    await adminPrisma.$executeRawUnsafe(`CREATE DATABASE "${databaseName}"`);

    const databaseUrl = databaseUrlForDatabase(databaseName);
    execFileSync(
      process.execPath,
      [
        join(apiRoot, 'node_modules/prisma/build/index.js'),
        'migrate',
        'deploy',
        '--schema',
        join(apiRoot, 'prisma'),
      ],
      {
        cwd: apiRoot,
        env: { ...process.env, DATABASE_URL: databaseUrl },
        stdio: 'pipe',
      },
    );

    prisma = new PrismaClient({
      adapter: new PrismaPg(databaseUrl),
    });
    await prisma.$connect();
    const currentDatabase = await prisma.$queryRawUnsafe<
      Array<{ current_database: string }>
    >('select current_database()');
    expect(currentDatabase[0]?.current_database).toBe(databaseName);
  });

  afterAll(async () => {
    await prisma?.$disconnect();
    if (adminPrisma) {
      await adminPrisma.$executeRawUnsafe(
        `DROP DATABASE IF EXISTS "${databaseName}" WITH (FORCE)`,
      );
      await adminPrisma.$disconnect();
    }
  });

  it('validates the parent FK and audits parent-reference data quality', async () => {
    const constraint = await prisma.$queryRawUnsafe<
      Array<{
        conname: string;
        convalidated: boolean;
        table_name: string;
        definition: string;
      }>
    >(constraintStatusSql);
    expect(constraint).toEqual([
      expect.objectContaining({
        conname: 'ChannelParticipant_parentParticipantId_fkey',
        convalidated: true,
        table_name: 'ChannelParticipant',
      }),
    ]);
    expect(constraint[0]?.definition).toContain(
      'FOREIGN KEY ("parentParticipantId")',
    );

    await seedValidParticipantTree(prisma);
    await expect(auditParentReferences(prisma)).resolves.toEqual({
      missingParentCount: 0,
      selfParentCount: 0,
      cycleCount: 0,
    });

    await expect(
      prisma.channelParticipant.create({
        data: {
          id: 'p10-invalid-child',
          type: 'SALE',
          code: 'P10-INVALID-CHILD',
          displayName: 'Prompt 10 invalid child',
          parentParticipantId: 'p10-missing-parent',
          rootParticipantId: 'p10-root',
          lineage: '/p10-root/p10-invalid-child/',
          depth: 1,
        },
      }),
    ).rejects.toThrow();
  });
});

const constraintStatusSql = `
  SELECT
    con.conname,
    con.convalidated,
    cls.relname AS table_name,
    pg_get_constraintdef(con.oid) AS definition
  FROM pg_constraint con
  JOIN pg_class cls ON cls.oid = con.conrelid
  WHERE con.conname = 'ChannelParticipant_parentParticipantId_fkey'
`;

const missingParentSql = `
  SELECT child.id AS child_id, child."parentParticipantId" AS missing_parent_id
  FROM "ChannelParticipant" child
  LEFT JOIN "ChannelParticipant" parent
    ON parent.id = child."parentParticipantId"
  WHERE child."parentParticipantId" IS NOT NULL
    AND parent.id IS NULL
`;

const selfParentSql = `
  SELECT id
  FROM "ChannelParticipant"
  WHERE "parentParticipantId" = id
`;

const cycleSql = `
  WITH RECURSIVE parent_walk AS (
    SELECT
      id AS start_id,
      id,
      "parentParticipantId",
      ARRAY[id] AS path,
      false AS cycle
    FROM "ChannelParticipant"
    WHERE "parentParticipantId" IS NOT NULL

    UNION ALL

    SELECT
      parent_walk.start_id,
      parent.id,
      parent."parentParticipantId",
      parent_walk.path || parent.id,
      parent.id = ANY(parent_walk.path)
    FROM parent_walk
    JOIN "ChannelParticipant" parent
      ON parent.id = parent_walk."parentParticipantId"
    WHERE parent_walk."parentParticipantId" IS NOT NULL
      AND NOT parent_walk.cycle
      AND array_length(parent_walk.path, 1) < 50
  )
  SELECT DISTINCT start_id
  FROM parent_walk
  WHERE cycle
`;

function databaseUrlForDatabase(database: string) {
  const url = new URL(baseDatabaseUrl);
  url.pathname = `/${database}`;
  url.searchParams.delete('schema');
  url.searchParams.delete('options');
  return url.toString();
}

async function auditParentReferences(prisma: PrismaClient) {
  const [missingParents, selfParents, cycles] = await Promise.all([
    prisma.$queryRawUnsafe<Array<{ child_id: string }>>(missingParentSql),
    prisma.$queryRawUnsafe<Array<{ id: string }>>(selfParentSql),
    prisma.$queryRawUnsafe<Array<{ start_id: string }>>(cycleSql),
  ]);

  return {
    missingParentCount: missingParents.length,
    selfParentCount: selfParents.length,
    cycleCount: cycles.length,
  };
}

async function seedValidParticipantTree(prisma: PrismaClient) {
  await prisma.channelParticipant.create({
    data: {
      id: 'p10-root',
      type: 'DIRECTOR',
      code: 'P10-ROOT',
      displayName: 'Prompt 10 Root',
      rootParticipantId: 'p10-root',
      lineage: '/p10-root/',
      depth: 0,
    },
  });
  await prisma.channelParticipant.create({
    data: {
      id: 'p10-manager',
      type: 'MANAGER',
      code: 'P10-MANAGER',
      displayName: 'Prompt 10 Manager',
      parentParticipantId: 'p10-root',
      rootParticipantId: 'p10-root',
      lineage: '/p10-root/p10-manager/',
      depth: 1,
    },
  });
  await prisma.channelParticipant.create({
    data: {
      id: 'p10-sale',
      type: 'SALE',
      code: 'P10-SALE',
      displayName: 'Prompt 10 Sale',
      parentParticipantId: 'p10-manager',
      rootParticipantId: 'p10-root',
      lineage: '/p10-root/p10-manager/p10-sale/',
      depth: 2,
    },
  });
}
