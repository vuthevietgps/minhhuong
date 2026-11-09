import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ChannelAffiliateController } from './channel-affiliate.controller';
import { ChannelAffiliateService } from './channel-affiliate.service';
import { createChannelAffiliateServiceForTest } from './channel-affiliate.testing';
import {
  aggregateItemByKey,
  apiRoot,
  baseDatabaseUrl,
  databaseUrlForDatabase,
  financialCounts,
  seedAffiliateCommissionRows,
  seedAffiliateFixture,
} from './channel-affiliate-migration.integration.spec-fixtures';
import type { AffiliateFixture } from './channel-affiliate-migration.integration.spec-fixtures';

describe('Channel affiliate migration and scope foundation (commission reports)', () => {
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
});
