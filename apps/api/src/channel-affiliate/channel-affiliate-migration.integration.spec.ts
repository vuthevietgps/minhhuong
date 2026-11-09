import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import type { AuthenticatedUser } from '../auth/auth.types';
import { ChannelAffiliateController } from './channel-affiliate.controller';
import { ChannelAffiliateService } from './channel-affiliate.service';
import { createChannelAffiliateServiceForTest } from './channel-affiliate.testing';

const apiRoot = process.cwd().endsWith(`${join('apps', 'api')}`)
  ? process.cwd()
  : join(process.cwd(), 'apps', 'api');

config({ path: join(apiRoot, '../../.env') });
config({ path: join(apiRoot, '.env') });

const baseDatabaseUrl =
  process.env.DATABASE_URL ??
  'postgresql://minhhuong:minhhuong@localhost:5432/minhhuong?schema=public';

type AffiliateFixture = Awaited<ReturnType<typeof seedAffiliateFixture>>;

const listExportHeader =
  'orderId,orderStatus,orderCreatedAt,approvedAmountCents,approvedCurrency,clickId,affiliateLinkId,affiliateQrAssetId,participantId,agencyId,agencyMemberId,referralCode,campaign,channel,placement,packageCode,clickCreatedAt,orderSnapshottedAt,attributionModel,matchConfidence,attributionWindowDays';

const aggregateExportHeader =
  'groupBy,snapshotField,key,totalAttributedOrders,approvedOrders,countByStatus,approvedAmountCentsByCurrency,approvedAmountCents,firstOrderCreatedAt,lastOrderCreatedAt';

const commissionListExportHeader =
  'commissionEarningId,activationOrderId,orderStatus,orderCreatedAt,orderApprovedAt,participantId,beneficiaryType,beneficiaryId,depth,status,baseAmountCents,rateBps,amountCents,currency,availableAt,createdAt,updatedAt,affiliateProofSource,affiliateParticipantId,agencyId,agencyMemberId,referralCode,affiliateLinkId,affiliateQrAssetId,campaign,channel,placement,packageCode,clickId,clickCreatedAt,orderSnapshottedAt,commissionChainSnapshotStatus,chainPolicyVersion,chainRootParticipantId,chainDepth,chainSnapshotStatus';

const commissionAggregateExportHeader =
  'groupBy,key,totalCommissions,pendingCommissions,releasedCommissions,revokedCommissions,availableCommissions,countByStatus,totalAmountCentsByCurrency,pendingAmountCentsByCurrency,releasedAmountCentsByCurrency,availableAmountCentsByCurrency,totalAmountCents,firstCommissionCreatedAt,lastCommissionCreatedAt';

