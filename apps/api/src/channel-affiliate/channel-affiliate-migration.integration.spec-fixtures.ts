// Shared fixtures for the channel-affiliate-migration.integration specs (test-only).
import { join } from 'node:path';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/auth.types';

export const apiRoot = process.cwd().endsWith(`${join('apps', 'api')}`)
  ? process.cwd()
  : join(process.cwd(), 'apps', 'api');

config({ path: join(apiRoot, '../../.env') });

config({ path: join(apiRoot, '.env') });

export const baseDatabaseUrl =
  process.env.DATABASE_URL ??
  'postgresql://minhhuong:minhhuong@localhost:5432/minhhuong?schema=public';

export type AffiliateFixture = Awaited<ReturnType<typeof seedAffiliateFixture>>;

export const listExportHeader =
  'orderId,orderStatus,orderCreatedAt,approvedAmountCents,approvedCurrency,clickId,affiliateLinkId,affiliateQrAssetId,participantId,agencyId,agencyMemberId,referralCode,campaign,channel,placement,packageCode,clickCreatedAt,orderSnapshottedAt,attributionModel,matchConfidence,attributionWindowDays';

export const aggregateExportHeader =
  'groupBy,snapshotField,key,totalAttributedOrders,approvedOrders,countByStatus,approvedAmountCentsByCurrency,approvedAmountCents,firstOrderCreatedAt,lastOrderCreatedAt';

export const commissionListExportHeader =
  'commissionEarningId,activationOrderId,orderStatus,orderCreatedAt,orderApprovedAt,participantId,beneficiaryType,beneficiaryId,depth,status,baseAmountCents,rateBps,amountCents,currency,availableAt,createdAt,updatedAt,affiliateProofSource,affiliateParticipantId,agencyId,agencyMemberId,referralCode,affiliateLinkId,affiliateQrAssetId,campaign,channel,placement,packageCode,clickId,clickCreatedAt,orderSnapshottedAt,commissionChainSnapshotStatus,chainPolicyVersion,chainRootParticipantId,chainDepth,chainSnapshotStatus';

export const commissionAggregateExportHeader =
  'groupBy,key,totalCommissions,pendingCommissions,releasedCommissions,revokedCommissions,availableCommissions,countByStatus,totalAmountCentsByCurrency,pendingAmountCentsByCurrency,releasedAmountCentsByCurrency,availableAmountCentsByCurrency,totalAmountCents,firstCommissionCreatedAt,lastCommissionCreatedAt';

export function databaseUrlForDatabase(database: string) {
  const url = new URL(baseDatabaseUrl);
  url.pathname = `/${database}`;
  url.searchParams.delete('schema');
  url.searchParams.delete('options');
  return url.toString();
}

export async function seedAffiliateFixture(prisma: PrismaClient) {
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

export function user(id: string, email: string) {
  return {
    id,
    email,
    passwordHash: 'test-hash',
    status: 'ACTIVE' as const,
  };
}

export function authUser(
  sub: string,
  email: string,
  roles: AuthenticatedUser['roles'],
): AuthenticatedUser {
  return { sub, email, roles };
}

export function participant(input: {
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

export function agencyMember(
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

export function idsOf(rows: Array<{ id: string }>) {
  return rows.map((row) => row.id).sort();
}

export function aggregateItemByKey<
  T extends { items: Array<{ key: string | null }> },
>(result: T, key: string | null) {
  const item = result.items.find((row) => row.key === key);
  expect(item).toBeDefined();
  return item;
}

export async function affiliateReportAccessAuditsForCampaign(
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

export async function seedAffiliateOrderAttributionOrders(
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

export async function seedAffiliateCommissionRows(
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

export async function seedAdditionalApprovedAffiliateOrder(
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

export async function financialCounts(prisma: PrismaClient) {
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
