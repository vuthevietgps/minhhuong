import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ChannelAffiliatePublicController } from './channel-affiliate.controller';
import { ChannelAffiliateService } from './channel-affiliate.service';

const apiRoot = process.cwd().endsWith(`${join('apps', 'api')}`)
  ? process.cwd()
  : join(process.cwd(), 'apps', 'api');

config({ path: join(apiRoot, '../../.env') });
config({ path: join(apiRoot, '.env') });

const baseDatabaseUrl =
  process.env.DATABASE_URL ??
  'postgresql://minhhuong:minhhuong@localhost:5432/minhhuong?schema=public';

type RedirectFixture = Awaited<ReturnType<typeof seedRedirectFixture>>;

describe('Channel affiliate public redirect click foundation', () => {
  jest.setTimeout(120_000);

  const databaseName = `p17_aff_${randomUUID().replace(/-/g, '_')}`;
  let adminPrisma: PrismaClient;
  let prisma: PrismaClient;
  let service: ChannelAffiliateService;
  let controller: ChannelAffiliatePublicController;
  let fixture: RedirectFixture;

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

    service = new ChannelAffiliateService(
      prisma as any,
      {
        get: (key: string) =>
          ({
            AFFILIATE_PUBLIC_BASE_URL: 'https://go.test.minhhuong',
            AFFILIATE_REDIRECT_BASE_URL: 'https://learn.test.minhhuong/landing',
            AFFILIATE_HASH_SECRET: 'prompt17-test-secret',
          })[key],
      } as any,
    );
    controller = new ChannelAffiliatePublicController(service);
    fixture = await seedRedirectFixture(prisma);
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

  it('deploys AffiliateClickEvent schema with unique clickId, indexes, and FKs', async () => {
    const tables = await prisma.$queryRawUnsafe<Array<{ table_name: string }>>(`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
        and table_name = 'AffiliateClickEvent'
    `);
    expect(tables).toEqual([{ table_name: 'AffiliateClickEvent' }]);

    const indexes = await prisma.$queryRawUnsafe<Array<{ indexname: string }>>(`
      select indexname
      from pg_indexes
      where schemaname = 'public'
        and indexname in (
          'AffiliateClickEvent_clickId_key',
          'AffiliateClickEvent_dedupeKeyHash_key',
          'AffiliateClickEvent_affiliateLinkId_createdAt_idx',
          'AffiliateClickEvent_affiliateQrAssetId_createdAt_idx',
          'AffiliateClickEvent_participantId_createdAt_idx'
        )
    `);
    expect(indexes.map((row) => row.indexname).sort()).toEqual([
      'AffiliateClickEvent_affiliateLinkId_createdAt_idx',
      'AffiliateClickEvent_affiliateQrAssetId_createdAt_idx',
      'AffiliateClickEvent_clickId_key',
      'AffiliateClickEvent_dedupeKeyHash_key',
      'AffiliateClickEvent_participantId_createdAt_idx',
    ]);

    const constraints = await prisma.$queryRawUnsafe<
      Array<{ conname: string }>
    >(`
      select conname
      from pg_constraint
      where conname in (
        'AffiliateClickEvent_affiliateLinkId_fkey',
        'AffiliateClickEvent_affiliateQrAssetId_fkey',
        'AffiliateClickEvent_participantId_fkey',
        'AffiliateClickEvent_agencyId_fkey',
        'AffiliateClickEvent_agencyMemberId_fkey'
      )
    `);
    expect(constraints.map((row) => row.conname).sort()).toEqual([
      'AffiliateClickEvent_affiliateLinkId_fkey',
      'AffiliateClickEvent_affiliateQrAssetId_fkey',
      'AffiliateClickEvent_agencyId_fkey',
      'AffiliateClickEvent_agencyMemberId_fkey',
      'AffiliateClickEvent_participantId_fkey',
    ]);
  });

  it('creates a privacy-safe click event and redirects active links', async () => {
    const before = await financialCounts(prisma);
    const result = await service.resolvePublicRedirect({
      linkCode: fixture.linkCodes.active,
      ipAddress: '203.0.113.42',
      userAgent: 'Raw Prompt17 Browser/1.0',
      deviceHint: 'ios<script>',
      dedupeKey: 'active-click-1',
    });

    expect(result.eventCreated).toBe(true);
    expect(result.reason).toBe('active');
    expect(result.clickId).toMatch(/^clk_[0-9a-f]{24}$/);

    const redirectUrl = new URL(result.redirectUrl);
    expect(redirectUrl.origin + redirectUrl.pathname).toBe(
      'https://learn.test.minhhuong/landing',
    );
    expect(redirectUrl.searchParams.get('ref')).toBe(fixture.linkCodes.active);
    expect(redirectUrl.searchParams.get('pkg')).toBe('ENGLISH_BASIC_12M');
    expect(redirectUrl.searchParams.get('campaign')).toBe('summer2026');
    expect(redirectUrl.searchParams.get('channel')).toBe('zalo');
    expect(redirectUrl.searchParams.get('placement')).toBe('poster');
    expect(redirectUrl.searchParams.get('clickId')).toBe(result.clickId);

    const row = await prisma.affiliateClickEvent.findUniqueOrThrow({
      where: { clickId: result.clickId },
    });
    expect(row).toEqual(
      expect.objectContaining({
        affiliateLinkId: fixture.links.active,
        affiliateQrAssetId: null,
        participantId: fixture.participants.sale,
        agencyId: fixture.agencies.agency,
        agencyMemberId: fixture.members.sale,
        referralCode: 'P17-SALE-REF',
        packageCode: 'ENGLISH_BASIC_12M',
        campaign: 'summer2026',
        channel: 'zalo',
        placement: 'poster',
        deviceHint: 'iosscript',
      }),
    );
    expect(row.ipHash).toMatch(/^[a-f0-9]{64}$/);
    expect(row.userAgentHash).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(row)).not.toContain('203.0.113.42');
    expect(JSON.stringify(row)).not.toContain('Raw Prompt17 Browser/1.0');
    expect(JSON.stringify(row.metadataJson)).not.toContain('Authorization');
    expect(JSON.stringify(row.metadataJson)).not.toContain('cookie');
    await expect(financialCounts(prisma)).resolves.toEqual(before);
  });

  it('attaches valid QR assets and never attaches a QR from another link', async () => {
    const valid = await service.resolvePublicRedirect({
      linkCode: fixture.linkCodes.active,
      query: { qr: fixture.qrAssets.active },
      ipAddress: '198.51.100.10',
      userAgent: 'Prompt17 QR Browser',
      dedupeKey: 'valid-qr-click',
    });
    const validRow = await prisma.affiliateClickEvent.findUniqueOrThrow({
      where: { clickId: valid.clickId },
    });
    expect(validRow.affiliateQrAssetId).toBe(fixture.qrAssets.active);
    expect(validRow.placement).toBe('school_event');

    const invalid = await service.resolvePublicRedirect({
      linkCode: fixture.linkCodes.active,
      query: { qr: fixture.qrAssets.otherLink },
      ipAddress: '198.51.100.11',
      userAgent: 'Prompt17 Invalid QR Browser',
      dedupeKey: 'invalid-qr-click',
    });
    const invalidRow = await prisma.affiliateClickEvent.findUniqueOrThrow({
      where: { clickId: invalid.clickId },
    });
    expect(invalidRow.affiliateQrAssetId).toBeNull();
    expect(invalidRow.affiliateLinkId).toBe(fixture.links.active);

    const inactiveQr = await service.resolvePublicRedirect({
      linkCode: fixture.linkCodes.active,
      query: { qr: fixture.qrAssets.paused },
      ipAddress: '198.51.100.12',
      userAgent: 'Prompt17 Paused QR Browser',
      dedupeKey: 'paused-qr-click',
    });
    const inactiveQrRow = await prisma.affiliateClickEvent.findUniqueOrThrow({
      where: { clickId: inactiveQr.clickId },
    });
    expect(inactiveQrRow.affiliateQrAssetId).toBeNull();
  });

  it('does not create attribution events for missing, inactive, or out-of-window links', async () => {
    const before = await prisma.affiliateClickEvent.count();
    const cases = [
      { code: 'missing-link', reason: 'missing', marker: 'missing' },
      {
        code: fixture.linkCodes.paused,
        reason: 'inactive',
        marker: 'inactive',
      },
      {
        code: fixture.linkCodes.revoked,
        reason: 'inactive',
        marker: 'inactive',
      },
      {
        code: fixture.linkCodes.expiredStatus,
        reason: 'inactive',
        marker: 'inactive',
      },
      {
        code: fixture.linkCodes.expiredDate,
        reason: 'inactive',
        marker: 'inactive',
      },
      {
        code: fixture.linkCodes.futureDate,
        reason: 'inactive',
        marker: 'inactive',
      },
    ] as const;

    for (const item of cases) {
      const result = await service.resolvePublicRedirect({
        linkCode: item.code,
        ipAddress: '203.0.113.99',
        userAgent: 'Prompt17 Inactive Browser',
      });
      expect(result.eventCreated).toBe(false);
      expect(result.reason).toBe(item.reason);
      const redirectUrl = new URL(result.redirectUrl);
      expect(redirectUrl.origin + redirectUrl.pathname).toBe(
        'https://learn.test.minhhuong/landing',
      );
      expect(redirectUrl.searchParams.get('affiliate')).toBe(item.marker);
      expect(result.redirectUrl).not.toContain(fixture.participants.sale);
      expect(result.redirectUrl).not.toContain(fixture.links.active);
    }

    await expect(prisma.affiliateClickEvent.count()).resolves.toBe(before);
  });

  it('dedupes repeated requests when an explicit dedupe key is supplied', async () => {
    const first = await service.resolvePublicRedirect({
      linkCode: fixture.linkCodes.active,
      ipAddress: '203.0.113.50',
      userAgent: 'Prompt17 Dedupe Browser',
      dedupeKey: 'same-click-key',
    });
    const afterFirst = await prisma.affiliateClickEvent.count();
    const second = await service.resolvePublicRedirect({
      linkCode: fixture.linkCodes.active,
      ipAddress: '203.0.113.50',
      userAgent: 'Prompt17 Dedupe Browser',
      dedupeKey: 'same-click-key',
    });

    expect(first.eventCreated).toBe(true);
    expect(second.eventCreated).toBe(false);
    expect(second.reason).toBe('deduped');
    expect(second.clickId).toBe(first.clickId);
    expect(new URL(second.redirectUrl).searchParams.get('clickId')).toBe(
      first.clickId,
    );
    await expect(prisma.affiliateClickEvent.count()).resolves.toBe(afterFirst);
  });

  it('public controller redirects without auth guards', async () => {
    const response = {
      redirect: jest.fn(),
    };

    await controller.redirect(
      fixture.linkCodes.active,
      { dedupeKey: 'controller-click-key' },
      {
        headers: {
          'x-forwarded-for': '198.51.100.80',
          'x-device-hint': 'android-phone',
        },
        ip: '10.0.0.8',
        get: (name: string) =>
          name.toLowerCase() === 'user-agent'
            ? 'Prompt17 Controller Browser'
            : undefined,
      } as any,
      response as any,
    );

    expect(response.redirect).toHaveBeenCalledWith(
      302,
      expect.stringContaining('https://learn.test.minhhuong/landing'),
    );
  });
});

