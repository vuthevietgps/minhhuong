// Shared fixtures for the channel-scope.integration specs (test-only).
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

export const from = '2026-06-01';

export const to = '2026-06-30';

export const createdAt = new Date('2026-06-10T08:00:00.000Z');

export const activatedAt = new Date('2026-06-11T08:00:00.000Z');

export const expiresAt = new Date('2026-07-11T08:00:00.000Z');

export type ScopeFixture = Awaited<ReturnType<typeof seedScopeFixture>>;

export function databaseUrlForDatabase(database: string) {
  const url = new URL(baseDatabaseUrl);
  url.pathname = `/${database}`;
  url.searchParams.delete('schema');
  url.searchParams.delete('options');
  return url.toString();
}

export function idsOf(rows: Array<{ id: string }>) {
  return rows.map((row) => row.id).sort();
}

export async function expectMigrationScopeSchema(prisma: PrismaClient) {
  const columns = await prisma.$queryRawUnsafe<
    Array<{ table_name: string; column_name: string }>
  >(`
    select table_name, column_name
    from information_schema.columns
    where table_schema = 'public'
      and (
        (table_name = 'ChannelParticipant' and column_name in ('parentParticipantId', 'rootParticipantId', 'lineage', 'depth'))
        or (table_name = 'CommissionEarning' and column_name in ('depth', 'availableAt', 'releasedAt'))
        or (table_name = 'ActivationOrder' and column_name = 'trialEndsAt')
      )
  `);
  const columnSet = new Set(
    columns.map((column) => `${column.table_name}.${column.column_name}`),
  );
  for (const column of [
    'ChannelParticipant.parentParticipantId',
    'ChannelParticipant.rootParticipantId',
    'ChannelParticipant.lineage',
    'ChannelParticipant.depth',
    'CommissionEarning.depth',
    'CommissionEarning.availableAt',
    'CommissionEarning.releasedAt',
    'ActivationOrder.trialEndsAt',
  ]) {
    expect(columnSet.has(column)).toBe(true);
  }

  const enumRows = await prisma.$queryRawUnsafe<Array<{ enumlabel: string }>>(`
    select enumlabel
    from pg_enum
    join pg_type on pg_type.oid = pg_enum.enumtypid
    where pg_type.typname = 'ChannelParticipantType'
    order by enumsortorder
  `);
  expect(enumRows.map((row) => row.enumlabel)).toEqual(
    expect.arrayContaining(['DIRECTOR', 'MANAGER', 'AGENCY', 'SALE']),
  );

  const indexRows = await prisma.$queryRawUnsafe<Array<{ indexname: string }>>(`
    select indexname
    from pg_indexes
    where schemaname = 'public'
      and indexname in (
        'ChannelParticipant_parentParticipantId_idx',
        'ChannelParticipant_rootParticipantId_idx',
        'ChannelParticipant_lineage_idx',
        'CommissionEarning_status_availableAt_idx',
        'ActivationOrder_trialEndsAt_idx'
      )
  `);
  const indexNames = new Set(indexRows.map((row) => row.indexname));
  for (const indexName of [
    'ChannelParticipant_parentParticipantId_idx',
    'ChannelParticipant_rootParticipantId_idx',
    'ChannelParticipant_lineage_idx',
    'CommissionEarning_status_availableAt_idx',
    'ActivationOrder_trialEndsAt_idx',
  ]) {
    expect(indexNames.has(indexName)).toBe(true);
  }

  const constraints = await prisma.$queryRawUnsafe<Array<{ conname: string }>>(`
    select conname
    from pg_constraint
    where conname = 'ChannelParticipant_parentParticipantId_fkey'
  `);
  expect(constraints.map((row) => row.conname)).toContain(
    'ChannelParticipant_parentParticipantId_fkey',
  );
}

