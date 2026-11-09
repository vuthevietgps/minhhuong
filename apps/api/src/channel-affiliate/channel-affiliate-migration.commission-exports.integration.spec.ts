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
  apiRoot,
  baseDatabaseUrl,
  commissionAggregateExportHeader,
  commissionListExportHeader,
  databaseUrlForDatabase,
  financialCounts,
  seedAffiliateCommissionRows,
  seedAffiliateFixture,
} from './channel-affiliate-migration.integration.spec-fixtures';
import type { AffiliateFixture } from './channel-affiliate-migration.integration.spec-fixtures';

describe('Channel affiliate migration and scope foundation (commission exports, validation and mutations)', () => {
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