function databaseUrlForDatabase(database: string) {
  const url = new URL(baseDatabaseUrl);
  url.pathname = `/${database}`;
  url.searchParams.delete('schema');
  url.searchParams.delete('options');
  return url.toString();
}

async function seedRedirectFixture(prisma: PrismaClient) {
  const now = Date.now();
  const userIds = {
    saleUser: 'p17-sale-user',
  };
  const agencies = {
    agency: 'p17-agency',
  };
  const participants = {
    sale: 'p17-sale-participant',
  };
  const members = {
    sale: 'p17-sale-member',
  };
  const links = {
    active: 'p17-link-active',
    other: 'p17-link-other',
    paused: 'p17-link-paused',
    revoked: 'p17-link-revoked',
    expiredStatus: 'p17-link-expired-status',
    expiredDate: 'p17-link-expired-date',
    futureDate: 'p17-link-future-date',
  };
  const linkCodes = {
    active: 'mh_p17_active',
    other: 'mh_p17_other',
    paused: 'mh_p17_paused',
    revoked: 'mh_p17_revoked',
    expiredStatus: 'mh_p17_expired_status',
    expiredDate: 'mh_p17_expired_date',
    futureDate: 'mh_p17_future_date',
  };
  const qrAssets = {
    active: 'p17-qr-active',
    otherLink: 'p17-qr-other-link',
    paused: 'p17-qr-paused',
  };

  await prisma.user.create({
    data: {
      id: userIds.saleUser,
      email: 'p17-sale@example.com',
      passwordHash: 'test-hash',
      status: 'ACTIVE',
    },
  });
  await prisma.agency.create({
    data: {
      id: agencies.agency,
      code: 'P17-AGENCY',
      name: 'Prompt 17 Agency',
      defaultRateBps: 500,
    },
  });
  await prisma.channelParticipant.create({
    data: {
      id: participants.sale,
      type: 'SALE',
      code: 'P17-SALE',
      displayName: 'Prompt 17 Sale',
      userId: userIds.saleUser,
      agencyId: agencies.agency,
      lineage: `/${participants.sale}/`,
      rootParticipantId: participants.sale,
      depth: 0,
      status: 'ACTIVE',
      baseSalaryCents: 0,
    },
  });
  await prisma.agencyMember.create({
    data: {
      id: members.sale,
      agencyId: agencies.agency,
      userId: userIds.saleUser,
      role: 'SALE',
      title: 'Prompt 17 Sale',
      referralCode: 'P17-SALE-REF',
      isActive: true,
    },
  });

  await prisma.affiliateLink.createMany({
    data: [
      link({
        id: links.active,
        linkCode: linkCodes.active,
        participantId: participants.sale,
        agencyId: agencies.agency,
        agencyMemberId: members.sale,
        createdById: userIds.saleUser,
        status: 'ACTIVE',
        packageCode: 'ENGLISH_BASIC_12M',
        campaign: 'summer2026',
        channel: 'zalo',
        placement: 'poster',
      }),
      link({
        id: links.other,
        linkCode: linkCodes.other,
        participantId: participants.sale,
        agencyId: agencies.agency,
        agencyMemberId: members.sale,
        createdById: userIds.saleUser,
        status: 'ACTIVE',
      }),
      link({
        id: links.paused,
        linkCode: linkCodes.paused,
        participantId: participants.sale,
        createdById: userIds.saleUser,
        status: 'PAUSED',
      }),
      link({
        id: links.revoked,
        linkCode: linkCodes.revoked,
        participantId: participants.sale,
        createdById: userIds.saleUser,
        status: 'REVOKED',
      }),
      link({
        id: links.expiredStatus,
        linkCode: linkCodes.expiredStatus,
        participantId: participants.sale,
        createdById: userIds.saleUser,
        status: 'EXPIRED',
      }),
      link({
        id: links.expiredDate,
        linkCode: linkCodes.expiredDate,
        participantId: participants.sale,
        createdById: userIds.saleUser,
        status: 'ACTIVE',
        expiresAt: new Date(now - 86_400_000),
      }),
      link({
        id: links.futureDate,
        linkCode: linkCodes.futureDate,
        participantId: participants.sale,
        createdById: userIds.saleUser,
        status: 'ACTIVE',
        startsAt: new Date(now + 86_400_000),
      }),
    ],
  });

  await prisma.affiliateQrAsset.createMany({
    data: [
      {
        id: qrAssets.active,
        affiliateLinkId: links.active,
        createdById: userIds.saleUser,
        label: 'Prompt 17 Active QR',
        placement: 'school_event',
        encodedUrl: `https://go.test.minhhuong/r/${linkCodes.active}?qr=${qrAssets.active}`,
        status: 'ACTIVE',
      },
      {
        id: qrAssets.otherLink,
        affiliateLinkId: links.other,
        createdById: userIds.saleUser,
        label: 'Prompt 17 Other QR',
        placement: 'other_event',
        encodedUrl: `https://go.test.minhhuong/r/${linkCodes.other}?qr=${qrAssets.otherLink}`,
        status: 'ACTIVE',
      },
      {
        id: qrAssets.paused,
        affiliateLinkId: links.active,
        createdById: userIds.saleUser,
        label: 'Prompt 17 Paused QR',
        placement: 'paused_event',
        encodedUrl: `https://go.test.minhhuong/r/${linkCodes.active}?qr=${qrAssets.paused}`,
        status: 'PAUSED',
      },
    ],
  });

  return {
    userIds,
    agencies,
    participants,
    members,
    links,
    linkCodes,
    qrAssets,
  };
}