export async function seedScopeFixture(prisma: PrismaClient) {
  const ids = {
    adminUser: 'p7-admin-user',
    opsUser: 'p7-ops-user',
    directorUser: 'p7-director-user',
    managerAUser: 'p7-manager-a-user',
    managerBUser: 'p7-manager-b-user',
    agencyAOwnerUser: 'p7-agency-a-owner-user',
    agencyBOwnerUser: 'p7-agency-b-owner-user',
    saleAUser: 'p7-sale-a-user',
    saleBUser: 'p7-sale-b-user',
    saleADirectUser: 'p7-sale-a-direct-user',
    saleBDirectUser: 'p7-sale-b-direct-user',
    unscopedUser: 'p7-unscoped-user',
    customerA: 'p7-customer-a',
    customerADirect: 'p7-customer-a-direct',
    customerAgencyA: 'p7-customer-agency-a',
    customerB: 'p7-customer-b',
    customerAgencyB: 'p7-customer-agency-b',
    directorRoot: 'p7-director-root',
    managerA: 'p7-manager-a',
    managerB: 'p7-manager-b',
    agencyA: 'p7-agency-a',
    agencyB: 'p7-agency-b',
    agencyAParticipant: 'p7-agency-a-participant',
    agencyBParticipant: 'p7-agency-b-participant',
    saleA: 'p7-sale-a',
    saleB: 'p7-sale-b',
    saleADirect: 'p7-sale-a-direct',
    saleBDirect: 'p7-sale-b-direct',
  };

  await prisma.user.createMany({
    data: [
      user(ids.adminUser, 'p7-admin@example.com'),
      user(ids.opsUser, 'p7-ops@example.com'),
      user(ids.directorUser, 'p7-director@example.com'),
      user(ids.managerAUser, 'p7-manager-a@example.com'),
      user(ids.managerBUser, 'p7-manager-b@example.com'),
      user(ids.agencyAOwnerUser, 'p7-agency-a@example.com'),
      user(ids.agencyBOwnerUser, 'p7-agency-b@example.com'),
      user(ids.saleAUser, 'p7-sale-a@example.com'),
      user(ids.saleBUser, 'p7-sale-b@example.com'),
      user(ids.saleADirectUser, 'p7-sale-a-direct@example.com'),
      user(ids.saleBDirectUser, 'p7-sale-b-direct@example.com'),
      user(ids.unscopedUser, 'p7-unscoped@example.com'),
      user(ids.customerA, 'p7-customer-a@example.com'),
      user(ids.customerADirect, 'p7-customer-a-direct@example.com'),
      user(ids.customerAgencyA, 'p7-customer-agency-a@example.com'),
      user(ids.customerB, 'p7-customer-b@example.com'),
      user(ids.customerAgencyB, 'p7-customer-agency-b@example.com'),
    ],
  });
  await prisma.profile.createMany({
    data: [
      { userId: ids.opsUser, displayName: 'Prompt 7 Operations' },
      { userId: ids.saleAUser, displayName: 'Prompt 7 Sale A User' },
      { userId: ids.saleBUser, displayName: 'Prompt 7 Sale B User' },
      { userId: ids.customerA, displayName: 'Prompt 7 Customer A' },
    ],
  });

  await prisma.agency.createMany({
    data: [
      {
        id: ids.agencyA,
        code: 'P7-AGENCY-A',
        name: 'Prompt 7 Agency A',
        defaultRateBps: 500,
      },
      {
        id: ids.agencyB,
        code: 'P7-AGENCY-B',
        name: 'Prompt 7 Agency B',
        defaultRateBps: 500,
      },
    ],
  });

  await prisma.channelParticipant.create({
    data: participant({
      id: ids.directorRoot,
      type: 'DIRECTOR',
      code: 'P7-DIRECTOR',
      displayName: 'Prompt 7 Director',
      userId: ids.directorUser,
      lineage: `/${ids.directorRoot}/`,
      depth: 0,
    }),
  });
  await prisma.channelParticipant.update({
    where: { id: ids.directorRoot },
    data: { rootParticipantId: ids.directorRoot },
  });

  await prisma.channelParticipant.createMany({
    data: [
      participant({
        id: ids.managerA,
        type: 'MANAGER',
        code: 'P7-MANAGER-A',
        displayName: 'Prompt 7 Manager A',
        userId: ids.managerAUser,
        parentParticipantId: ids.directorRoot,
        rootParticipantId: ids.directorRoot,
        lineage: `/${ids.directorRoot}/${ids.managerA}/`,
        depth: 1,
      }),
      participant({
        id: ids.managerB,
        type: 'MANAGER',
        code: 'P7-MANAGER-B',
        displayName: 'Prompt 7 Manager B',
        userId: ids.managerBUser,
        parentParticipantId: ids.directorRoot,
        rootParticipantId: ids.directorRoot,
        lineage: `/${ids.directorRoot}/${ids.managerB}/`,
        depth: 1,
      }),
    ],
  });

  await prisma.channelParticipant.createMany({
    data: [
      participant({
        id: ids.agencyAParticipant,
        type: 'AGENCY',
        code: 'P7-AGENCY-A',
        displayName: 'Prompt 7 Agency A',
        userId: ids.agencyAOwnerUser,
        agencyId: ids.agencyA,
        parentParticipantId: ids.managerA,
        rootParticipantId: ids.directorRoot,
        lineage: `/${ids.directorRoot}/${ids.managerA}/${ids.agencyAParticipant}/`,
        depth: 2,
      }),
      participant({
        id: ids.agencyBParticipant,
        type: 'AGENCY',
        code: 'P7-AGENCY-B',
        displayName: 'Prompt 7 Agency B',
        userId: ids.agencyBOwnerUser,
        agencyId: ids.agencyB,
        parentParticipantId: ids.managerB,
        rootParticipantId: ids.directorRoot,
        lineage: `/${ids.directorRoot}/${ids.managerB}/${ids.agencyBParticipant}/`,
        depth: 2,
      }),
    ],
  });

  await prisma.channelParticipant.createMany({
    data: [
      participant({
        id: ids.saleA,
        type: 'SALE',
        code: 'P7-SALE-A',
        displayName: 'Prompt 7 Sale A',
        userId: ids.saleAUser,
        parentParticipantId: ids.agencyAParticipant,
        rootParticipantId: ids.directorRoot,
        lineage: `/${ids.directorRoot}/${ids.managerA}/${ids.agencyAParticipant}/${ids.saleA}/`,
        depth: 3,
      }),
      participant({
        id: ids.saleB,
        type: 'SALE',
        code: 'P7-SALE-B',
        displayName: 'Prompt 7 Sale B',
        userId: ids.saleBUser,
        parentParticipantId: ids.agencyBParticipant,
        rootParticipantId: ids.directorRoot,
        lineage: `/${ids.directorRoot}/${ids.managerB}/${ids.agencyBParticipant}/${ids.saleB}/`,
        depth: 3,
      }),
      participant({
        id: ids.saleADirect,
        type: 'SALE',
        code: 'P7-SALE-A-DIRECT',
        displayName: 'Prompt 7 Sale A Direct',
        userId: ids.saleADirectUser,
        parentParticipantId: ids.managerA,
        rootParticipantId: ids.directorRoot,
        lineage: `/${ids.directorRoot}/${ids.managerA}/${ids.saleADirect}/`,
        depth: 2,
      }),
      participant({
        id: ids.saleBDirect,
        type: 'SALE',
        code: 'P7-SALE-B-DIRECT',
        displayName: 'Prompt 7 Sale B Direct',
        userId: ids.saleBDirectUser,
        parentParticipantId: ids.managerB,
        rootParticipantId: ids.directorRoot,
        lineage: `/${ids.directorRoot}/${ids.managerB}/${ids.saleBDirect}/`,
        depth: 2,
      }),
    ],
  });

  const orders = {
    saleA: 'p7-order-sale-a',
    saleADirect: 'p7-order-sale-a-direct',
    agencyA: 'p7-order-agency-a',
    saleB: 'p7-order-sale-b',
    agencyB: 'p7-order-agency-b',
  };
  const orderAmounts = {
    [orders.saleA]: 100_000,
    [orders.saleADirect]: 300_000,
    [orders.agencyA]: 150_000,
    [orders.saleB]: 200_000,
    [orders.agencyB]: 250_000,
  };

  await prisma.activationOrder.createMany({
    data: [
      activationOrder({
        id: orders.saleA,
        userId: ids.customerA,
        createdById: ids.saleAUser,
        channelParticipantId: ids.saleA,
        amountCents: orderAmounts[orders.saleA],
        email: 'p7-customer-a@example.com',
      }),
      activationOrder({
        id: orders.saleADirect,
        userId: ids.customerADirect,
        createdById: ids.saleADirectUser,
        channelParticipantId: ids.saleADirect,
        amountCents: orderAmounts[orders.saleADirect],
        email: 'p7-customer-a-direct@example.com',
      }),
      activationOrder({
        id: orders.agencyA,
        userId: ids.customerAgencyA,
        createdById: ids.agencyAOwnerUser,
        channelParticipantId: ids.agencyAParticipant,
        agencyId: ids.agencyA,
        amountCents: orderAmounts[orders.agencyA],
        email: 'p7-customer-agency-a@example.com',
      }),
      activationOrder({
        id: orders.saleB,
        userId: ids.customerB,
        createdById: ids.saleBUser,
        channelParticipantId: ids.saleB,
        amountCents: orderAmounts[orders.saleB],
        email: 'p7-customer-b@example.com',
      }),
      activationOrder({
        id: orders.agencyB,
        userId: ids.customerAgencyB,
        createdById: ids.agencyBOwnerUser,
        channelParticipantId: ids.agencyBParticipant,
        agencyId: ids.agencyB,
        amountCents: orderAmounts[orders.agencyB],
        email: 'p7-customer-agency-b@example.com',
      }),
    ],
  });

  await prisma.orderStatusHistory.createMany({
    data: [
      statusHistory({
        id: 'p7-history-01-create-self',
        orderId: orders.saleA,
        fromStatus: null,
        toStatus: 'WAITING_PAYMENT',
        action: 'CREATE_SELF_SERVICE',
        actorUserId: ids.customerA,
        metadataJson: { source: 'SELF_SERVICE' },
        createdAt: new Date('2026-06-10T08:00:00.000Z'),
      }),
      statusHistory({
        id: 'p7-history-02-create-assisted',
        orderId: orders.saleA,
        fromStatus: null,
        toStatus: 'PENDING_REVIEW',
        action: 'CREATE_SALE_ASSISTED',
        actorUserId: ids.saleAUser,
        metadataJson: { source: 'SALE_ASSISTED' },
        createdAt: new Date('2026-06-10T08:01:00.000Z'),
      }),
      statusHistory({
        id: 'p7-history-03-proof',
        orderId: orders.saleA,
        fromStatus: 'WAITING_PAYMENT',
        toStatus: 'PENDING_REVIEW',
        action: 'UPLOAD_PAYMENT_PROOF',
        actorUserId: ids.customerA,
        metadataJson: {
          saleInvoiceStorageKey: 'invoices/scope-proof.pdf',
          saleInvoiceMimeType: 'application/pdf',
          saleInvoiceFileSizeBytes: 1024,
          nested: { rawFileContent: 'raw-scope-content' },
        },
        createdAt: new Date('2026-06-10T08:02:00.000Z'),
      }),
      statusHistory({
        id: 'p7-history-04-resubmit',
        orderId: orders.saleA,
        fromStatus: 'REJECTED',
        toStatus: 'PENDING_REVIEW',
        action: 'RESUBMIT',
        actorUserId: ids.saleAUser,
        metadataJson: { previousReviewNotes: 'Need clearer proof' },
        createdAt: new Date('2026-06-10T08:02:00.000Z'),
      }),
      statusHistory({
        id: 'p7-history-05-approve',
        orderId: orders.saleA,
        fromStatus: 'PENDING_REVIEW',
        toStatus: 'APPROVED',
        action: 'APPROVE',
        actorUserId: ids.opsUser,
        metadataJson: { durationDays: 30 },
        createdAt: new Date('2026-06-10T08:03:00.000Z'),
      }),
      statusHistory({
        id: 'p7-history-06-reject',
        orderId: orders.saleA,
        fromStatus: 'PENDING_REVIEW',
        toStatus: 'REJECTED',
        action: 'REJECT',
        actorUserId: ids.opsUser,
        reason: 'Payment proof mismatch',
        metadataJson: { previousStatus: 'PENDING_REVIEW' },
        createdAt: new Date('2026-06-10T08:04:00.000Z'),
      }),
      statusHistory({
        id: 'p7-history-07-cancel',
        orderId: orders.saleA,
        fromStatus: 'REJECTED',
        toStatus: 'CANCELED',
        action: 'CANCEL',
        actorUserId: ids.saleAUser,
        metadataJson: { previousStatus: 'REJECTED' },
        createdAt: new Date('2026-06-10T08:05:00.000Z'),
      }),
      statusHistory({
        id: 'p7-history-08-revoke',
        orderId: orders.saleA,
        fromStatus: 'APPROVED',
        toStatus: 'REVOKED',
        action: 'REVOKE',
        actorUserId: ids.opsUser,
        reason: 'Duplicate payment reversed',
        metadataJson: {
          canceledCommissionCount: 1,
          reversedCommissionCount: 1,
          canceledSubscriptionCount: 1,
        },
        createdAt: new Date('2026-06-10T08:06:00.000Z'),
      }),
      statusHistory({
        id: 'p7-history-sale-b-01',
        orderId: orders.saleB,
        fromStatus: null,
        toStatus: 'PENDING_REVIEW',
        action: 'CREATE_SALE_ASSISTED',
        actorUserId: ids.saleBUser,
        metadataJson: { source: 'SALE_ASSISTED' },
        createdAt: new Date('2026-06-10T08:00:00.000Z'),
      }),
      statusHistory({
        id: 'p7-history-sale-b-02',
        orderId: orders.saleB,
        fromStatus: 'PENDING_REVIEW',
        toStatus: 'APPROVED',
        action: 'APPROVE',
        actorUserId: ids.opsUser,
        metadataJson: { durationDays: 30 },
        createdAt: new Date('2026-06-10T08:01:00.000Z'),
      }),
    ],
  });

  const earnings = {
    saleA: 'p7-earning-sale-a',
    saleADirect: 'p7-earning-sale-a-direct',
    agencyA: 'p7-earning-agency-a',
    saleB: 'p7-earning-sale-b',
    agencyB: 'p7-earning-agency-b',
  };
  await prisma.commissionEarning.createMany({
    data: [
      earning(
        earnings.saleA,
        orders.saleA,
        ids.saleA,
        'SALE',
        ids.saleAUser,
        null,
        10_000,
      ),
      earning(
        earnings.saleADirect,
        orders.saleADirect,
        ids.saleADirect,
        'SALE',
        ids.saleADirectUser,
        null,
        30_000,
      ),
      earning(
        earnings.agencyA,
        orders.agencyA,
        ids.agencyAParticipant,
        'AGENCY',
        null,
        ids.agencyA,
        15_000,
      ),
      earning(
        earnings.saleB,
        orders.saleB,
        ids.saleB,
        'SALE',
        ids.saleBUser,
        null,
        20_000,
      ),
      earning(
        earnings.agencyB,
        orders.agencyB,
        ids.agencyBParticipant,
        'AGENCY',
        null,
        ids.agencyB,
        25_000,
      ),
    ],
  });

  const ledger = {
    saleACredit: 'p7-ledger-sale-a-credit',
    saleAHold: 'p7-ledger-sale-a-hold',
    agencyACredit: 'p7-ledger-agency-a-credit',
    agencyARelease: 'p7-ledger-agency-a-release',
    saleBCredit: 'p7-ledger-sale-b-credit',
    agencyBCredit: 'p7-ledger-agency-b-credit',
  };
  await prisma.commissionLedgerEntry.createMany({
    data: [
      ledgerEntry(
        ledger.saleACredit,
        ids.saleA,
        ids.saleAUser,
        null,
        'CREDIT',
        10_000,
      ),
      ledgerEntry(
        ledger.saleAHold,
        ids.saleA,
        ids.saleAUser,
        null,
        'HOLD',
        5_000,
      ),
      ledgerEntry(
        ledger.agencyACredit,
        ids.agencyAParticipant,
        null,
        ids.agencyA,
        'CREDIT',
        15_000,
      ),
      ledgerEntry(
        ledger.agencyARelease,
        ids.agencyAParticipant,
        null,
        ids.agencyA,
        'RELEASE',
        12_000,
      ),
      ledgerEntry(
        ledger.saleBCredit,
        ids.saleB,
        ids.saleBUser,
        null,
        'CREDIT',
        20_000,
      ),
      ledgerEntry(
        ledger.agencyBCredit,
        ids.agencyBParticipant,
        null,
        ids.agencyB,
        'CREDIT',
        25_000,
      ),
    ],
  });

  const payouts = {
    saleA: 'p7-payout-sale-a',
    agencyA: 'p7-payout-agency-a',
    saleB: 'p7-payout-sale-b',
  };
  await prisma.payoutRequest.createMany({
    data: [
      payout(
        payouts.saleA,
        ids.saleA,
        ids.saleAUser,
        null,
        'PENDING_REVIEW',
        5_000,
      ),
      payout(
        payouts.agencyA,
        ids.agencyAParticipant,
        null,
        ids.agencyA,
        'PAID',
        12_000,
      ),
      payout(
        payouts.saleB,
        ids.saleB,
        ids.saleBUser,
        null,
        'PENDING_REVIEW',
        20_000,
      ),
    ],
  });

  const users = {
    admin: authUser(ids.adminUser, ['ADMIN']),
    ops: authUser(ids.opsUser, ['OPERATIONS']),
    director: authUser(ids.directorUser, ['DIRECTOR']),
    managerA: authUser(ids.managerAUser, ['DIRECTOR']),
    managerB: authUser(ids.managerBUser, ['DIRECTOR']),
    agencyAOwner: authUser(ids.agencyAOwnerUser, ['AGENCY_OWNER']),
    agencyBOwner: authUser(ids.agencyBOwnerUser, ['AGENCY_OWNER']),
    saleA: authUser(ids.saleAUser, ['SALE']),
    saleB: authUser(ids.saleBUser, ['SALE']),
    unscoped: authUser(ids.unscopedUser, ['SALE']),
  };

  return {
    users,
    orders,
    ledger,
    payouts,
    totals: {
      managerAApprovedRevenue:
        orderAmounts[orders.saleA] +
        orderAmounts[orders.saleADirect] +
        orderAmounts[orders.agencyA],
      globalApprovedRevenue: Object.values(orderAmounts).reduce(
        (sum, amount) => sum + amount,
        0,
      ),
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

export function authUser(sub: string, roles: string[]): AuthenticatedUser {
  return {
    sub,
    email: `${sub}@example.com`,
    roles,
  };
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

export function activationOrder(input: {
  id: string;
  userId: string;
  createdById: string;
  channelParticipantId: string;
  amountCents: number;
  email: string;
  agencyId?: string;
}) {
  return {
    id: input.id,
    userId: input.userId,
    createdById: input.createdById,
    channelParticipantId: input.channelParticipantId,
    agencyId: input.agencyId,
    status: 'APPROVED' as const,
    source: 'SALE_ASSISTED' as const,
    customerEmail: input.email,
    amountCents: input.amountCents,
    currency: 'VND',
    packageCode: 'basic-30',
    packageName: 'Basic 30',
    requestedDurationDays: 30,
    durationDays: 30,
    activatedAt,
    expiresAt,
    createdAt,
  };
}

export type OrderStatus =
  | 'WAITING_PAYMENT'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELED'
  | 'REVOKED';

export function statusHistory(input: {
  id: string;
  orderId: string;
  fromStatus?: OrderStatus | null;
  toStatus: OrderStatus;
  action: string;
  actorUserId?: string | null;
  reason?: string | null;
  metadataJson?: Record<string, unknown>;
  createdAt: Date;
}) {
  return {
    id: input.id,
    orderId: input.orderId,
    fromStatus: input.fromStatus ?? null,
    toStatus: input.toStatus,
    action: input.action,
    actorUserId: input.actorUserId ?? null,
    reason: input.reason ?? null,
    metadataJson: input.metadataJson ?? {},
    createdAt: input.createdAt,
  };
}

export function earning(
  id: string,
  activationOrderId: string,
  participantId: string,
  beneficiaryType: 'SALE' | 'AGENCY',
  beneficiaryUserId: string | null,
  beneficiaryAgencyId: string | null,
  amountCents: number,
) {
  return {
    id,
    activationOrderId,
    participantId,
    beneficiaryType,
    beneficiaryUserId,
    beneficiaryAgencyId,
    baseAmountCents: amountCents * 10,
    rateBps: 1000,
    amountCents,
    currency: 'VND',
    status: 'AVAILABLE' as const,
    depth: 0,
    availableAt: activatedAt,
    releasedAt: activatedAt,
    createdAt,
  };
}

export function ledgerEntry(
  id: string,
  participantId: string,
  beneficiaryUserId: string | null,
  beneficiaryAgencyId: string | null,
  type: 'CREDIT' | 'DEBIT' | 'HOLD' | 'RELEASE',
  amountCents: number,
) {
  return {
    id,
    participantId,
    beneficiaryUserId,
    beneficiaryAgencyId,
    type,
    amountCents,
    currency: 'VND',
    reason: `Prompt 7 ${type}`,
    referenceType: 'Prompt7Fixture',
    referenceId: id,
    createdAt,
  };
}

export function payout(
  id: string,
  participantId: string,
  beneficiaryUserId: string | null,
  beneficiaryAgencyId: string | null,
  status: 'PENDING_REVIEW' | 'PAID',
  amountCents: number,
) {
  return {
    id,
    participantId,
    beneficiaryUserId,
    beneficiaryAgencyId,
    status,
    amountCents,
    currency: 'VND',
    bankName: 'Test Bank',
    bankAccountNumber: id,
    bankAccountName: 'Prompt 7 Scope Fixture',
    createdAt,
    paidAt: status === 'PAID' ? activatedAt : null,
  };
}
