import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ChannelAffiliateController } from './channel-affiliate.controller';
import { ChannelAffiliateService } from './channel-affiliate.service';
import { createChannelAffiliateServiceForTest } from './channel-affiliate.testing';
import {
  affiliateReportAccessAuditsForCampaign,
  aggregateExportHeader,
  aggregateItemByKey,
  apiRoot,
  baseDatabaseUrl,
  databaseUrlForDatabase,
  financialCounts,
  listExportHeader,
  seedAdditionalApprovedAffiliateOrder,
  seedAffiliateFixture,
  seedAffiliateOrderAttributionOrders,
} from './channel-affiliate-migration.integration.spec-fixtures';
import type { AffiliateFixture } from './channel-affiliate-migration.integration.spec-fixtures';

describe('Channel affiliate migration and scope foundation (order aggregates, exports and audits)', () => {
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
});