function link(input: {
  id: string;
  linkCode: string;
  participantId: string;
  createdById: string;
  status: 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'REVOKED';
  agencyId?: string;
  agencyMemberId?: string;
  packageCode?: string;
  campaign?: string;
  channel?: string;
  placement?: string;
  startsAt?: Date;
  expiresAt?: Date;
}) {
  return {
    id: input.id,
    participantId: input.participantId,
    agencyId: input.agencyId,
    agencyMemberId: input.agencyMemberId,
    createdById: input.createdById,
    referralCode: 'P17-SALE-REF',
    linkCode: input.linkCode,
    name: input.id,
    campaign: input.campaign,
    channel: input.channel,
    placement: input.placement,
    packageCode: input.packageCode,
    status: input.status,
    startsAt: input.startsAt,
    expiresAt: input.expiresAt,
  };
}

async function financialCounts(prisma: PrismaClient) {
  const [
    activationOrders,
    subscriptions,
    payments,
    commissionEarnings,
    commissionLedgerEntries,
    payoutRequests,
  ] = await Promise.all([
    prisma.activationOrder.count(),
    prisma.subscription.count(),
    prisma.payment.count(),
    prisma.commissionEarning.count(),
    prisma.commissionLedgerEntry.count(),
    prisma.payoutRequest.count(),
  ]);

  return {
    activationOrders,
    subscriptions,
    payments,
    commissionEarnings,
    commissionLedgerEntries,
    payoutRequests,
  };
}
