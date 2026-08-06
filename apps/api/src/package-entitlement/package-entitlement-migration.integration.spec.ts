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

describe('Package entitlement migration deploy proof', () => {
  jest.setTimeout(120_000);

  const databaseName = `p11_ent_${randomUUID().replace(/-/g, '_')}`;
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
        join(apiRoot, 'prisma/schema.prisma'),
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

  it('creates package entitlement schema and snapshot columns', async () => {
    const tables = await prisma.$queryRawUnsafe<Array<{ table_name: string }>>(
      `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'PackageEntitlement'
      `,
    );
    expect(tables).toEqual([{ table_name: 'PackageEntitlement' }]);

    const columns = await prisma.$queryRawUnsafe<
      Array<{ table_name: string; column_name: string; udt_name: string }>
    >(
      `
        SELECT table_name, column_name, udt_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND (
            table_name = 'PackageEntitlement'
            OR table_name = 'ActivationOrder'
            OR table_name = 'Subscription'
            OR table_name = 'ActivationPackage'
          )
      `,
    );
    expect(columnNames(columns, 'PackageEntitlement')).toEqual(
      expect.arrayContaining([
        'id',
        'packageId',
        'entitlementKey',
        'valueJson',
        'status',
        'createdAt',
        'updatedAt',
      ]),
    );
    expect(columnNames(columns, 'ActivationOrder')).toContain(
      'entitlementSnapshotJson',
    );
    expect(columnNames(columns, 'Subscription')).toContain(
      'entitlementSnapshotJson',
    );
    expect(columnNames(columns, 'ActivationPackage')).toContain('version');

    const indexes = await prisma.$queryRawUnsafe<
      Array<{ indexname: string; indexdef: string }>
    >(
      `
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename = 'PackageEntitlement'
      `,
    );
    expect(indexes.map((index) => index.indexname)).toEqual(
      expect.arrayContaining([
        'PackageEntitlement_packageId_idx',
        'PackageEntitlement_entitlementKey_status_idx',
        'PackageEntitlement_packageId_entitlementKey_active_key',
      ]),
    );
    expect(
      indexes.find(
        (index) =>
          index.indexname ===
          'PackageEntitlement_packageId_entitlementKey_active_key',
      )?.indexdef,
    ).toContain(`WHERE (status = 'ACTIVE'::"PackageEntitlementStatus")`);

    const constraints = await prisma.$queryRawUnsafe<
      Array<{ conname: string; definition: string }>
    >(
      `
        SELECT con.conname, pg_get_constraintdef(con.oid) AS definition
        FROM pg_constraint con
        WHERE con.conrelid = '"PackageEntitlement"'::regclass
      `,
    );
    expect(constraints).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          conname: 'PackageEntitlement_packageId_fkey',
        }),
      ]),
    );
  });
});

function columnNames(
  columns: Array<{ table_name: string; column_name: string }>,
  table: string,
) {
  return columns
    .filter((column) => column.table_name === table)
    .map((column) => column.column_name);
}

function databaseUrlForDatabase(database: string) {
  const url = new URL(baseDatabaseUrl);
  url.pathname = `/${database}`;
  url.searchParams.delete('schema');
  url.searchParams.delete('options');
  return url.toString();
}
