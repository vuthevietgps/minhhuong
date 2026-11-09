import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ChannelAffiliateService } from './channel-affiliate.service';
import { createChannelAffiliateServiceForTest } from './channel-affiliate.testing';
import {
  apiRoot,
  baseDatabaseUrl,
  databaseUrlForDatabase,
  financialCounts,
  idsOf,
  seedAffiliateFixture,
  seedAffiliateOrderAttributionOrders,
} from './channel-affiliate-migration.integration.spec-fixtures';
import type { AffiliateFixture } from './channel-affiliate-migration.integration.spec-fixtures';

describe('Channel affiliate migration and scope foundation (schema, links and order attribution)', () => {
  jest.setTimeout(120_000);

  const databaseName = `p16_aff_${randomUUID().replace(/-/g, '_')}`;

  let adminPrisma: PrismaClient;

  let prisma: PrismaClient;

  let service: ChannelAffiliateService;

  let fixture: AffiliateFixture;

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

    service = createChannelAffiliateServiceForTest(
      prisma as any,
      {
        get: (key: string) =>
          key === 'AFFILIATE_PUBLIC_BASE_URL'
            ? 'https://go.test.minhhuong'
            : undefined,
      } as any,
    );
    fixture = await seedAffiliateFixture(prisma);
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

  it('deploys AffiliateLink and AffiliateQrAsset schema with enums, indexes, and FKs', async () => {
    const enumValues = await prisma.$queryRawUnsafe<
      Array<{ typname: string; enumlabel: string }>
    >(`
      select pg_type.typname, pg_enum.enumlabel
      from pg_type
      join pg_enum on pg_enum.enumtypid = pg_type.oid
      where pg_type.typname in ('AffiliateLinkStatus', 'AffiliateQrAssetStatus')
      order by pg_type.typname, pg_enum.enumsortorder
    `);
    expect(enumValues).toEqual(
      expect.arrayContaining([
        { typname: 'AffiliateLinkStatus', enumlabel: 'ACTIVE' },
        { typname: 'AffiliateLinkStatus', enumlabel: 'PAUSED' },
        { typname: 'AffiliateLinkStatus', enumlabel: 'EXPIRED' },
        { typname: 'AffiliateLinkStatus', enumlabel: 'REVOKED' },
        { typname: 'AffiliateQrAssetStatus', enumlabel: 'ACTIVE' },
        { typname: 'AffiliateQrAssetStatus', enumlabel: 'PAUSED' },
        { typname: 'AffiliateQrAssetStatus', enumlabel: 'REVOKED' },
      ]),
    );

    const tables = await prisma.$queryRawUnsafe<Array<{ table_name: string }>>(`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
        and table_name in ('AffiliateLink', 'AffiliateQrAsset')
    `);
    expect(tables.map((row) => row.table_name).sort()).toEqual([
      'AffiliateLink',
      'AffiliateQrAsset',
    ]);

    const indexes = await prisma.$queryRawUnsafe<Array<{ indexname: string }>>(`
      select indexname
      from pg_indexes
      where schemaname = 'public'
        and indexname in (
          'AffiliateLink_linkCode_key',
          'AffiliateLink_participantId_status_idx',
          'AffiliateLink_agencyId_status_idx',
          'AffiliateQrAsset_affiliateLinkId_status_idx'
        )
    `);
    expect(indexes.map((row) => row.indexname).sort()).toEqual([
      'AffiliateLink_agencyId_status_idx',
      'AffiliateLink_linkCode_key',
      'AffiliateLink_participantId_status_idx',
      'AffiliateQrAsset_affiliateLinkId_status_idx',
    ]);

    const constraints = await prisma.$queryRawUnsafe<
      Array<{ conname: string }>
    >(`
      select conname
      from pg_constraint
      where conname in (
        'AffiliateLink_participantId_fkey',
        'AffiliateLink_createdById_fkey',
        'AffiliateQrAsset_affiliateLinkId_fkey',
        'AffiliateQrAsset_createdById_fkey'
      )
    `);
    expect(constraints.map((row) => row.conname).sort()).toEqual([
      'AffiliateLink_createdById_fkey',
      'AffiliateLink_participantId_fkey',
      'AffiliateQrAsset_affiliateLinkId_fkey',
      'AffiliateQrAsset_createdById_fkey',
    ]);
  });

  it('deploys the ActivationOrder affiliate attribution snapshot column', async () => {
    const columns = await prisma.$queryRawUnsafe<
      Array<{ column_name: string; udt_name: string }>
    >(`
      select column_name, udt_name
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'ActivationOrder'
        and column_name = 'affiliateAttributionSnapshotJson'
    `);

    expect(columns).toEqual([
      {
        column_name: 'affiliateAttributionSnapshotJson',
        udt_name: 'jsonb',
      },
    ]);
  });

  it('creates sale-owned links with unique linkCode and no financial side effects', async () => {
    const before = await financialCounts(prisma);
    const link = await service.createLink(
      {
        name: '  Sale A summer QR  ',
        campaign: ' summer2026 ',
        channel: ' zalo ',
        placement: ' poster ',
        packageCode: 'ENGLISH_BASIC_12M',
        metadataJson: { source: 'test' },
      },
      fixture.users.saleA,
    );

    expect(link).toEqual(
      expect.objectContaining({
        participantId: fixture.participants.saleA,
        agencyId: fixture.agencies.agencyA,
        agencyMemberId: fixture.members.saleA,
        referralCode: 'P16-SALE-A-REF',
        name: 'Sale A summer QR',
        campaign: 'summer2026',
        status: 'ACTIVE',
      }),
    );
    expect(link.linkCode).toMatch(/^mh_[0-9a-f]{16}$/);
    expect(link.publicUrl).toBe(
      `https://go.test.minhhuong/r/${link.linkCode}?pkg=ENGLISH_BASIC_12M&campaign=summer2026&channel=zalo&placement=poster`,
    );

    await expect(
      prisma.affiliateLink.create({
        data: {
          participantId: fixture.participants.saleA,
          createdById: fixture.userIds.saleAUser,
          linkCode: link.linkCode,
          name: 'Duplicate link code',
        },
      }),
    ).rejects.toThrow();

    await expect(financialCounts(prisma)).resolves.toEqual(before);
  });

  it('lists own/subtree links while hiding sibling links', async () => {
    const saleBLink = await service.createLink(
      { name: 'Sale B link' },
      fixture.users.saleB,
    );

    const saleAList = await service.listLinks(fixture.users.saleA);
    expect(idsOf(saleAList.items)).toEqual(
      expect.arrayContaining([fixture.created.saleALinkId]),
    );
    expect(idsOf(saleAList.items)).not.toContain(saleBLink.id);

    const managerAList = await service.listLinks(fixture.users.managerA);
    expect(idsOf(managerAList.items)).toEqual(
      expect.arrayContaining([fixture.created.saleALinkId]),
    );
    expect(idsOf(managerAList.items)).not.toContain(saleBLink.id);

    const directorList = await service.listLinks(fixture.users.director);
    expect(idsOf(directorList.items)).toEqual(
      expect.arrayContaining([fixture.created.saleALinkId, saleBLink.id]),
    );

    const adminList = await service.listLinks(fixture.users.admin);
    expect(idsOf(adminList.items)).toEqual(
      expect.arrayContaining([fixture.created.saleALinkId, saleBLink.id]),
    );

    await expect(service.listLinks(fixture.users.unscoped)).resolves.toEqual({
      items: [],
    });
  });

  it('reports affiliate-attributed orders from immutable snapshots with filters, pagination, privacy, and read-only safety', async () => {
    const campaign = 'p19-immutable-report';
    await seedAffiliateOrderAttributionOrders(prisma, fixture, campaign);

    await prisma.affiliateLink.update({
      where: { id: fixture.created.saleALinkId },
      data: {
        campaign: 'mutated-current-campaign',
        channel: 'mutated-current-channel',
        placement: 'mutated-current-placement',
        referralCode: 'MUTATED-CURRENT-REF',
      },
    });

    const before = await financialCounts(prisma);
    const firstPage = await service.listOrderAttributions(fixture.users.admin, {
      campaign,
      page: 1,
      pageSize: 1,
    });
    const secondPage = await service.listOrderAttributions(
      fixture.users.admin,
      {
        campaign,
        page: 2,
        pageSize: 1,
      },
    );

    expect(firstPage.total).toBe(2);
    expect(firstPage.totalPages).toBe(2);
    expect(firstPage.hasMore).toBe(true);
    expect(firstPage.items).toHaveLength(1);
    expect(secondPage.items).toHaveLength(1);
    expect(
      [...firstPage.items, ...secondPage.items]
        .map((item) => item.orderId)
        .sort(),
    ).toEqual(['p19-order-a', 'p19-order-b']);
    expect(firstPage.summary.countByStatus).toEqual(
      expect.objectContaining({ APPROVED: 1, WAITING_PAYMENT: 1 }),
    );
    expect(firstPage.summary.approvedOrders).toBe(1);
    expect(firstPage.summary.approvedAmountCents).toBe(5000000);

    const clickFiltered = await service.listOrderAttributions(
      fixture.users.admin,
      {
        clickId: 'clk_aaaaaaaaaaaaaaaaaaaaaaaa',
      },
    );
    expect(clickFiltered.items.map((item) => item.orderId)).toEqual([
      'p19-order-a',
    ]);

    const snapshotFiltered = await service.listOrderAttributions(
      fixture.users.admin,
      {
        participantId: fixture.participants.saleA,
        affiliateLinkId: fixture.created.saleALinkId,
        channel: 'snapshot-channel',
        placement: 'snapshot-placement',
        packageCode: 'P19-PACKAGE',
        clickFrom: '2026-06-13T00:00:00.000Z',
        clickTo: '2026-06-15T00:00:00.000Z',
      },
    );
    expect(snapshotFiltered.items.map((item) => item.orderId)).toEqual([
      'p19-order-a',
    ]);
    expect(snapshotFiltered.items[0].affiliateAttribution).toEqual(
      expect.objectContaining({
        campaign,
        channel: 'snapshot-channel',
        placement: 'snapshot-placement',
        referralCode: 'SNAPSHOT-REF-A',
      }),
    );

    const mutatedCurrentFilter = await service.listOrderAttributions(
      fixture.users.admin,
      { campaign: 'mutated-current-campaign' },
    );
    expect(mutatedCurrentFilter.items).toEqual([]);

    const serialized = JSON.stringify(snapshotFiltered);
    expect(serialized).not.toContain('raw-ip');
    expect(serialized).not.toContain('raw-user-agent');
    expect(serialized).not.toContain('ipHash');
    expect(serialized).not.toContain('userAgentHash');
    expect(serialized).not.toContain('deviceHint');
    expect(serialized).not.toContain('cookie');
    expect(serialized).not.toContain('Authorization');
    expect(serialized).not.toContain('payment-proof.pdf');

    await expect(financialCounts(prisma)).resolves.toEqual(before);
  });

  it('keeps affiliate order attribution report scoped by channel subtree', async () => {
    const campaign = 'p19-scope-report';
    await seedAffiliateOrderAttributionOrders(prisma, fixture, campaign, {
      orderPrefix: 'p19-scope',
    });

    const saleAResult = await service.listOrderAttributions(
      fixture.users.saleA,
      { campaign },
    );
    expect(saleAResult.items.map((item) => item.orderId)).toEqual([
      'p19-scope-order-a',
    ]);

    const saleBResult = await service.listOrderAttributions(
      fixture.users.saleB,
      { campaign },
    );
    expect(saleBResult.items.map((item) => item.orderId)).toEqual([
      'p19-scope-order-b',
    ]);

    const managerAResult = await service.listOrderAttributions(
      fixture.users.managerA,
      { campaign },
    );
    expect(managerAResult.items.map((item) => item.orderId)).toEqual([
      'p19-scope-order-a',
    ]);

    const directorResult = await service.listOrderAttributions(
      fixture.users.director,
      { campaign },
    );
    expect(directorResult.items.map((item) => item.orderId).sort()).toEqual([
      'p19-scope-order-a',
      'p19-scope-order-b',
    ]);

    const adminResult = await service.listOrderAttributions(
      fixture.users.admin,
      {
        campaign,
      },
    );
    expect(adminResult.items.map((item) => item.orderId).sort()).toEqual([
      'p19-scope-order-a',
      'p19-scope-order-b',
    ]);

    const outOfScopeFilter = await service.listOrderAttributions(
      fixture.users.saleA,
      {
        campaign,
        participantId: fixture.participants.saleB,
      },
    );
    expect(outOfScopeFilter.items).toEqual([]);

    await expect(
      service.listOrderAttributions(fixture.users.unscoped, { campaign }),
    ).resolves.toEqual(
      expect.objectContaining({
        items: [],
        total: 0,
      }),
    );
  });

  it('rejects invalid affiliate order attribution report query values', async () => {
    await expect(
      service.listOrderAttributions(fixture.users.admin, {
        createdFrom: 'not-a-date',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.listOrderAttributions(fixture.users.admin, {
        clickTo: 'not-a-date',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.listOrderAttributions(fixture.users.admin, {
        page: 0,
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.listOrderAttributions(fixture.users.admin, {
        pageSize: 101,
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('allows scoped update and blocks sibling mutation without deleting links', async () => {
    const updated = await service.updateLink(
      fixture.created.saleALinkId,
      {
        status: 'PAUSED',
        name: 'Paused sale A link',
        expiresAt: '2026-07-14T00:00:00.000Z',
      },
      fixture.users.saleA,
    );
    expect(updated.status).toBe('PAUSED');
    expect(updated.name).toBe('Paused sale A link');

    await expect(
      service.updateLink(
        fixture.created.saleALinkId,
        { status: 'REVOKED' },
        fixture.users.saleB,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    await expect(
      service.updateLink(
        fixture.created.saleALinkId,
        {
          startsAt: '2026-08-01T00:00:00.000Z',
          expiresAt: '2026-07-01T00:00:00.000Z',
        },
        fixture.users.saleA,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(prisma.affiliateLink.count()).resolves.toBeGreaterThanOrEqual(
      2,
    );
  });
});
