import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { NotFoundException } from '@nestjs/common';
import { ActivationOrdersService } from '../activation-orders/activation-orders.service';
import { createActivationOrdersServiceForTest } from '../activation-orders/activation-orders.testing';
import { ChannelFinanceService } from './channel-finance.service';
import { createChannelFinanceServiceForTest } from './channel-finance.testing';
import {
  apiRoot,
  baseDatabaseUrl,
  databaseUrlForDatabase,
  expectMigrationScopeSchema,
  from,
  idsOf,
  seedScopeFixture,
  to,
} from './channel-scope.integration.spec-fixtures';
import type { ScopeFixture } from './channel-scope.integration.spec-fixtures';

describe('Commercial channel scope integration (orders and finance)', () => {
  jest.setTimeout(120_000);

  const databaseName = `prompt8_scope_${randomUUID().replace(/-/g, '_')}`;

  let adminPrisma: PrismaClient;

  let prisma: PrismaClient;

  let activationOrders: ActivationOrdersService;

  let channelFinance: ChannelFinanceService;

  let fixture: ScopeFixture;

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
    await expectMigrationScopeSchema(prisma);

    activationOrders = createActivationOrdersServiceForTest(
      prisma as any,
      {
        sendOrderCreated: jest.fn(),
        sendOrderApproved: jest.fn(),
        sendOrderRejected: jest.fn(),
        sendOrderRevoked: jest.fn(),
      } as any,
    );
    channelFinance = createChannelFinanceServiceForTest(prisma as any);
    fixture = await seedScopeFixture(prisma);
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

  it('filters activation orders by sale, manager, director, and admin/ops scopes', async () => {
    const saleAOrders = await activationOrders.listOrders(fixture.users.saleA, {
      limit: 20,
    });
    expect(idsOf(saleAOrders.items)).toEqual([fixture.orders.saleA]);
    expect(saleAOrders.items[0]).not.toHaveProperty('statusHistory');

    const managerAOrders = await activationOrders.listOrders(
      fixture.users.managerA,
      { limit: 20 },
    );
    expect(idsOf(managerAOrders.items)).toEqual(
      expect.arrayContaining([
        fixture.orders.agencyA,
        fixture.orders.saleA,
        fixture.orders.saleADirect,
      ]),
    );
    expect(idsOf(managerAOrders.items)).not.toEqual(
      expect.arrayContaining([fixture.orders.saleB, fixture.orders.agencyB]),
    );

    const directorOrders = await activationOrders.listOrders(
      fixture.users.director,
      { limit: 20 },
    );
    expect(idsOf(directorOrders.items)).toEqual(
      expect.arrayContaining(Object.values(fixture.orders)),
    );

    const adminOrders = await activationOrders.listOrders(fixture.users.admin, {
      limit: 20,
    });
    expect(idsOf(adminOrders.items)).toEqual(
      expect.arrayContaining(Object.values(fixture.orders)),
    );

    const opsOrders = await activationOrders.listOrders(fixture.users.ops, {
      limit: 20,
    });
    expect(idsOf(opsOrders.items)).toEqual(
      expect.arrayContaining(Object.values(fixture.orders)),
    );

    const unscopedOrders = await activationOrders.listOrders(
      fixture.users.unscoped,
      { limit: 20 },
    );
    expect(unscopedOrders.items).toHaveLength(0);
  });

  it('reads activation order status history through the same channel scope', async () => {
    const saleAHistory = await activationOrders.getStatusHistory(
      fixture.orders.saleA,
      fixture.users.saleA,
    );
    expect(saleAHistory.items.map((item) => item.action)).toEqual([
      'CREATE_SELF_SERVICE',
      'CREATE_SALE_ASSISTED',
      'UPLOAD_PAYMENT_PROOF',
      'RESUBMIT',
      'APPROVE',
      'REJECT',
      'CANCEL',
      'REVOKE',
    ]);
    expect(saleAHistory.items.map((item) => item.id)).toEqual([
      'p7-history-01-create-self',
      'p7-history-02-create-assisted',
      'p7-history-03-proof',
      'p7-history-04-resubmit',
      'p7-history-05-approve',
      'p7-history-06-reject',
      'p7-history-07-cancel',
      'p7-history-08-revoke',
    ]);
    expect(saleAHistory.items[2].metadataJson).toEqual(
      expect.objectContaining({
        saleInvoiceStorageKey: 'scope-proof.pdf',
        nested: expect.objectContaining({
          rawFileContent: '[redacted]',
        }),
      }),
    );
    expect(saleAHistory.items[1].actor).toEqual({
      id: 'p7-sale-a-user',
      displayName: 'Prompt 7 Sale A User',
      email: 'p7-sale-a@example.com',
    });
    expect(saleAHistory.items[4].actor).toEqual({
      id: 'p7-ops-user',
      displayName: 'Prompt 7 Operations',
      email: 'p7-ops@example.com',
    });
    expect(Object.keys(saleAHistory.items[4].actor ?? {}).sort()).toEqual([
      'displayName',
      'email',
      'id',
    ]);
    const serialized = JSON.stringify(saleAHistory.items);
    expect(serialized).not.toContain('invoices/scope-proof.pdf');
    expect(serialized).not.toContain('raw-scope-content');
    expect(serialized).not.toContain('passwordHash');
    expect(serialized).not.toContain('roles');
    expect(serialized).not.toContain('childProfiles');
    expect(serialized).not.toContain('payments');

    const managerAHistory = await activationOrders.getStatusHistory(
      fixture.orders.saleA,
      fixture.users.managerA,
    );
    expect(managerAHistory.items).toHaveLength(8);

    const opsHistory = await activationOrders.getStatusHistory(
      fixture.orders.saleB,
      fixture.users.ops,
    );
    expect(opsHistory.items.map((item) => item.action)).toEqual([
      'CREATE_SALE_ASSISTED',
      'APPROVE',
    ]);

    await expect(
      activationOrders.getStatusHistory(
        fixture.orders.saleA,
        fixture.users.saleB,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      activationOrders.getStatusHistory(
        fixture.orders.saleA,
        fixture.users.managerB,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      activationOrders.getStatusHistory(
        fixture.orders.saleA,
        fixture.users.agencyBOwner,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      activationOrders.getStatusHistory(
        fixture.orders.saleA,
        fixture.users.unscoped,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('filters finance report, overview, wallet, payouts, and CSV by channel subtree', async () => {
    const managerAReport = await channelFinance.getReport(
      { from, to },
      fixture.users.managerA,
    );
    expect(managerAReport.approvedRevenue).toEqual(
      expect.objectContaining({
        orderCount: 3,
        amountCents: fixture.totals.managerAApprovedRevenue,
      }),
    );
    expect(idsOf(managerAReport.recentApprovedOrders)).toEqual(
      expect.arrayContaining([
        fixture.orders.agencyA,
        fixture.orders.saleA,
        fixture.orders.saleADirect,
      ]),
    );
    expect(idsOf(managerAReport.recentApprovedOrders)).not.toEqual(
      expect.arrayContaining([fixture.orders.saleB, fixture.orders.agencyB]),
    );
    expect(idsOf(managerAReport.recentPayouts)).not.toEqual(
      expect.arrayContaining([fixture.payouts.saleB]),
    );

    const managerAOverview = await channelFinance.getOverview(
      fixture.users.managerA,
    );
    expect(managerAOverview).toEqual(
      expect.objectContaining({
        orders: 3,
        approvedOrderCount: 3,
        approvedRevenueCents: fixture.totals.managerAApprovedRevenue,
      }),
    );

    const managerAWallet = await channelFinance.getWallet(
      fixture.users.managerA,
    );
    expect(idsOf(managerAWallet.entries)).toEqual(
      expect.arrayContaining([
        fixture.ledger.saleACredit,
        fixture.ledger.agencyACredit,
      ]),
    );
    expect(idsOf(managerAWallet.entries)).not.toEqual(
      expect.arrayContaining([
        fixture.ledger.saleBCredit,
        fixture.ledger.agencyBCredit,
      ]),
    );

    const managerAPayouts = await channelFinance.listPayoutRequests(
      fixture.users.managerA,
    );
    expect(idsOf(managerAPayouts)).toEqual(
      expect.arrayContaining([fixture.payouts.saleA, fixture.payouts.agencyA]),
    );
    expect(idsOf(managerAPayouts)).not.toEqual(
      expect.arrayContaining([fixture.payouts.saleB]),
    );

    const csv = await channelFinance.getOrdersCsv(
      { from, to },
      fixture.users.managerA,
    );
    expect(csv).toContain(fixture.orders.saleA);
    expect(csv).toContain(fixture.orders.agencyA);
    expect(csv).not.toContain(fixture.orders.saleB);
    expect(csv).not.toContain(fixture.orders.agencyB);
  });

  it('keeps admin/operations global finance scope and empty participant scope safe', async () => {
    await expect(
      channelFinance.getOverview(fixture.users.admin),
    ).resolves.toEqual(
      expect.objectContaining({
        orders: 5,
        approvedOrderCount: 5,
        approvedRevenueCents: fixture.totals.globalApprovedRevenue,
      }),
    );
    await expect(
      channelFinance.getOverview(fixture.users.ops),
    ).resolves.toEqual(
      expect.objectContaining({
        orders: 5,
        approvedOrderCount: 5,
        approvedRevenueCents: fixture.totals.globalApprovedRevenue,
      }),
    );

    const emptyOverview = await channelFinance.getOverview(
      fixture.users.unscoped,
    );
    expect(emptyOverview).toEqual(
      expect.objectContaining({
        orders: 0,
        approvedOrderCount: 0,
        approvedRevenueCents: 0,
        pendingPayoutCount: 0,
      }),
    );

    const adminCsv = await channelFinance.getOrdersCsv(
      { from, to },
      fixture.users.admin,
    );
    expect(adminCsv).toContain(fixture.orders.saleA);
    expect(adminCsv).toContain(fixture.orders.saleB);
  });
});