describe('Channel affiliate migration and scope foundation', () => {
  jest.setTimeout(120_000);

  const databaseName = `p16_aff_${randomUUID().replace(/-/g, '_')}`;
  let adminPrisma: PrismaClient;
  let prisma: PrismaClient;
  let service: ChannelAffiliateService;
  let controller: ChannelAffiliateController;
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
    controller = new ChannelAffiliateController(service);
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

  it('aggregates affiliate order attribution snapshots by supported dimensions without leaking mutable or private data', async () => {
    const campaign = 'p20-aggregate-report';
    const orderPrefix = 'p20-aggregate';
    await seedAffiliateOrderAttributionOrders(prisma, fixture, campaign, {
      orderPrefix,
    });

    await prisma.affiliateLink.update({
      where: { id: fixture.created.saleALinkId },
      data: {
        campaign: 'p20-mutated-current-campaign',
        channel: 'p20-mutated-current-channel',
        placement: 'p20-mutated-current-placement',
        referralCode: 'P20-MUTATED-CURRENT-REF',
      },
    });

    const before = await financialCounts(prisma);
    const participantAggregate = await service.listOrderAttributionAggregates(
      fixture.users.admin,
      {
        groupBy: 'participant',
        campaign,
        sortBy: 'lastOrderCreatedAt',
        sortDirection: 'asc',
        limit: 10,
      } as any,
    );

    expect(participantAggregate.groupBy).toBe('participant');
    expect(participantAggregate.snapshotField).toBe('participantId');
    expect(participantAggregate.totalGroups).toBe(2);
    expect(participantAggregate.summary).toEqual({
      totalAttributedOrders: 2,
      approvedOrders: 1,
      countByStatus: { APPROVED: 1, WAITING_PAYMENT: 1 },
      approvedAmountCentsByCurrency: { VND: 5000000 },
      approvedAmountCents: 5000000,
    });

    expect(
      aggregateItemByKey(participantAggregate, fixture.participants.saleA),
    ).toEqual(
      expect.objectContaining({
        key: fixture.participants.saleA,
        totalAttributedOrders: 1,
        approvedOrders: 1,
        countByStatus: { APPROVED: 1 },
        approvedAmountCentsByCurrency: { VND: 5000000 },
        approvedAmountCents: 5000000,
        firstOrderCreatedAt: '2026-06-14T03:00:00.000Z',
        lastOrderCreatedAt: '2026-06-14T03:00:00.000Z',
      }),
    );
    expect(
      aggregateItemByKey(participantAggregate, fixture.participants.saleB),
    ).toEqual(
      expect.objectContaining({
        key: fixture.participants.saleB,
        totalAttributedOrders: 1,
        approvedOrders: 0,
        countByStatus: { WAITING_PAYMENT: 1 },
        approvedAmountCentsByCurrency: {},
        approvedAmountCents: 0,
      }),
    );

    const campaignAggregate = await service.listOrderAttributionAggregates(
      fixture.users.admin,
      {
        groupBy: 'campaign',
        campaign,
      } as any,
    );
    expect(aggregateItemByKey(campaignAggregate, campaign)).toEqual(
      expect.objectContaining({
        totalAttributedOrders: 2,
        approvedOrders: 1,
        approvedAmountCentsByCurrency: { VND: 5000000 },
      }),
    );

    const linkAggregate = await service.listOrderAttributionAggregates(
      fixture.users.admin,
      {
        groupBy: 'affiliateLink',
        campaign,
        clickId: 'clk_aaaaaaaaaaaaaaaaaaaaaaaa',
      } as any,
    );
    expect(linkAggregate.items).toHaveLength(1);
    expect(linkAggregate.items[0]).toEqual(
      expect.objectContaining({
        key: fixture.created.saleALinkId,
        totalAttributedOrders: 1,
        approvedOrders: 1,
      }),
    );

    const qrAggregate = await service.listOrderAttributionAggregates(
      fixture.users.admin,
      {
        groupBy: 'affiliateQrAsset',
        campaign,
      } as any,
    );
    expect(aggregateItemByKey(qrAggregate, `${orderPrefix}-qr`)).toEqual(
      expect.objectContaining({ totalAttributedOrders: 1, approvedOrders: 1 }),
    );
    expect(aggregateItemByKey(qrAggregate, null)).toEqual(
      expect.objectContaining({ totalAttributedOrders: 1, approvedOrders: 0 }),
    );

    await expect(
      service.listOrderAttributionAggregates(fixture.users.admin, {
        groupBy: 'agency',
        agencyId: fixture.agencies.agencyA,
        campaign,
      } as any),
    ).resolves.toEqual(
      expect.objectContaining({
        items: [
          expect.objectContaining({
            key: fixture.agencies.agencyA,
            totalAttributedOrders: 1,
          }),
        ],
      }),
    );

    await expect(
      service.listOrderAttributionAggregates(fixture.users.admin, {
        groupBy: 'agencyMember',
        agencyMemberId: fixture.members.saleA,
        campaign,
      } as any),
    ).resolves.toEqual(
      expect.objectContaining({
        items: [
          expect.objectContaining({
            key: fixture.members.saleA,
            totalAttributedOrders: 1,
          }),
        ],
      }),
    );

    for (const [groupBy, key] of [
      ['channel', 'snapshot-channel'],
      ['placement', 'snapshot-placement'],
      ['package', 'P19-PACKAGE'],
    ]) {
      const filteredAggregate = await service.listOrderAttributionAggregates(
        fixture.users.admin,
        {
          groupBy,
          campaign,
          [groupBy === 'package' ? 'packageCode' : groupBy]: key,
        } as any,
      );
      expect(aggregateItemByKey(filteredAggregate, key)).toEqual(
        expect.objectContaining({
          totalAttributedOrders: 1,
          approvedOrders: 1,
        }),
      );
    }

    const mutatedCurrentAggregate =
      await service.listOrderAttributionAggregates(fixture.users.admin, {
        groupBy: 'campaign',
        campaign: 'p20-mutated-current-campaign',
      } as any);
    expect(mutatedCurrentAggregate).toEqual(
      expect.objectContaining({
        items: [],
        totalGroups: 0,
        summary: {
          totalAttributedOrders: 0,
          approvedOrders: 0,
          countByStatus: {},
          approvedAmountCentsByCurrency: {},
          approvedAmountCents: 0,
        },
      }),
    );

    const serialized = JSON.stringify(participantAggregate);
    expect(serialized).not.toContain('raw-ip');
    expect(serialized).not.toContain('raw-user-agent');
    expect(serialized).not.toContain('ipHash');
    expect(serialized).not.toContain('userAgentHash');
    expect(serialized).not.toContain('deviceHint');
    expect(serialized).not.toContain('cookie');
    expect(serialized).not.toContain('Authorization');
    expect(serialized).not.toContain('payment-proof.pdf');
    expect(serialized).not.toContain(`${orderPrefix}-a@example.com`);

    await expect(financialCounts(prisma)).resolves.toEqual(before);
  });

  it('keeps affiliate order attribution aggregates scoped by channel subtree', async () => {
    const campaign = 'p20-scope-aggregate';
    await seedAffiliateOrderAttributionOrders(prisma, fixture, campaign, {
      orderPrefix: 'p20-scope',
    });

    const saleAResult = await service.listOrderAttributionAggregates(
      fixture.users.saleA,
      { groupBy: 'participant', campaign } as any,
    );
    expect(saleAResult.items.map((item) => item.key)).toEqual([
      fixture.participants.saleA,
    ]);
    expect(saleAResult.summary.totalAttributedOrders).toBe(1);

    const saleBResult = await service.listOrderAttributionAggregates(
      fixture.users.saleB,
      { groupBy: 'participant', campaign } as any,
    );
    expect(saleBResult.items.map((item) => item.key)).toEqual([
      fixture.participants.saleB,
    ]);

    const managerAResult = await service.listOrderAttributionAggregates(
      fixture.users.managerA,
      { groupBy: 'participant', campaign } as any,
    );
    expect(managerAResult.items.map((item) => item.key)).toEqual([
      fixture.participants.saleA,
    ]);

    const directorResult = await service.listOrderAttributionAggregates(
      fixture.users.director,
      { groupBy: 'participant', campaign } as any,
    );
    expect(directorResult.items.map((item) => item.key).sort()).toEqual([
      fixture.participants.saleA,
      fixture.participants.saleB,
    ]);

    const adminResult = await service.listOrderAttributionAggregates(
      fixture.users.admin,
      { groupBy: 'participant', campaign } as any,
    );
    expect(adminResult.items.map((item) => item.key).sort()).toEqual([
      fixture.participants.saleA,
      fixture.participants.saleB,
    ]);

    const outOfScopeFilter = await service.listOrderAttributionAggregates(
      fixture.users.saleA,
      {
        groupBy: 'participant',
        campaign,
        participantId: fixture.participants.saleB,
      } as any,
    );
    expect(outOfScopeFilter.items).toEqual([]);
    expect(outOfScopeFilter.summary.totalAttributedOrders).toBe(0);

    await expect(
      service.listOrderAttributionAggregates(fixture.users.unscoped, {
        groupBy: 'participant',
        campaign,
      } as any),
    ).resolves.toEqual(
      expect.objectContaining({
        items: [],
        summary: expect.objectContaining({
          totalAttributedOrders: 0,
        }),
      }),
    );
  });

  it('rejects invalid affiliate order attribution aggregate query values', async () => {
    await expect(
      service.listOrderAttributionAggregates(fixture.users.admin, {} as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.listOrderAttributionAggregates(fixture.users.admin, {
        groupBy: 'bad-dimension',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.listOrderAttributionAggregates(fixture.users.admin, {
        groupBy: 'participant',
        limit: 0,
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.listOrderAttributionAggregates(fixture.users.admin, {
        groupBy: 'participant',
        sortBy: 'customerEmail',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.listOrderAttributionAggregates(fixture.users.admin, {
        groupBy: 'participant',
        sortDirection: 'sideways',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.listOrderAttributionAggregates(fixture.users.admin, {
        groupBy: 'participant',
        clickFrom: 'not-a-date',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('exports affiliate attribution list and aggregate CSV from immutable snapshots safely', async () => {
    const campaign = 'p21 export, "quoted"\nline';
    const orderPrefix = 'p21-export';
    await seedAffiliateOrderAttributionOrders(prisma, fixture, campaign, {
      orderPrefix,
    });
    await seedAdditionalApprovedAffiliateOrder(prisma, fixture, {
      id: `${orderPrefix}-order-usd`,
      campaign,
      amountCents: 1234,
      currency: 'USD',
      clickId: 'clk_p21_usd_export',
      createdAt: new Date('2026-06-14T06:00:00.000Z'),
      packageCode: 'P21-USD',
    });

    await prisma.affiliateLink.update({
      where: { id: fixture.created.saleALinkId },
      data: {
        campaign: 'p21-mutated-current-campaign',
        channel: 'p21-mutated-current-channel',
        placement: 'p21-mutated-current-placement',
        referralCode: 'P21-MUTATED-CURRENT-REF',
      },
    });

    const before = await financialCounts(prisma);
    const listCsv = await service.exportOrderAttributionsCsv(
      fixture.users.admin,
      { campaign, limit: 10 },
    );
    const aggregateCsv = await service.exportOrderAttributionAggregatesCsv(
      fixture.users.admin,
      { groupBy: 'campaign', campaign } as any,
    );

    expect(listCsv.startsWith(`${listExportHeader}\r\n`)).toBe(true);
    expect(listCsv).toContain(`${orderPrefix}-order-a`);
    expect(listCsv).toContain(`${orderPrefix}-order-b`);
    expect(listCsv).toContain(`${orderPrefix}-order-usd`);
    expect(listCsv).toContain('"p21 export, ""quoted""\nline"');
    expect(listCsv).toContain(',5000000,VND,');
    expect(listCsv).toContain(',1234,USD,');
    expect(listCsv).not.toContain(`${orderPrefix}-plain@example.com`);
    expect(listCsv).not.toContain(`${orderPrefix}-a@example.com`);
    expect(listCsv).not.toContain('raw-ip');
    expect(listCsv).not.toContain('raw-user-agent');
    expect(listCsv).not.toContain('ipHash');
    expect(listCsv).not.toContain('userAgentHash');
    expect(listCsv).not.toContain('deviceHint');
    expect(listCsv).not.toContain('cookie');
    expect(listCsv).not.toContain('Authorization');
    expect(listCsv).not.toContain('payment-proof.pdf');

    expect(aggregateCsv.startsWith(`${aggregateExportHeader}\r\n`)).toBe(true);
    expect(aggregateCsv).toContain('"p21 export, ""quoted""\nline"');
    expect(aggregateCsv).toContain('"{""APPROVED"":2,""WAITING_PAYMENT"":1}"');
    expect(aggregateCsv).toContain('"{""USD"":1234,""VND"":5000000}"');
    expect(aggregateCsv).toContain(',null,');
    expect(aggregateCsv).not.toContain(`${orderPrefix}-a@example.com`);
    expect(aggregateCsv).not.toContain('raw-ip');
    expect(aggregateCsv).not.toContain('payment-proof.pdf');

    const mutatedListCsv = await service.exportOrderAttributionsCsv(
      fixture.users.admin,
      { campaign: 'p21-mutated-current-campaign', limit: 10 },
    );
    expect(mutatedListCsv).toBe(`${listExportHeader}\r\n`);

    const mutatedAggregateCsv =
      await service.exportOrderAttributionAggregatesCsv(fixture.users.admin, {
        groupBy: 'campaign',
        campaign: 'p21-mutated-current-campaign',
      } as any);
    expect(mutatedAggregateCsv).toBe(`${aggregateExportHeader}\r\n`);

    const response = { setHeader: jest.fn() };
    const controllerCsv = await controller.exportOrderAttributionsCsv(
      fixture.users.admin,
      { campaign, limit: 1 },
      response as any,
    );
    expect(response.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'text/csv; charset=utf-8',
    );
    expect(response.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="affiliate-order-attributions.csv"',
    );
    expect(controllerCsv.startsWith(`${listExportHeader}\r\n`)).toBe(true);

    await expect(financialCounts(prisma)).resolves.toEqual(before);
  });

  it('keeps affiliate attribution CSV exports scoped by channel subtree', async () => {
    const campaign = 'p21-scope-export';
    await seedAffiliateOrderAttributionOrders(prisma, fixture, campaign, {
      orderPrefix: 'p21-scope',
    });

    const saleAListCsv = await service.exportOrderAttributionsCsv(
      fixture.users.saleA,
      { campaign },
    );
    expect(saleAListCsv).toContain('p21-scope-order-a');
    expect(saleAListCsv).not.toContain('p21-scope-order-b');

    const saleBListCsv = await service.exportOrderAttributionsCsv(
      fixture.users.saleB,
      { campaign },
    );
    expect(saleBListCsv).toContain('p21-scope-order-b');
    expect(saleBListCsv).not.toContain('p21-scope-order-a');

    const managerAAggregateCsv =
      await service.exportOrderAttributionAggregatesCsv(
        fixture.users.managerA,
        {
          groupBy: 'participant',
          campaign,
        } as any,
      );
    expect(managerAAggregateCsv).toContain(fixture.participants.saleA);
    expect(managerAAggregateCsv).not.toContain(fixture.participants.saleB);

    const directorAggregateCsv =
      await service.exportOrderAttributionAggregatesCsv(
        fixture.users.director,
        {
          groupBy: 'participant',
          campaign,
        } as any,
      );
    expect(directorAggregateCsv).toContain(fixture.participants.saleA);
    expect(directorAggregateCsv).toContain(fixture.participants.saleB);

    const adminListCsv = await service.exportOrderAttributionsCsv(
      fixture.users.admin,
      { campaign },
    );
    expect(adminListCsv).toContain('p21-scope-order-a');
    expect(adminListCsv).toContain('p21-scope-order-b');

    const outOfScopeListCsv = await service.exportOrderAttributionsCsv(
      fixture.users.saleA,
      {
        campaign,
        participantId: fixture.participants.saleB,
      },
    );
    expect(outOfScopeListCsv).toBe(`${listExportHeader}\r\n`);

    await expect(
      service.exportOrderAttributionAggregatesCsv(fixture.users.unscoped, {
        groupBy: 'participant',
        campaign,
      } as any),
    ).resolves.toBe(`${aggregateExportHeader}\r\n`);
  });

  it('rejects invalid affiliate attribution CSV export query values', async () => {
    await expect(
      service.exportOrderAttributionsCsv(fixture.users.admin, {
        limit: 0,
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.exportOrderAttributionsCsv(fixture.users.admin, {
        limit: 1001,
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.exportOrderAttributionsCsv(fixture.users.admin, {
        createdFrom: 'not-a-date',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.exportOrderAttributionAggregatesCsv(
        fixture.users.admin,
        {} as any,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.exportOrderAttributionAggregatesCsv(fixture.users.admin, {
        groupBy: 'participant',
        limit: 101,
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.exportOrderAttributionAggregatesCsv(fixture.users.admin, {
        groupBy: 'bad-dimension',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('audits affiliate report and export access with safe metadata and admin operations read access', async () => {
    const campaign = 'p22-report-access-audit';
    const orderPrefix = 'p22-audit';
    await seedAffiliateOrderAttributionOrders(prisma, fixture, campaign, {
      orderPrefix,
    });

    const before = await financialCounts(prisma);
    const startedAt = new Date();

    const listResult = await service.listOrderAttributions(
      fixture.users.admin,
      {
        campaign,
        pageSize: 10,
        Authorization: 'should-not-be-audited',
        cookie: 'should-not-be-audited',
        rawIp: 'raw-ip-should-not-be-audited',
        customerEmail: `${orderPrefix}-a@example.com`,
        paymentProofUrl: 'payment-proof.pdf',
      } as any,
    );
    const aggregateResult = await service.listOrderAttributionAggregates(
      fixture.users.admin,
      {
        groupBy: 'campaign',
        campaign,
        sortBy: 'totalAttributedOrders',
        sortDirection: 'desc',
        limit: 5,
      } as any,
    );
    const listCsv = await service.exportOrderAttributionsCsv(
      fixture.users.admin,
      { campaign, limit: 10 },
    );
    const aggregateCsv = await service.exportOrderAttributionAggregatesCsv(
      fixture.users.admin,
      { groupBy: 'campaign', campaign, limit: 5 } as any,
    );
    const endedAt = new Date();

    expect(listResult.items).toHaveLength(2);
    expect(aggregateResult.items).toHaveLength(1);
    expect(listCsv).toContain(`${orderPrefix}-order-a`);
    expect(aggregateCsv).toContain(campaign);

    const auditRows = await affiliateReportAccessAuditsForCampaign(
      prisma,
      campaign,
    );
    expect(auditRows).toHaveLength(4);

    expect(auditRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userId: fixture.userIds.adminUser,
          entityType: 'AffiliateReportAccessAudit',
          entityId: 'ORDER_ATTRIBUTION_LIST:JSON',
          metadata: expect.objectContaining({
            actorUserId: fixture.userIds.adminUser,
            actorRoles: ['ADMIN'],
            route: '/v1/channel-affiliate/order-attributions',
            reportType: 'ORDER_ATTRIBUTION_LIST',
            format: 'JSON',
            rowCount: 2,
            safeFilterSummary: { campaign, pageSize: 10 },
          }),
        }),
        expect.objectContaining({
          entityId: 'ORDER_ATTRIBUTION_AGGREGATE:JSON',
          metadata: expect.objectContaining({
            route: '/v1/channel-affiliate/order-attributions/aggregates',
            reportType: 'ORDER_ATTRIBUTION_AGGREGATE',
            format: 'JSON',
            rowCount: 1,
            safeFilterSummary: {
              campaign,
              groupBy: 'campaign',
              limit: 5,
              sortBy: 'totalAttributedOrders',
              sortDirection: 'desc',
            },
          }),
        }),
        expect.objectContaining({
          entityId: 'ORDER_ATTRIBUTION_LIST:CSV',
          metadata: expect.objectContaining({
            route: '/v1/channel-affiliate/order-attributions/export.csv',
            reportType: 'ORDER_ATTRIBUTION_LIST',
            format: 'CSV',
            rowCount: 2,
            safeFilterSummary: { campaign, limit: 10 },
          }),
        }),
        expect.objectContaining({
          entityId: 'ORDER_ATTRIBUTION_AGGREGATE:CSV',
          metadata: expect.objectContaining({
            route:
              '/v1/channel-affiliate/order-attributions/aggregates/export.csv',
            reportType: 'ORDER_ATTRIBUTION_AGGREGATE',
            format: 'CSV',
            rowCount: 1,
            safeFilterSummary: { campaign, groupBy: 'campaign', limit: 5 },
          }),
        }),
      ]),
    );

    for (const row of auditRows) {
      expect(row.createdAt.getTime()).toBeGreaterThanOrEqual(
        startedAt.getTime(),
      );
      expect(row.createdAt.getTime()).toBeLessThanOrEqual(endedAt.getTime());
      const serialized = JSON.stringify(row);
      expect(serialized).not.toContain('should-not-be-audited');
      expect(serialized).not.toContain('raw-ip');
      expect(serialized).not.toContain('raw-user-agent');
      expect(serialized).not.toContain('ipHash');
      expect(serialized).not.toContain('userAgentHash');
      expect(serialized).not.toContain('deviceHint');
      expect(serialized).not.toContain('cookie');
      expect(serialized).not.toContain('Authorization');
      expect(serialized).not.toContain(`${orderPrefix}-a@example.com`);
      expect(serialized).not.toContain('payment-proof.pdf');
      expect(serialized).not.toContain(listExportHeader);
      expect(serialized).not.toContain(aggregateExportHeader);
      expect(serialized).not.toContain(`${orderPrefix}-order-a`);
    }

    const readResult = await service.listReportAccessAudits(fixture.users.ops, {
      reportType: 'ORDER_ATTRIBUTION_LIST',
      format: 'CSV',
      actorUserId: fixture.userIds.adminUser,
      createdFrom: startedAt.toISOString(),
      createdTo: endedAt.toISOString(),
      page: 1,
      pageSize: 10,
    } as any);
    expect(readResult.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorUserId: fixture.userIds.adminUser,
          actorRoles: ['ADMIN'],
          route: '/v1/channel-affiliate/order-attributions/export.csv',
          reportType: 'ORDER_ATTRIBUTION_LIST',
          format: 'CSV',
          rowCount: 2,
          safeFilterSummary: { campaign, limit: 10 },
          scopeSummary: { roles: ['ADMIN'], isGlobalManager: true },
        }),
      ]),
    );
    expect(readResult.total).toBe(1);
    expect(readResult.items[0].createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    const readSerialized = JSON.stringify(readResult);
    expect(readSerialized).not.toContain(`${orderPrefix}-a@example.com`);
    expect(readSerialized).not.toContain('payment-proof.pdf');
    expect(readSerialized).not.toContain(listExportHeader);

    await expect(
      service.listReportAccessAudits(fixture.users.saleA, {} as any),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.listReportAccessAudits(fixture.users.director, {} as any),
    ).rejects.toBeInstanceOf(ForbiddenException);

    await expect(financialCounts(prisma)).resolves.toEqual(before);
  });

  it('reports affiliate commissions from immutable proof with filters, scope, privacy, legacy status, and read-only safety', async () => {
    const campaign = 'p25-affiliate-commission-report';
    await seedAffiliateCommissionRows(prisma, fixture, campaign);

    await prisma.affiliateLink.update({
      where: { id: fixture.created.saleALinkId },
      data: {
        campaign: 'p25-mutated-current-campaign',
        channel: 'p25-mutated-current-channel',
        placement: 'p25-mutated-current-placement',
        referralCode: 'P25-MUTATED-REF',
      },
    });

    const before = await financialCounts(prisma);
    const startedAt = new Date();

    const filtered = await service.listCommissions(fixture.users.admin, {
      affiliateLinkId: fixture.created.saleALinkId,
      affiliateQrAssetId: 'p25-qr-a',
      agencyId: fixture.agencies.agencyA,
      agencyMemberId: fixture.members.saleA,
      clickId: 'clk_bbbbbbbbbbbbbbbbbbbbbbbb',
      campaign,
      channel: 'p25-channel-a',
      placement: 'p25-placement-a',
      packageCode: 'P25-PACKAGE-A',
      commissionStatus: 'PENDING',
      currency: 'VND',
      participantId: fixture.participants.saleA,
      beneficiaryType: 'SALE',
      beneficiaryId: fixture.userIds.saleAUser,
      commissionChainSnapshotStatus: 'frozen',
      createdFrom: '2026-06-15T00:00:00.000Z',
      createdTo: '2026-06-15T23:59:59.000Z',
      availableFrom: '2026-06-20T00:00:00.000Z',
      availableTo: '2026-06-20T23:59:59.000Z',
      approvedFrom: '2026-06-15T00:00:00.000Z',
      approvedTo: '2026-06-15T23:59:59.000Z',
      page: 1,
      pageSize: 50,
    } as any);

    expect(filtered.total).toBe(1);
    expect(filtered.items[0]).toEqual(
      expect.objectContaining({
        commissionEarningId: 'p25-earning-sale-a',
        activationOrderId: 'p25-order-a',
        orderStatus: 'APPROVED',
        participantId: fixture.participants.saleA,
        beneficiaryType: 'SALE',
        beneficiaryId: fixture.userIds.saleAUser,
        depth: 0,
        status: 'PENDING',
        baseAmountCents: 10000000,
        rateBps: 4000,
        amountCents: 4000000,
        currency: 'VND',
        updatedAt: null,
      }),
    );
    expect(filtered.items[0].affiliateProof).toEqual(
      expect.objectContaining({
        source: 'affiliate_order_snapshot',
        participantId: fixture.participants.saleA,
        agencyId: fixture.agencies.agencyA,
        agencyMemberId: fixture.members.saleA,
        referralCode: 'P25-SNAPSHOT-REF-A',
        affiliateLinkId: fixture.created.saleALinkId,
        affiliateQrAssetId: 'p25-qr-a',
        campaign,
        channel: 'p25-channel-a',
        placement: 'p25-placement-a',
        packageCode: 'P25-PACKAGE-A',
        clickId: 'clk_bbbbbbbbbbbbbbbbbbbbbbbb',
        commissionChainSnapshotStatus: 'frozen',
      }),
    );
    expect(filtered.items[0].chainProof).toEqual(
      expect.objectContaining({
        policyVersion: 'commission_chain_v1',
        rootParticipantId: fixture.participants.saleA,
        depth: 0,
        chainSource: 'affiliate_order_snapshot',
        snapshotStatus: 'frozen',
        participantId: fixture.participants.saleA,
        beneficiaryId: fixture.userIds.saleAUser,
        rateBps: 4000,
      }),
    );

    const legacy = await service.listCommissions(fixture.users.admin, {
      campaign,
      commissionChainSnapshotStatus: 'legacy_missing',
    });
    expect(legacy.items.map((item) => item.commissionEarningId)).toEqual([
      'p25-earning-legacy-a',
    ]);
    expect(legacy.items[0].chainProof.snapshotStatus).toBe('legacy_missing');

    const sortedPage1 = await service.listCommissions(fixture.users.admin, {
      campaign,
      sortBy: 'amountCents',
      sortDirection: 'asc',
      page: 1,
      pageSize: 1,
    } as any);
    const sortedPage2 = await service.listCommissions(fixture.users.admin, {
      campaign,
      sortBy: 'amountCents',
      sortDirection: 'asc',
      page: 2,
      pageSize: 1,
    } as any);
    expect(sortedPage1.total).toBe(4);
    expect(sortedPage1.items[0].commissionEarningId).toBe(
      'p25-earning-legacy-a',
    );
    expect(sortedPage2.items[0].commissionEarningId).toBe(
      'p25-earning-manager-a',
    );

    const saleAResult = await service.listCommissions(fixture.users.saleA, {
      campaign,
    });
    expect(
      saleAResult.items.map((item) => item.commissionEarningId).sort(),
    ).toEqual(['p25-earning-legacy-a', 'p25-earning-sale-a']);

    const saleBResult = await service.listCommissions(fixture.users.saleB, {
      campaign,
    });
    expect(saleBResult.items.map((item) => item.commissionEarningId)).toEqual([
      'p25-earning-sale-b',
    ]);

    const managerAResult = await service.listCommissions(
      fixture.users.managerA,
      {
        campaign,
      },
    );
    expect(
      managerAResult.items.map((item) => item.commissionEarningId).sort(),
    ).toEqual([
      'p25-earning-legacy-a',
      'p25-earning-manager-a',
      'p25-earning-sale-a',
    ]);

    const directorResult = await service.listCommissions(
      fixture.users.director,
      {
        campaign,
      },
    );
    expect(
      directorResult.items.map((item) => item.commissionEarningId).sort(),
    ).toEqual([
      'p25-earning-legacy-a',
      'p25-earning-manager-a',
      'p25-earning-sale-a',
      'p25-earning-sale-b',
    ]);

    const opsResult = await service.listCommissions(fixture.users.ops, {
      campaign,
    });
    expect(opsResult.total).toBe(4);

    const outOfScopeFilter = await service.listCommissions(
      fixture.users.saleA,
      {
        campaign,
        participantId: fixture.participants.saleB,
      },
    );
    expect(outOfScopeFilter.items).toEqual([]);

    await expect(
      service.listCommissions(fixture.users.unscoped, { campaign } as any),
    ).resolves.toEqual(expect.objectContaining({ items: [], total: 0 }));

    const mutatedCurrentFilter = await service.listCommissions(
      fixture.users.admin,
      { campaign: 'p25-mutated-current-campaign' },
    );
    expect(mutatedCurrentFilter.items).toEqual([]);

    const controllerResult = await controller.listCommissions(
      fixture.users.admin,
      { campaign, pageSize: 2 },
    );
    expect(controllerResult.items).toHaveLength(2);

    const endedAt = new Date();
    const serialized = JSON.stringify({
      filtered,
      legacy,
      sortedPage1,
      saleAResult,
      controllerResult,
    });
    expect(serialized).not.toContain('p25-a@example.com');
    expect(serialized).not.toContain('0900000000');
    expect(serialized).not.toContain('raw-ip');
    expect(serialized).not.toContain('raw-user-agent');
    expect(serialized).not.toContain('ipHash');
    expect(serialized).not.toContain('userAgentHash');
    expect(serialized).not.toContain('deviceHint');
    expect(serialized).not.toContain('cookie');
    expect(serialized).not.toContain('Authorization');
    expect(serialized).not.toContain('payment-proof.pdf');
    expect(serialized).not.toContain('payoutInvoiceUrl');
    expect(serialized).not.toContain('report body');

    const auditRead = await service.listReportAccessAudits(fixture.users.ops, {
      reportType: 'AFFILIATE_COMMISSION_LIST',
      format: 'JSON',
      createdFrom: startedAt.toISOString(),
      createdTo: endedAt.toISOString(),
      page: 1,
      pageSize: 20,
    } as any);
    expect(auditRead.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reportType: 'AFFILIATE_COMMISSION_LIST',
          format: 'JSON',
          route: '/v1/channel-affiliate/commissions',
          safeFilterSummary: expect.objectContaining({ campaign }),
        }),
      ]),
    );
    expect(JSON.stringify(auditRead)).not.toContain('p25-a@example.com');
    expect(JSON.stringify(auditRead)).not.toContain('payment-proof.pdf');

    await expect(financialCounts(prisma)).resolves.toEqual(before);
  });

  it('aggregates affiliate commissions from immutable proof with scope, currency safety, privacy, audit, and read-only behavior', async () => {
    const campaign = 'p26-affiliate-commission-aggregate';
    await seedAffiliateCommissionRows(prisma, fixture, campaign, {
      prefix: 'p26',
      includeAggregateCurrencyRows: true,
    });

    await prisma.affiliateLink.update({
      where: { id: fixture.created.saleALinkId },
      data: {
        campaign: 'p26-mutated-current-campaign',
        channel: 'p26-mutated-current-channel',
        placement: 'p26-mutated-current-placement',
        referralCode: 'P26-MUTATED-REF',
      },
    });

    const before = await financialCounts(prisma);
    const startedAt = new Date();
    const participantAggregate = await service.listCommissionAggregates(
      fixture.users.admin,
      {
        groupBy: 'participant',
        campaign,
        sortBy: 'lastCommissionCreatedAt',
        sortDirection: 'asc',
        limit: 10,
      } as any,
    );

    expect(participantAggregate.groupBy).toBe('participant');
    expect(participantAggregate.sourceField).toBe('participantId');
    expect(participantAggregate.totalGroups).toBe(3);
    expect(participantAggregate.summary).toEqual({
      totalCommissions: 6,
      countByStatus: { AVAILABLE: 2, CANCELED: 1, PENDING: 3 },
      pendingCommissions: 3,
      releasedCommissions: 2,
      revokedCommissions: 1,
      availableCommissions: 2,
      totalAmountCentsByCurrency: { USD: 2500, VND: 10100000 },
      pendingAmountCentsByCurrency: { VND: 8000000 },
      releasedAmountCentsByCurrency: { USD: 2500, VND: 1600000 },
      availableAmountCentsByCurrency: { USD: 2500, VND: 1600000 },
      totalAmountCents: null,
      firstCommissionCreatedAt: '2026-06-15T01:30:00.000Z',
      lastCommissionCreatedAt: '2026-06-15T01:35:00.000Z',
    });
    expect(
      aggregateItemByKey(participantAggregate, fixture.participants.saleA),
    ).toEqual(
      expect.objectContaining({
        key: fixture.participants.saleA,
        totalCommissions: 4,
        countByStatus: { AVAILABLE: 1, CANCELED: 1, PENDING: 2 },
        pendingCommissions: 2,
        releasedCommissions: 1,
        revokedCommissions: 1,
        totalAmountCentsByCurrency: { USD: 2500, VND: 5700000 },
        totalAmountCents: null,
      }),
    );

    const filtered = await service.listCommissionAggregates(
      fixture.users.admin,
      {
        groupBy: 'affiliateLink',
        affiliateLinkId: fixture.created.saleALinkId,
        affiliateQrAssetId: 'p26-qr-a',
        agencyId: fixture.agencies.agencyA,
        agencyMemberId: fixture.members.saleA,
        clickId: 'clk_bbbbbbbbbbbbbbbbbbbbbbbb',
        campaign,
        channel: 'p26-channel-a',
        placement: 'p26-placement-a',
        packageCode: 'P26-PACKAGE-A',
        commissionStatus: 'PENDING',
        currency: 'VND',
        participantId: fixture.participants.saleA,
        beneficiaryType: 'SALE',
        beneficiaryId: fixture.userIds.saleAUser,
        commissionChainSnapshotStatus: 'frozen',
        createdFrom: '2026-06-15T01:00:00.000Z',
        createdTo: '2026-06-15T02:00:00.000Z',
        availableFrom: '2026-06-20T00:00:00.000Z',
        availableTo: '2026-06-20T23:59:59.000Z',
        approvedFrom: '2026-06-15T00:00:00.000Z',
        approvedTo: '2026-06-15T23:59:59.000Z',
      } as any,
    );
    expect(filtered.summary.totalCommissions).toBe(1);
    expect(filtered.items).toEqual([
      expect.objectContaining({
        key: fixture.created.saleALinkId,
        totalCommissions: 1,
        pendingCommissions: 1,
        totalAmountCentsByCurrency: { VND: 4000000 },
        totalAmountCents: 4000000,
      }),
    ]);

    for (const [groupBy, key, totalCommissions] of [
      ['beneficiaryType', 'SALE', 6],
      ['beneficiary', fixture.userIds.saleAUser, 4],
      ['affiliateLink', fixture.created.saleALinkId, 5],
      ['affiliateQrAsset', 'p26-qr-a', 3],
      ['agency', fixture.agencies.agencyA, 5],
      ['agencyMember', fixture.members.saleA, 5],
      ['campaign', campaign, 6],
      ['channel', 'p26-channel-a', 4],
      ['placement', 'p26-placement-a', 4],
      ['package', 'P26-PACKAGE-A', 4],
      ['commissionStatus', 'AVAILABLE', 2],
      ['commissionStatus', 'CANCELED', 1],
      ['commissionChainSnapshotStatus', 'frozen', 5],
      ['commissionChainSnapshotStatus', 'legacy_missing', 1],
      ['currency', 'USD', 1],
    ] as const) {
      const aggregate = await service.listCommissionAggregates(
        fixture.users.admin,
        {
          groupBy,
          campaign,
        } as any,
      );
      expect(aggregateItemByKey(aggregate, key)).toEqual(
        expect.objectContaining({ key, totalCommissions }),
      );
    }

    const campaignAggregate = await service.listCommissionAggregates(
      fixture.users.admin,
      { groupBy: 'campaign', campaign } as any,
    );
    expect(aggregateItemByKey(campaignAggregate, campaign)).toEqual(
      expect.objectContaining({
        totalCommissions: 6,
        totalAmountCentsByCurrency: { USD: 2500, VND: 10100000 },
        totalAmountCents: null,
      }),
    );

    await expect(
      service.listCommissionAggregates(fixture.users.admin, {
        groupBy: 'campaign',
        campaign,
        sortBy: 'totalAmountCents',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    const sortedLimited = await service.listCommissionAggregates(
      fixture.users.admin,
      {
        groupBy: 'participant',
        campaign,
        currency: 'VND',
        sortBy: 'totalAmountCents',
        sortDirection: 'desc',
        limit: 1,
      } as any,
    );
    expect(sortedLimited.totalGroups).toBe(3);
    expect(sortedLimited.items).toEqual([
      expect.objectContaining({
        key: fixture.participants.saleA,
        totalAmountCents: 5700000,
      }),
    ]);
    expect(sortedLimited.summary.totalAmountCents).toBe(10100000);

    const saleAResult = await service.listCommissionAggregates(
      fixture.users.saleA,
      { groupBy: 'participant', campaign } as any,
    );
    expect(saleAResult.items.map((item) => item.key)).toEqual([
      fixture.participants.saleA,
    ]);
    expect(saleAResult.summary.totalCommissions).toBe(4);

    const saleBResult = await service.listCommissionAggregates(
      fixture.users.saleB,
      { groupBy: 'participant', campaign } as any,
    );
    expect(saleBResult.items.map((item) => item.key)).toEqual([
      fixture.participants.saleB,
    ]);
    expect(saleBResult.summary.totalCommissions).toBe(1);

    const managerAResult = await service.listCommissionAggregates(
      fixture.users.managerA,
      { groupBy: 'participant', campaign } as any,
    );
    expect(managerAResult.items.map((item) => item.key).sort()).toEqual([
      fixture.participants.managerA,
      fixture.participants.saleA,
    ]);
    expect(managerAResult.summary.totalCommissions).toBe(5);

    const directorResult = await service.listCommissionAggregates(
      fixture.users.director,
      { groupBy: 'participant', campaign } as any,
    );
    expect(directorResult.items.map((item) => item.key).sort()).toEqual([
      fixture.participants.managerA,
      fixture.participants.saleA,
      fixture.participants.saleB,
    ]);

    const opsResult = await service.listCommissionAggregates(
      fixture.users.ops,
      { groupBy: 'participant', campaign } as any,
    );
    expect(opsResult.summary.totalCommissions).toBe(6);

    const outOfScopeFilter = await service.listCommissionAggregates(
      fixture.users.saleA,
      {
        groupBy: 'participant',
        campaign,
        participantId: fixture.participants.saleB,
      } as any,
    );
    expect(outOfScopeFilter.items).toEqual([]);
    expect(outOfScopeFilter.summary.totalCommissions).toBe(0);

    await expect(
      service.listCommissionAggregates(fixture.users.unscoped, {
        groupBy: 'participant',
        campaign,
      } as any),
    ).resolves.toEqual(
      expect.objectContaining({
        items: [],
        summary: expect.objectContaining({ totalCommissions: 0 }),
      }),
    );

    const mutatedCurrentAggregate = await service.listCommissionAggregates(
      fixture.users.admin,
      { groupBy: 'campaign', campaign: 'p26-mutated-current-campaign' } as any,
    );
    expect(mutatedCurrentAggregate).toEqual(
      expect.objectContaining({
        items: [],
        totalGroups: 0,
        summary: expect.objectContaining({
          totalCommissions: 0,
          countByStatus: {},
          totalAmountCentsByCurrency: {},
          totalAmountCents: 0,
        }),
      }),
    );

    const controllerResult = await controller.listCommissionAggregates(
      fixture.users.admin,
      { groupBy: 'currency', campaign } as any,
    );
    expect(controllerResult.items.map((item) => item.key).sort()).toEqual([
      'USD',
      'VND',
    ]);

    const endedAt = new Date();
    const serialized = JSON.stringify({
      participantAggregate,
      filtered,
      campaignAggregate,
      controllerResult,
    });
    expect(serialized).not.toContain('p26-a@example.com');
    expect(serialized).not.toContain('p26-usd@example.com');
    expect(serialized).not.toContain('0900000000');
    expect(serialized).not.toContain('raw-ip');
    expect(serialized).not.toContain('raw-user-agent');
    expect(serialized).not.toContain('ipHash');
    expect(serialized).not.toContain('userAgentHash');
    expect(serialized).not.toContain('deviceHint');
    expect(serialized).not.toContain('cookie');
    expect(serialized).not.toContain('Authorization');
    expect(serialized).not.toContain('rawHeaders');
    expect(serialized).not.toContain('payment-proof.pdf');
    expect(serialized).not.toContain('payoutInvoiceUrl');
    expect(serialized).not.toContain('report body');

    const auditRead = await service.listReportAccessAudits(fixture.users.ops, {
      reportType: 'AFFILIATE_COMMISSION_AGGREGATE',
      format: 'JSON',
      actorUserId: fixture.userIds.adminUser,
      createdFrom: startedAt.toISOString(),
      createdTo: endedAt.toISOString(),
      page: 1,
      pageSize: 100,
    } as any);
    expect(auditRead.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorUserId: fixture.userIds.adminUser,
          reportType: 'AFFILIATE_COMMISSION_AGGREGATE',
          format: 'JSON',
          route: '/v1/channel-affiliate/commissions/aggregates',
          rowCount: 3,
          safeFilterSummary: expect.objectContaining({
            campaign,
            groupBy: 'participant',
            sortBy: 'lastCommissionCreatedAt',
            sortDirection: 'asc',
            limit: 10,
          }),
          scopeSummary: { roles: ['ADMIN'], isGlobalManager: true },
        }),
      ]),
    );
    expect(JSON.stringify(auditRead)).not.toContain('p26-a@example.com');
    expect(JSON.stringify(auditRead)).not.toContain('payment-proof.pdf');
    expect(JSON.stringify(auditRead)).not.toContain('report body');

    await expect(financialCounts(prisma)).resolves.toEqual(before);
  });

  it('exports affiliate commission list and aggregate CSV from immutable proof safely', async () => {
    const campaign = 'p27 commission export, "quoted"\nline';
    await seedAffiliateCommissionRows(prisma, fixture, campaign, {
      prefix: 'p27',
      includeAggregateCurrencyRows: true,
    });

    await prisma.affiliateLink.update({
      where: { id: fixture.created.saleALinkId },
      data: {
        campaign: 'p27-mutated-current-campaign',
        channel: 'p27-mutated-current-channel',
        placement: 'p27-mutated-current-placement',
        referralCode: 'P27-MUTATED-REF',
      },
    });

    const before = await financialCounts(prisma);
    const startedAt = new Date();
    const listCsv = await service.exportCommissionsCsv(fixture.users.admin, {
      campaign,
      limit: 10,
    });
    const aggregateCsv = await service.exportCommissionAggregatesCsv(
      fixture.users.admin,
      { groupBy: 'campaign', campaign } as any,
    );

    expect(listCsv.startsWith(`${commissionListExportHeader}\r\n`)).toBe(true);
    expect(listCsv).toContain('p27-earning-sale-a');
    expect(listCsv).toContain('p27-earning-manager-a');
    expect(listCsv).toContain('p27-earning-sale-b');
    expect(listCsv).toContain('p27-earning-usd-a');
    expect(listCsv).toContain('"p27 commission export, ""quoted""\nline"');
    expect(listCsv).toContain(',4000000,VND,');
    expect(listCsv).toContain(',2500,USD,');
    expect(listCsv).toContain(',null,affiliate_order_snapshot,');
    expect(listCsv).toContain(',commission_chain_v1,');
    expect(listCsv).not.toContain('p27-a@example.com');
    expect(listCsv).not.toContain('p27-usd@example.com');
    expect(listCsv).not.toContain('0900000000');
    expect(listCsv).not.toContain('raw-ip');
    expect(listCsv).not.toContain('raw-user-agent');
    expect(listCsv).not.toContain('ipHash');
    expect(listCsv).not.toContain('userAgentHash');
    expect(listCsv).not.toContain('deviceHint');
    expect(listCsv).not.toContain('cookie');
    expect(listCsv).not.toContain('Authorization');
    expect(listCsv).not.toContain('rawHeaders');
    expect(listCsv).not.toContain('payment-proof.pdf');
    expect(listCsv).not.toContain('payoutInvoiceUrl');
    expect(listCsv).not.toContain('report body');

    expect(
      aggregateCsv.startsWith(`${commissionAggregateExportHeader}\r\n`),
    ).toBe(true);
    expect(aggregateCsv).toContain('"p27 commission export, ""quoted""\nline"');
    expect(aggregateCsv).toContain(
      '"{""AVAILABLE"":2,""CANCELED"":1,""PENDING"":3}"',
    );
    expect(aggregateCsv).toContain('"{""USD"":2500,""VND"":10100000}"');
    expect(aggregateCsv).toContain('"{""VND"":8000000}"');
    expect(aggregateCsv).toContain('"{""USD"":2500,""VND"":1600000}"');
    expect(aggregateCsv).toContain(',null,2026-06-15T01:30:00.000Z,');
    expect(aggregateCsv).not.toContain('p27-a@example.com');
    expect(aggregateCsv).not.toContain('raw-ip');
    expect(aggregateCsv).not.toContain('payment-proof.pdf');
    expect(aggregateCsv).not.toContain('report body');

    const sortedLimitedCsv = await service.exportCommissionsCsv(
      fixture.users.admin,
      {
        campaign,
        sortBy: 'amountCents',
        sortDirection: 'asc',
        limit: 2,
      } as any,
    );
    expect(sortedLimitedCsv.indexOf('p27-earning-usd-a')).toBeGreaterThan(0);
    expect(sortedLimitedCsv).toContain('p27-earning-canceled-a');
    expect(sortedLimitedCsv).not.toContain('p27-earning-sale-a');

    const aggregateSortedCsv = await service.exportCommissionAggregatesCsv(
      fixture.users.admin,
      {
        groupBy: 'participant',
        campaign,
        currency: 'VND',
        sortBy: 'totalAmountCents',
        sortDirection: 'desc',
        limit: 1,
      } as any,
    );
    expect(aggregateSortedCsv).toContain(fixture.participants.saleA);
    expect(aggregateSortedCsv).not.toContain(fixture.participants.saleB);

    const mutatedListCsv = await service.exportCommissionsCsv(
      fixture.users.admin,
      {
        campaign: 'p27-mutated-current-campaign',
        limit: 10,
      },
    );
    expect(mutatedListCsv).toBe(`${commissionListExportHeader}\r\n`);

    const mutatedAggregateCsv = await service.exportCommissionAggregatesCsv(
      fixture.users.admin,
      {
        groupBy: 'campaign',
        campaign: 'p27-mutated-current-campaign',
      } as any,
    );
    expect(mutatedAggregateCsv).toBe(`${commissionAggregateExportHeader}\r\n`);

    const listResponse = { setHeader: jest.fn() };
    const controllerListCsv = await controller.exportCommissionsCsv(
      fixture.users.admin,
      { campaign, limit: 1 },
      listResponse as any,
    );
    expect(listResponse.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'text/csv; charset=utf-8',
    );
    expect(listResponse.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="affiliate-commissions.csv"',
    );
    expect(
      controllerListCsv.startsWith(`${commissionListExportHeader}\r\n`),
    ).toBe(true);

    const aggregateResponse = { setHeader: jest.fn() };
    const controllerAggregateCsv =
      await controller.exportCommissionAggregatesCsv(
        fixture.users.admin,
        { groupBy: 'currency', campaign } as any,
        aggregateResponse as any,
      );
    expect(aggregateResponse.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'text/csv; charset=utf-8',
    );
    expect(aggregateResponse.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="affiliate-commission-aggregates.csv"',
    );
    expect(
      controllerAggregateCsv.startsWith(
        `${commissionAggregateExportHeader}\r\n`,
      ),
    ).toBe(true);

    const endedAt = new Date();
    const auditRead = await service.listReportAccessAudits(fixture.users.ops, {
      format: 'CSV',
      actorUserId: fixture.userIds.adminUser,
      createdFrom: startedAt.toISOString(),
      createdTo: endedAt.toISOString(),
      page: 1,
      pageSize: 100,
    } as any);
    expect(auditRead.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reportType: 'AFFILIATE_COMMISSION_LIST',
          format: 'CSV',
          route: '/v1/channel-affiliate/commissions/export.csv',
          rowCount: 6,
          safeFilterSummary: { campaign, limit: 10 },
        }),
        expect.objectContaining({
          reportType: 'AFFILIATE_COMMISSION_AGGREGATE',
          format: 'CSV',
          route: '/v1/channel-affiliate/commissions/aggregates/export.csv',
          rowCount: 1,
          safeFilterSummary: { campaign, groupBy: 'campaign' },
        }),
      ]),
    );
    const auditSerialized = JSON.stringify(auditRead);
    expect(auditSerialized).not.toContain(commissionListExportHeader);
    expect(auditSerialized).not.toContain(commissionAggregateExportHeader);
    expect(auditSerialized).not.toContain('p27-earning-sale-a');
    expect(auditSerialized).not.toContain('p27-a@example.com');
    expect(auditSerialized).not.toContain('payment-proof.pdf');
    expect(auditSerialized).not.toContain('report body');

    await expect(financialCounts(prisma)).resolves.toEqual(before);
  });

  it('keeps affiliate commission CSV exports scoped by commission participant subtree', async () => {
    const campaign = 'p27-scope-commission-export';
    await seedAffiliateCommissionRows(prisma, fixture, campaign, {
      prefix: 'p27scope',
    });

    const saleAListCsv = await service.exportCommissionsCsv(
      fixture.users.saleA,
      { campaign },
    );
    expect(saleAListCsv).toContain('p27scope-earning-sale-a');
    expect(saleAListCsv).toContain('p27scope-earning-legacy-a');
    expect(saleAListCsv).not.toContain('p27scope-earning-manager-a');
    expect(saleAListCsv).not.toContain('p27scope-earning-sale-b');

    const saleBListCsv = await service.exportCommissionsCsv(
      fixture.users.saleB,
      { campaign },
    );
    expect(saleBListCsv).toContain('p27scope-earning-sale-b');
    expect(saleBListCsv).not.toContain('p27scope-earning-sale-a');

    const managerAListCsv = await service.exportCommissionsCsv(
      fixture.users.managerA,
      { campaign },
    );
    expect(managerAListCsv).toContain('p27scope-earning-sale-a');
    expect(managerAListCsv).toContain('p27scope-earning-manager-a');
    expect(managerAListCsv).not.toContain('p27scope-earning-sale-b');

    const adminListCsv = await service.exportCommissionsCsv(
      fixture.users.admin,
      { campaign },
    );
    expect(adminListCsv).toContain('p27scope-earning-sale-a');
    expect(adminListCsv).toContain('p27scope-earning-manager-a');
    expect(adminListCsv).toContain('p27scope-earning-sale-b');

    const opsAggregateCsv = await service.exportCommissionAggregatesCsv(
      fixture.users.ops,
      { groupBy: 'participant', campaign } as any,
    );
    expect(opsAggregateCsv).toContain(fixture.participants.saleA);
    expect(opsAggregateCsv).toContain(fixture.participants.managerA);
    expect(opsAggregateCsv).toContain(fixture.participants.saleB);

    const outOfScopeListCsv = await service.exportCommissionsCsv(
      fixture.users.saleA,
      {
        campaign,
        participantId: fixture.participants.saleB,
      },
    );
    expect(outOfScopeListCsv).toBe(`${commissionListExportHeader}\r\n`);

    await expect(
      service.exportCommissionAggregatesCsv(fixture.users.unscoped, {
        groupBy: 'participant',
        campaign,
      } as any),
    ).resolves.toBe(`${commissionAggregateExportHeader}\r\n`);
  });

  it('rejects invalid affiliate commission CSV export queries', async () => {
    await expect(
      service.exportCommissionsCsv(fixture.users.admin, {
        limit: 0,
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.exportCommissionsCsv(fixture.users.admin, {
        limit: 1001,
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.exportCommissionsCsv(fixture.users.admin, {
        createdFrom: 'not-a-date',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.exportCommissionsCsv(fixture.users.admin, {
        sortBy: 'unsafe',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.exportCommissionAggregatesCsv(fixture.users.admin, {} as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.exportCommissionAggregatesCsv(fixture.users.admin, {
        groupBy: 'participant',
        limit: 101,
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.exportCommissionAggregatesCsv(fixture.users.admin, {
        groupBy: 'bad-dimension',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.exportCommissionAggregatesCsv(fixture.users.admin, {
        groupBy: 'participant',
        sortBy: 'totalAmountCents',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects invalid affiliate commission aggregate queries', async () => {
    await expect(
      service.listCommissionAggregates(fixture.users.admin, {} as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.listCommissionAggregates(fixture.users.admin, {
        groupBy: 'unsafe',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.listCommissionAggregates(fixture.users.admin, {
        groupBy: 'participant',
        limit: 0,
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.listCommissionAggregates(fixture.users.admin, {
        groupBy: 'participant',
        sortBy: 'unsafe',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.listCommissionAggregates(fixture.users.admin, {
        groupBy: 'participant',
        sortDirection: 'sideways',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.listCommissionAggregates(fixture.users.admin, {
        groupBy: 'participant',
        sortBy: 'totalAmountCents',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.listCommissionAggregates(fixture.users.admin, {
        groupBy: 'participant',
        createdFrom: 'not-a-date',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.listCommissionAggregates(fixture.users.admin, {
        groupBy: 'participant',
        commissionChainSnapshotStatus: 'unknown',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects invalid affiliate commission report queries', async () => {
    await expect(
      service.listCommissions(fixture.users.admin, {
        createdFrom: 'not-a-date',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.listCommissions(fixture.users.admin, {
        availableTo: 'not-a-date',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.listCommissions(fixture.users.admin, {
        approvedFrom: 'not-a-date',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.listCommissions(fixture.users.admin, {
        commissionChainSnapshotStatus: 'unknown',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.listCommissions(fixture.users.admin, {
        sortBy: 'unsafe',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.listCommissions(fixture.users.admin, {
        pageSize: 201,
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects invalid affiliate report access audit queries', async () => {
    await expect(
      service.listReportAccessAudits(fixture.users.ops, {
        reportType: 'BAD',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.listReportAccessAudits(fixture.users.ops, {
        format: 'PDF',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.listReportAccessAudits(fixture.users.ops, {
        createdFrom: 'not-a-date',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.listReportAccessAudits(fixture.users.ops, {
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

  it('creates QR assets with canonical encodedUrl and blocks sibling QR creation', async () => {
    const before = await financialCounts(prisma);
    const qr = await service.createQrAsset(
      fixture.created.saleALinkId,
      {
        label: ' School poster ',
        placement: ' school_event ',
        metadataJson: { printBatch: 'p16' },
      },
      fixture.users.managerA,
    );

    expect(qr).toEqual(
      expect.objectContaining({
        affiliateLinkId: fixture.created.saleALinkId,
        label: 'School poster',
        placement: 'school_event',
        status: 'ACTIVE',
      }),
    );
    expect(qr.encodedUrl).toContain(
      `https://go.test.minhhuong/r/${fixture.created.saleALinkCode}`,
    );
    expect(qr.encodedUrl).toContain('placement=school_event');
    expect(qr.encodedUrl).toContain(`qr=${encodeURIComponent(qr.id)}`);

    await expect(
      service.createQrAsset(
        fixture.created.saleALinkId,
        { label: 'Forbidden sibling QR' },
        fixture.users.saleB,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    await expect(financialCounts(prisma)).resolves.toEqual(before);
  });

  it('allows admin override to create for a target participant and rejects unscoped creation', async () => {
    const adminLink = await service.createLink(
      {
        participantId: fixture.participants.saleB,
        name: 'Admin-created sale B link',
      },
      fixture.users.admin,
    );
    expect(adminLink.participantId).toBe(fixture.participants.saleB);

    await expect(
      service.createLink(
        {
          participantId: fixture.participants.saleA,
          name: 'Unscoped forbidden link',
        },
        fixture.users.unscoped,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    await expect(
      service.createLink(
        { name: 'Unscoped missing participant' },
        fixture.users.unscoped,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('enforces participant/user/link foreign keys', async () => {
    await expect(
      prisma.affiliateLink.create({
        data: {
          participantId: 'missing-participant',
          createdById: fixture.userIds.saleAUser,
          linkCode: 'missing-participant-link',
          name: 'Missing participant',
        },
      }),
    ).rejects.toThrow();

    await expect(
      prisma.affiliateLink.create({
        data: {
          participantId: fixture.participants.saleA,
          createdById: 'missing-user',
          linkCode: 'missing-user-link',
          name: 'Missing creator',
        },
      }),
    ).rejects.toThrow();

    await expect(
      prisma.affiliateQrAsset.create({
        data: {
          affiliateLinkId: 'missing-link',
          createdById: fixture.userIds.saleAUser,
          encodedUrl: 'https://go.test.minhhuong/r/missing',
        },
      }),
    ).rejects.toThrow();
  });
});

function databaseUrlForDatabase(database: string) {
  const url = new URL(baseDatabaseUrl);
  url.pathname = `/${database}`;
  url.searchParams.delete('schema');
  url.searchParams.delete('options');
  return url.toString();
}

async function seedAffiliateFixture(prisma: PrismaClient) {
  const userIds = {
    adminUser: 'p16-admin-user',
    opsUser: 'p16-ops-user',
    directorUser: 'p16-director-user',
    managerAUser: 'p16-manager-a-user',
    managerBUser: 'p16-manager-b-user',
    agencyAOwnerUser: 'p16-agency-a-owner-user',
    agencyBOwnerUser: 'p16-agency-b-owner-user',
    saleAUser: 'p16-sale-a-user',
    saleBUser: 'p16-sale-b-user',
    unscopedUser: 'p16-unscoped-user',
  };
  const agencies = {
    agencyA: 'p16-agency-a',
    agencyB: 'p16-agency-b',
  };
  const participants = {
    directorRoot: 'p16-director-root',
    managerA: 'p16-manager-a',
    managerB: 'p16-manager-b',
    agencyAParticipant: 'p16-agency-a-participant',
    agencyBParticipant: 'p16-agency-b-participant',
    saleA: 'p16-sale-a',
    saleB: 'p16-sale-b',
  };
  const members = {
    agencyAOwner: 'p16-member-agency-a-owner',
    agencyBOwner: 'p16-member-agency-b-owner',
    saleA: 'p16-member-sale-a',
    saleB: 'p16-member-sale-b',
  };

  await prisma.user.createMany({
    data: [
      user(userIds.adminUser, 'p16-admin@example.com'),
      user(userIds.opsUser, 'p16-ops@example.com'),
      user(userIds.directorUser, 'p16-director@example.com'),
      user(userIds.managerAUser, 'p16-manager-a@example.com'),
      user(userIds.managerBUser, 'p16-manager-b@example.com'),
      user(userIds.agencyAOwnerUser, 'p16-agency-a@example.com'),
      user(userIds.agencyBOwnerUser, 'p16-agency-b@example.com'),
      user(userIds.saleAUser, 'p16-sale-a@example.com'),
      user(userIds.saleBUser, 'p16-sale-b@example.com'),
      user(userIds.unscopedUser, 'p16-unscoped@example.com'),
    ],
  });

  await prisma.agency.createMany({
    data: [
      {
        id: agencies.agencyA,
        code: 'P16-AGENCY-A',
        name: 'Prompt 16 Agency A',
        defaultRateBps: 500,
      },
      {
        id: agencies.agencyB,
        code: 'P16-AGENCY-B',
        name: 'Prompt 16 Agency B',
        defaultRateBps: 500,
      },
    ],
  });

  await prisma.channelParticipant.create({
    data: participant({
      id: participants.directorRoot,
      type: 'DIRECTOR',
      code: 'P16-DIRECTOR',
      displayName: 'Prompt 16 Director',
      userId: userIds.directorUser,
      lineage: `/${participants.directorRoot}/`,
      depth: 0,
    }),
  });
  await prisma.channelParticipant.update({
    where: { id: participants.directorRoot },
    data: { rootParticipantId: participants.directorRoot },
  });

  await prisma.channelParticipant.createMany({
    data: [
      participant({
        id: participants.managerA,
        type: 'MANAGER',
        code: 'P16-MANAGER-A',
        displayName: 'Prompt 16 Manager A',
        userId: userIds.managerAUser,
        parentParticipantId: participants.directorRoot,
        rootParticipantId: participants.directorRoot,
        lineage: `/${participants.directorRoot}/${participants.managerA}/`,
        depth: 1,
      }),
      participant({
        id: participants.managerB,
        type: 'MANAGER',
        code: 'P16-MANAGER-B',
        displayName: 'Prompt 16 Manager B',
        userId: userIds.managerBUser,
        parentParticipantId: participants.directorRoot,
        rootParticipantId: participants.directorRoot,
        lineage: `/${participants.directorRoot}/${participants.managerB}/`,
        depth: 1,
      }),
    ],
  });

  await prisma.channelParticipant.createMany({
    data: [
      participant({
        id: participants.agencyAParticipant,
        type: 'AGENCY',
        code: 'P16-AGENCY-A',
        displayName: 'Prompt 16 Agency A',
        userId: userIds.agencyAOwnerUser,
        agencyId: agencies.agencyA,
        parentParticipantId: participants.managerA,
        rootParticipantId: participants.directorRoot,
        lineage: `/${participants.directorRoot}/${participants.managerA}/${participants.agencyAParticipant}/`,
        depth: 2,
      }),
      participant({
        id: participants.agencyBParticipant,
        type: 'AGENCY',
        code: 'P16-AGENCY-B',
        displayName: 'Prompt 16 Agency B',
        userId: userIds.agencyBOwnerUser,
        agencyId: agencies.agencyB,
        parentParticipantId: participants.managerB,
        rootParticipantId: participants.directorRoot,
        lineage: `/${participants.directorRoot}/${participants.managerB}/${participants.agencyBParticipant}/`,
        depth: 2,
      }),
    ],
  });

  await prisma.channelParticipant.createMany({
    data: [
      participant({
        id: participants.saleA,
        type: 'SALE',
        code: 'P16-SALE-A',
        displayName: 'Prompt 16 Sale A',
        userId: userIds.saleAUser,
        parentParticipantId: participants.agencyAParticipant,
        rootParticipantId: participants.directorRoot,
        lineage: `/${participants.directorRoot}/${participants.managerA}/${participants.agencyAParticipant}/${participants.saleA}/`,
        depth: 3,
      }),
      participant({
        id: participants.saleB,
        type: 'SALE',
        code: 'P16-SALE-B',
        displayName: 'Prompt 16 Sale B',
        userId: userIds.saleBUser,
        parentParticipantId: participants.agencyBParticipant,
        rootParticipantId: participants.directorRoot,
        lineage: `/${participants.directorRoot}/${participants.managerB}/${participants.agencyBParticipant}/${participants.saleB}/`,
        depth: 3,
      }),
    ],
  });

  await prisma.agencyMember.createMany({
    data: [
      agencyMember(
        members.agencyAOwner,
        agencies.agencyA,
        userIds.agencyAOwnerUser,
        'OWNER',
        'Prompt 16 Agency A Owner',
        'P16-A-OWNER',
      ),
      agencyMember(
        members.agencyBOwner,
        agencies.agencyB,
        userIds.agencyBOwnerUser,
        'OWNER',
        'Prompt 16 Agency B Owner',
        'P16-B-OWNER',
      ),
      agencyMember(
        members.saleA,
        agencies.agencyA,
        userIds.saleAUser,
        'SALE',
        'Prompt 16 Sale A',
        'P16-SALE-A-REF',
      ),
      agencyMember(
        members.saleB,
        agencies.agencyB,
        userIds.saleBUser,
        'SALE',
        'Prompt 16 Sale B',
        'P16-SALE-B-REF',
      ),
    ],
  });

  const createdLink = await prisma.affiliateLink.create({
    data: {
      participantId: participants.saleA,
      agencyId: agencies.agencyA,
      agencyMemberId: members.saleA,
      createdById: userIds.saleAUser,
      referralCode: 'P16-SALE-A-REF',
      linkCode: 'mh_existing_sale_a',
      name: 'Existing sale A link',
      campaign: 'existing',
      channel: 'zalo',
      placement: 'poster',
      packageCode: 'ENGLISH_BASIC_12M',
    },
  });

  return {
    userIds,
    agencies,
    participants,
    members,
    created: {
      saleALinkId: createdLink.id,
      saleALinkCode: createdLink.linkCode,
    },
    users: {
      admin: authUser(userIds.adminUser, 'p16-admin@example.com', ['ADMIN']),
      ops: authUser(userIds.opsUser, 'p16-ops@example.com', ['OPERATIONS']),
      director: authUser(userIds.directorUser, 'p16-director@example.com', [
        'DIRECTOR',
      ]),
      managerA: authUser(userIds.managerAUser, 'p16-manager-a@example.com', [
        'AGENCY_MANAGER',
      ]),
      managerB: authUser(userIds.managerBUser, 'p16-manager-b@example.com', [
        'AGENCY_MANAGER',
      ]),
      agencyAOwner: authUser(
        userIds.agencyAOwnerUser,
        'p16-agency-a@example.com',
        ['AGENCY_OWNER'],
      ),
      agencyBOwner: authUser(
        userIds.agencyBOwnerUser,
        'p16-agency-b@example.com',
        ['AGENCY_OWNER'],
      ),
      saleA: authUser(userIds.saleAUser, 'p16-sale-a@example.com', ['SALE']),
      saleB: authUser(userIds.saleBUser, 'p16-sale-b@example.com', ['SALE']),
      unscoped: authUser(userIds.unscopedUser, 'p16-unscoped@example.com', [
        'AGENCY_MANAGER',
      ]),
    },
  };
}

function user(id: string, email: string) {
  return {
    id,
    email,
    passwordHash: 'test-hash',
    status: 'ACTIVE' as const,
  };
}

function authUser(
  sub: string,
  email: string,
  roles: AuthenticatedUser['roles'],
): AuthenticatedUser {
  return { sub, email, roles };
}

function participant(input: {
  id: string;
  type: 'DIRECTOR' | 'MANAGER' | 'AGENCY' | 'SALE';
  code: string;
  displayName: string;
  userId?: string;
  agencyId?: string;
  parentParticipantId?: string;
  rootParticipantId?: string;
  lineage: string;
  depth: number;
}) {
  return {
    id: input.id,
    type: input.type,
    code: input.code,
    displayName: input.displayName,
    userId: input.userId,
    agencyId: input.agencyId,
    parentParticipantId: input.parentParticipantId,
    rootParticipantId: input.rootParticipantId,
    lineage: input.lineage,
    depth: input.depth,
    status: 'ACTIVE' as const,
    baseSalaryCents: 0,
  };
}

function agencyMember(
  id: string,
  agencyId: string,
  userId: string,
  role: 'OWNER' | 'MANAGER' | 'SALE',
  title: string,
  referralCode: string,
) {
  return {
    id,
    agencyId,
    userId,
    role,
    title,
    referralCode,
    isActive: true,
  };
}

function idsOf(rows: Array<{ id: string }>) {
  return rows.map((row) => row.id).sort();
}

function aggregateItemByKey<T extends { items: Array<{ key: string | null }> }>(
  result: T,
  key: string | null,
) {
  const item = result.items.find((row) => row.key === key);
  expect(item).toBeDefined();
  return item;
}

async function affiliateReportAccessAuditsForCampaign(
  prisma: PrismaClient,
  campaign: string,
) {
  const rows = await prisma.auditLog.findMany({
    where: {
      action: 'channel_affiliate.report_access',
      entityType: 'AffiliateReportAccessAudit',
    },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  });

  return rows.filter((row) => {
    const metadata = row.metadata;
    return (
      metadata &&
      typeof metadata === 'object' &&
      !Array.isArray(metadata) &&
      (metadata as any).safeFilterSummary?.campaign === campaign
    );
  });
}

async function seedAffiliateOrderAttributionOrders(
  prisma: PrismaClient,
  fixture: AffiliateFixture,
  campaign: string,
  options: { orderPrefix?: string } = {},
) {
  const orderPrefix = options.orderPrefix ?? 'p19';
  const baseSnapshot = {
    source: 'affiliate_click',
    affiliateClickEventId: `${orderPrefix}-click-event`,
    affiliateQrAssetId: `${orderPrefix}-qr`,
    agencyMemberId: fixture.members.saleA,
    clickCreatedAt: '2026-06-14T01:00:00.000Z',
    orderSnapshottedAt: '2026-06-14T02:00:00.000Z',
    attributionModel: 'explicit_click',
    matchConfidence: 'high',
    attributionWindowDays: 30,
    ipHash: 'raw-ip-hash-should-not-leak',
    userAgentHash: 'raw-user-agent-hash-should-not-leak',
    deviceHint: 'raw-device-should-not-leak',
    cookie: 'cookie-should-not-leak',
    Authorization: 'auth-should-not-leak',
    paymentProofUrl: 'payment-proof.pdf',
  };

  await prisma.activationOrder.createMany({
    data: [
      {
        id: `${orderPrefix}-order-a`,
        userId: fixture.userIds.saleAUser,
        channelParticipantId: fixture.participants.saleA,
        agencyId: fixture.agencies.agencyA,
        referrerMemberId: fixture.members.saleA,
        status: 'APPROVED',
        source: 'SELF_SERVICE',
        customerEmail: `${orderPrefix}-a@example.com`,
        amountCents: 5000000,
        currency: 'VND',
        packageCode: 'P19-PACKAGE',
        packageName: 'Prompt 19 Package',
        affiliateAttributionSnapshotJson: {
          ...baseSnapshot,
          clickId: 'clk_aaaaaaaaaaaaaaaaaaaaaaaa',
          affiliateLinkId: fixture.created.saleALinkId,
          participantId: fixture.participants.saleA,
          agencyId: fixture.agencies.agencyA,
          agencyMemberId: fixture.members.saleA,
          referralCode: 'SNAPSHOT-REF-A',
          campaign,
          channel: 'snapshot-channel',
          placement: 'snapshot-placement',
          packageCode: 'P19-PACKAGE',
        },
        createdAt: new Date('2026-06-14T03:00:00.000Z'),
      },
      {
        id: `${orderPrefix}-order-b`,
        userId: fixture.userIds.saleBUser,
        channelParticipantId: fixture.participants.saleB,
        agencyId: fixture.agencies.agencyB,
        referrerMemberId: fixture.members.saleB,
        status: 'WAITING_PAYMENT',
        source: 'SELF_SERVICE',
        customerEmail: `${orderPrefix}-b@example.com`,
        amountCents: 7000000,
        currency: 'VND',
        packageCode: 'P19-PACKAGE-B',
        packageName: 'Prompt 19 Package B',
        affiliateAttributionSnapshotJson: {
          ...baseSnapshot,
          clickId: 'clk_bbbbbbbbbbbbbbbbbbbbbbbb',
          affiliateClickEventId: `${orderPrefix}-click-event-b`,
          affiliateLinkId: `${orderPrefix}-link-b`,
          affiliateQrAssetId: null,
          participantId: fixture.participants.saleB,
          agencyId: fixture.agencies.agencyB,
          agencyMemberId: fixture.members.saleB,
          referralCode: 'SNAPSHOT-REF-B',
          campaign,
          channel: 'snapshot-channel-b',
          placement: 'snapshot-placement-b',
          packageCode: 'P19-PACKAGE-B',
          clickCreatedAt: '2026-06-14T01:30:00.000Z',
        },
        createdAt: new Date('2026-06-14T04:00:00.000Z'),
      },
      {
        id: `${orderPrefix}-order-no-snapshot`,
        userId: fixture.userIds.saleAUser,
        channelParticipantId: fixture.participants.saleA,
        agencyId: fixture.agencies.agencyA,
        referrerMemberId: fixture.members.saleA,
        status: 'APPROVED',
        source: 'SELF_SERVICE',
        customerEmail: `${orderPrefix}-plain@example.com`,
        amountCents: 9000000,
        currency: 'VND',
        packageCode: 'P19-PLAIN',
        packageName: 'Plain Package',
        createdAt: new Date('2026-06-14T05:00:00.000Z'),
      },
    ],
  });
}

async function seedAffiliateCommissionRows(
  prisma: PrismaClient,
  fixture: AffiliateFixture,
  campaign: string,
  options: {
    prefix?: string;
    includeAggregateCurrencyRows?: boolean;
  } = {},
) {
  const prefix = options.prefix ?? 'p25';
  const label = prefix.toUpperCase();
  const orderAId = `${prefix}-order-a`;
  const orderBId = `${prefix}-order-b`;
  const legacyOrderAId = `${prefix}-order-legacy-a`;
  const saleAEarningId = `${prefix}-earning-sale-a`;
  const managerAEarningId = `${prefix}-earning-manager-a`;
  const saleBEarningId = `${prefix}-earning-sale-b`;
  const legacyAEarningId = `${prefix}-earning-legacy-a`;
  const saleAProof = {
    source: 'affiliate_order_snapshot',
    participantId: fixture.participants.saleA,
    agencyId: fixture.agencies.agencyA,
    agencyMemberId: fixture.members.saleA,
    referralCode: `${label}-SNAPSHOT-REF-A`,
    affiliateLinkId: fixture.created.saleALinkId,
    affiliateQrAssetId: `${prefix}-qr-a`,
    campaign,
    channel: `${prefix}-channel-a`,
    placement: `${prefix}-placement-a`,
    packageCode: `${label}-PACKAGE-A`,
    clickId: 'clk_bbbbbbbbbbbbbbbbbbbbbbbb',
    clickCreatedAt: '2026-06-15T00:10:00.000Z',
    orderSnapshottedAt: '2026-06-15T00:20:00.000Z',
    ipHash: 'raw-ip-hash-should-not-leak',
    userAgentHash: 'raw-user-agent-hash-should-not-leak',
    deviceHint: 'raw-device-should-not-leak',
    cookie: 'cookie-should-not-leak',
    Authorization: 'auth-should-not-leak',
    rawHeaders: { authorization: 'secret' },
    paymentProofUrl: 'payment-proof.pdf',
    reportBody: 'report body should not leak',
  };
  const saleBProof = {
    source: 'affiliate_order_snapshot',
    participantId: fixture.participants.saleB,
    agencyId: fixture.agencies.agencyB,
    agencyMemberId: fixture.members.saleB,
    referralCode: `${label}-SNAPSHOT-REF-B`,
    affiliateLinkId: `${prefix}-link-b`,
    affiliateQrAssetId: `${prefix}-qr-b`,
    campaign,
    channel: `${prefix}-channel-b`,
    placement: `${prefix}-placement-b`,
    packageCode: `${label}-PACKAGE-B`,
    clickId: 'clk_cccccccccccccccccccccccc',
    clickCreatedAt: '2026-06-15T00:15:00.000Z',
    orderSnapshottedAt: '2026-06-15T00:25:00.000Z',
  };
  const legacyProof = {
    ...saleAProof,
    clickId: 'clk_dddddddddddddddddddddddd',
    affiliateQrAssetId: `${prefix}-qr-legacy`,
    commissionChainSnapshotStatus: 'legacy_missing',
  };
  const usdProof = {
    ...saleAProof,
    clickId: 'clk_p26_usd_commission',
    affiliateQrAssetId: `${prefix}-qr-usd`,
    channel: `${prefix}-channel-usd`,
    placement: `${prefix}-placement-usd`,
    packageCode: `${label}-PACKAGE-USD`,
  };
  const saleAChain = {
    source: 'affiliate_order_snapshot',
    policyVersion: 'commission_chain_v1',
    snapshottedAt: '2026-06-15T00:21:00.000Z',
    rootParticipantId: fixture.participants.saleA,
    items: [
      {
        depth: 0,
        participantId: fixture.participants.saleA,
        beneficiaryType: 'SALE',
        beneficiaryId: fixture.userIds.saleAUser,
        rateBps: 4000,
        agencyId: fixture.agencies.agencyA,
        agencyMemberId: fixture.members.saleA,
        parentParticipantId: fixture.participants.agencyAParticipant,
      },
      {
        depth: 1,
        participantId: fixture.participants.managerA,
        beneficiaryType: 'SALE',
        beneficiaryId: fixture.userIds.managerAUser,
        rateBps: 1600,
        agencyId: null,
        agencyMemberId: null,
        parentParticipantId: fixture.participants.directorRoot,
      },
    ],
  };
  const saleBChain = {
    source: 'affiliate_order_snapshot',
    policyVersion: 'commission_chain_v1',
    snapshottedAt: '2026-06-15T00:26:00.000Z',
    rootParticipantId: fixture.participants.saleB,
    items: [
      {
        depth: 0,
        participantId: fixture.participants.saleB,
        beneficiaryType: 'SALE',
        beneficiaryId: fixture.userIds.saleBUser,
        rateBps: 4000,
        agencyId: fixture.agencies.agencyB,
        agencyMemberId: fixture.members.saleB,
        parentParticipantId: fixture.participants.agencyBParticipant,
      },
    ],
  };

  await prisma.activationOrder.createMany({
    data: [
      {
        id: orderAId,
        userId: fixture.userIds.saleAUser,
        channelParticipantId: fixture.participants.saleA,
        agencyId: fixture.agencies.agencyA,
        referrerMemberId: fixture.members.saleA,
        status: 'APPROVED',
        source: 'SELF_SERVICE',
        customerEmail: `${prefix}-a@example.com`,
        customerPhone: '0900000000',
        amountCents: 10000000,
        currency: 'VND',
        packageCode: `${label}-PACKAGE-A`,
        packageName: `${label} Package A`,
        affiliateAttributionSnapshotJson: {
          ...saleAProof,
          source: 'affiliate_click',
          affiliateClickEventId: `${prefix}-click-event-a`,
          attributionModel: 'explicit_click',
          matchConfidence: 'high',
          attributionWindowDays: 30,
        },
        commissionChainSnapshotJson: saleAChain,
        activatedAt: new Date('2026-06-15T01:00:00.000Z'),
        createdAt: new Date('2026-06-15T00:30:00.000Z'),
      },
      {
        id: orderBId,
        userId: fixture.userIds.saleBUser,
        channelParticipantId: fixture.participants.saleB,
        agencyId: fixture.agencies.agencyB,
        referrerMemberId: fixture.members.saleB,
        status: 'APPROVED',
        source: 'SELF_SERVICE',
        customerEmail: `${prefix}-b@example.com`,
        amountCents: 7000000,
        currency: 'VND',
        packageCode: `${label}-PACKAGE-B`,
        packageName: `${label} Package B`,
        affiliateAttributionSnapshotJson: {
          ...saleBProof,
          source: 'affiliate_click',
          affiliateClickEventId: `${prefix}-click-event-b`,
          attributionModel: 'explicit_click',
          matchConfidence: 'high',
          attributionWindowDays: 30,
        },
        commissionChainSnapshotJson: saleBChain,
        activatedAt: new Date('2026-06-15T01:10:00.000Z'),
        createdAt: new Date('2026-06-15T00:40:00.000Z'),
      },
      {
        id: legacyOrderAId,
        userId: fixture.userIds.saleAUser,
        channelParticipantId: fixture.participants.saleA,
        agencyId: fixture.agencies.agencyA,
        referrerMemberId: fixture.members.saleA,
        status: 'APPROVED',
        source: 'SELF_SERVICE',
        customerEmail: `${prefix}-legacy@example.com`,
        amountCents: 3000000,
        currency: 'VND',
        packageCode: `${label}-PACKAGE-A`,
        packageName: `${label} Legacy Package`,
        affiliateAttributionSnapshotJson: {
          ...legacyProof,
          source: 'affiliate_click',
          affiliateClickEventId: `${prefix}-click-event-legacy`,
          attributionModel: 'explicit_click',
          matchConfidence: 'high',
          attributionWindowDays: 30,
        },
        activatedAt: new Date('2026-06-15T01:20:00.000Z'),
        createdAt: new Date('2026-06-15T00:50:00.000Z'),
      },
      ...(options.includeAggregateCurrencyRows
        ? [
            {
              id: `${prefix}-order-usd-a`,
              userId: fixture.userIds.saleAUser,
              channelParticipantId: fixture.participants.saleA,
              agencyId: fixture.agencies.agencyA,
              referrerMemberId: fixture.members.saleA,
              status: 'APPROVED' as const,
              source: 'SELF_SERVICE' as const,
              customerEmail: `${prefix}-usd@example.com`,
              amountCents: 9000,
              currency: 'USD',
              packageCode: `${label}-PACKAGE-USD`,
              packageName: `${label} USD Package`,
              affiliateAttributionSnapshotJson: {
                ...usdProof,
                source: 'affiliate_click',
                affiliateClickEventId: `${prefix}-click-event-usd`,
                attributionModel: 'explicit_click',
                matchConfidence: 'high',
                attributionWindowDays: 30,
              },
              commissionChainSnapshotJson: saleAChain,
              activatedAt: new Date('2026-06-15T01:25:00.000Z'),
              createdAt: new Date('2026-06-15T00:55:00.000Z'),
            },
          ]
        : []),
    ],
  });

  await prisma.commissionEarning.createMany({
    data: [
      {
        id: saleAEarningId,
        activationOrderId: orderAId,
        participantId: fixture.participants.saleA,
        beneficiaryType: 'SALE',
        beneficiaryUserId: fixture.userIds.saleAUser,
        baseAmountCents: 10000000,
        rateBps: 4000,
        amountCents: 4000000,
        currency: 'VND',
        attributionSnapshotJson: saleAProof,
        status: 'PENDING',
        depth: 0,
        availableAt: new Date('2026-06-20T01:00:00.000Z'),
        createdAt: new Date('2026-06-15T01:30:00.000Z'),
      },
      {
        id: managerAEarningId,
        activationOrderId: orderAId,
        participantId: fixture.participants.managerA,
        beneficiaryType: 'SALE',
        beneficiaryUserId: fixture.userIds.managerAUser,
        baseAmountCents: 10000000,
        rateBps: 1600,
        amountCents: 1600000,
        currency: 'VND',
        attributionSnapshotJson: saleAProof,
        status: 'AVAILABLE',
        depth: 1,
        availableAt: new Date('2026-06-20T01:00:00.000Z'),
        releasedAt: new Date('2026-06-21T01:00:00.000Z'),
        createdAt: new Date('2026-06-15T01:31:00.000Z'),
      },
      {
        id: saleBEarningId,
        activationOrderId: orderBId,
        participantId: fixture.participants.saleB,
        beneficiaryType: 'SALE',
        beneficiaryUserId: fixture.userIds.saleBUser,
        baseAmountCents: 7000000,
        rateBps: 4000,
        amountCents: 2800000,
        currency: 'VND',
        attributionSnapshotJson: saleBProof,
        status: 'PENDING',
        depth: 0,
        availableAt: new Date('2026-06-20T01:10:00.000Z'),
        createdAt: new Date('2026-06-15T01:32:00.000Z'),
      },
      {
        id: legacyAEarningId,
        activationOrderId: legacyOrderAId,
        participantId: fixture.participants.saleA,
        beneficiaryType: 'SALE',
        beneficiaryUserId: fixture.userIds.saleAUser,
        baseAmountCents: 3000000,
        rateBps: 4000,
        amountCents: 1200000,
        currency: 'VND',
        attributionSnapshotJson: legacyProof,
        status: 'PENDING',
        depth: 0,
        availableAt: new Date('2026-06-20T01:20:00.000Z'),
        createdAt: new Date('2026-06-15T01:33:00.000Z'),
      },
      ...(options.includeAggregateCurrencyRows
        ? [
            {
              id: `${prefix}-earning-usd-a`,
              activationOrderId: `${prefix}-order-usd-a`,
              participantId: fixture.participants.saleA,
              beneficiaryType: 'SALE' as const,
              beneficiaryUserId: fixture.userIds.saleAUser,
              baseAmountCents: 9000,
              rateBps: 2500,
              amountCents: 2500,
              currency: 'USD',
              attributionSnapshotJson: usdProof,
              status: 'AVAILABLE' as const,
              depth: 0,
              availableAt: new Date('2026-06-20T01:25:00.000Z'),
              releasedAt: new Date('2026-06-21T01:25:00.000Z'),
              createdAt: new Date('2026-06-15T01:34:00.000Z'),
            },
            {
              id: `${prefix}-earning-canceled-a`,
              activationOrderId: orderAId,
              participantId: fixture.participants.saleA,
              beneficiaryType: 'SALE' as const,
              beneficiaryUserId: fixture.userIds.saleAUser,
              baseAmountCents: 10000000,
              rateBps: 500,
              amountCents: 500000,
              currency: 'VND',
              attributionSnapshotJson: saleAProof,
              status: 'CANCELED' as const,
              depth: 0,
              availableAt: null,
              createdAt: new Date('2026-06-15T01:35:00.000Z'),
            },
          ]
        : []),
    ],
  });
}

async function seedAdditionalApprovedAffiliateOrder(
  prisma: PrismaClient,
  fixture: AffiliateFixture,
  input: {
    id: string;
    campaign: string;
    amountCents: number;
    currency: string;
    clickId: string;
    createdAt: Date;
    packageCode: string;
  },
) {
  await prisma.activationOrder.create({
    data: {
      id: input.id,
      userId: fixture.userIds.saleAUser,
      channelParticipantId: fixture.participants.saleA,
      agencyId: fixture.agencies.agencyA,
      referrerMemberId: fixture.members.saleA,
      status: 'APPROVED',
      source: 'SELF_SERVICE',
      customerEmail: `${input.id}@example.com`,
      amountCents: input.amountCents,
      currency: input.currency,
      packageCode: input.packageCode,
      packageName: 'Prompt 21 Currency Package',
      affiliateAttributionSnapshotJson: {
        source: 'affiliate_click',
        affiliateClickEventId: `${input.id}-click-event`,
        affiliateQrAssetId: null,
        agencyMemberId: fixture.members.saleA,
        clickCreatedAt: '2026-06-14T02:00:00.000Z',
        orderSnapshottedAt: '2026-06-14T02:30:00.000Z',
        attributionModel: 'explicit_click',
        matchConfidence: 'high',
        attributionWindowDays: 30,
        clickId: input.clickId,
        affiliateLinkId: fixture.created.saleALinkId,
        participantId: fixture.participants.saleA,
        agencyId: fixture.agencies.agencyA,
        referralCode: 'SNAPSHOT-REF-USD',
        campaign: input.campaign,
        channel: 'snapshot-channel-usd',
        placement: 'snapshot-placement-usd',
        packageCode: input.packageCode,
      },
      createdAt: input.createdAt,
    },
  });
}

async function financialCounts(prisma: PrismaClient) {
  const [
    activationOrders,
    subscriptions,
    walletLedgerEntries,
    commissionEarnings,
    commissionLedgerEntries,
    payoutRequests,
    payments,
    affiliateClickEvents,
  ] = await Promise.all([
    prisma.activationOrder.count(),
    prisma.subscription.count(),
    prisma.walletLedgerEntry.count(),
    prisma.commissionEarning.count(),
    prisma.commissionLedgerEntry.count(),
    prisma.payoutRequest.count(),
    prisma.payment.count(),
    prisma.affiliateClickEvent.count(),
  ]);

  return {
    activationOrders,
    subscriptions,
    walletLedgerEntries,
    commissionEarnings,
    commissionLedgerEntries,
    payoutRequests,
    payments,
    affiliateClickEvents,
  };
}
