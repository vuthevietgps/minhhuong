import {
  erpLocalDemoInventoryImeiStockFixture,
  erpLocalDemoLeadOrderProfitFixture,
} from './erp-local-demo.fixtures';
import { ErpLocalDemoController } from './erp-local-demo.controller';
import { ErpLocalDemoService } from './erp-local-demo.service';
import type {
  DemoInventoryStatusBucket,
  DemoInventoryStockStatus,
} from './erp-local-demo.types';

describe('ErpLocalDemoService', () => {
  const service = new ErpLocalDemoService();

  it('builds a fixture-only lead to order to profit attribution report', () => {
    const report = service.buildLeadOrderProfitReport(
      erpLocalDemoLeadOrderProfitFixture,
      '2026-06-29T00:00:00.000Z',
    );

    expect(report.safety).toEqual({
      fixtureOnly: true,
      productionDbUsed: false,
      providerApiUsed: false,
      liveAdsExecuted: false,
      realErpMutationUsed: false,
    });
    expect(report.totals).toEqual({
      leadCount: 4,
      orderCount: 3,
      approvedOrderCount: 2,
      revenueCents: 570000000,
      adCostCents: 137000000,
      costOfGoodsCents: 142500000,
      variableCostCents: 77000000,
      grossProfitCents: 427500000,
      contributionProfitCents: 213500000,
      clicks: 101,
      impressions: 7000,
    });
  });

  it('maps pending and approved orders to the same Google ads attribution row', () => {
    const report = service.buildLeadOrderProfitReport(
      erpLocalDemoLeadOrderProfitFixture,
      '2026-06-29T00:00:00.000Z',
    );
    const google = report.rows.find((row) => row.source === 'GOOGLE_ADS');

    expect(google).toEqual(
      expect.objectContaining({
        campaign: 'summer-enrollment-2026',
        adGroup: 'search-parent-intent',
        keyword: 'english for kids',
        leadCount: 2,
        orderCount: 2,
        approvedOrderCount: 1,
        revenueCents: 360000000,
        adCostCents: 65000000,
        grossProfitCents: 270000000,
        contributionProfitCents: 157000000,
        roas: 5.54,
        grossProfitRoas: 4.15,
      }),
    );
    expect(google?.leadIds).toEqual(['lead-google-001', 'lead-google-002']);
    expect(google?.orderIds).toEqual(['order-google-001', 'order-google-002']);
    expect(google?.approvedOrderIds).toEqual(['order-google-001']);
  });

  it('keeps unconverted ad leads visible as negative contribution after spend', () => {
    const report = service.buildLeadOrderProfitReport(
      erpLocalDemoLeadOrderProfitFixture,
      '2026-06-29T00:00:00.000Z',
    );
    const tiktok = report.rows.find((row) => row.source === 'TIKTOK_ADS');

    expect(tiktok).toEqual(
      expect.objectContaining({
        leadCount: 1,
        orderCount: 0,
        approvedOrderCount: 0,
        revenueCents: 0,
        adCostCents: 30000000,
        grossProfitCents: 0,
        contributionProfitCents: -30000000,
        roas: 0,
        grossProfitRoas: 0,
      }),
    );
    expect(report.leadOrderMap).toContainEqual(
      expect.objectContaining({
        leadId: 'lead-tiktok-001',
        orderId: null,
        status: 'NO_ORDER',
      }),
    );
  });

  it('builds a fixture-only inventory IMEI/serial stock report', () => {
    const report = service.buildInventoryImeiStockReport(
      erpLocalDemoInventoryImeiStockFixture,
      '2026-06-29T00:00:00.000Z',
    );

    expect(report.safety).toEqual({
      fixtureOnly: true,
      productionDbUsed: false,
      providerApiUsed: false,
      liveAdsExecuted: false,
      realErpMutationUsed: false,
      secretsRequired: false,
      inventoryMutationUsed: false,
      warehouseMutationUsed: false,
      imeiMutationUsed: false,
    });
    expect(report.totals).toEqual({
      productCount: 3,
      warehouseCount: 2,
      locationCount: 8,
      imeiSerialRowCount: 16,
      totalStock: 16,
      availableStock: 5,
      reservedStock: 2,
      soldStock: 3,
      returnedStock: 1,
      blockedDamagedStock: 3,
      missingUnknownStock: 2,
    });
  });

  it('aggregates IMEI/serial stock by SKU, warehouse, and location', () => {
    const report = service.buildInventoryImeiStockReport(
      erpLocalDemoInventoryImeiStockFixture,
      '2026-06-29T00:00:00.000Z',
    );
    const phoneHcmA1 = report.aggregates.find(
      (row) =>
        row.sku === 'MH-PHONE-X100' &&
        row.warehouseCode === 'HCM-DEMO' &&
        row.locationId === 'hcm-a1',
    );
    const phoneException = report.aggregates.find(
      (row) =>
        row.sku === 'MH-PHONE-X100' &&
        row.warehouseCode === 'HCM-DEMO' &&
        row.locationId === 'hcm-exception',
    );

    expect(phoneHcmA1).toEqual(
      expect.objectContaining({
        totalStock: 3,
        availableStock: 2,
        soldStock: 1,
      }),
    );
    expect(phoneException).toEqual(
      expect.objectContaining({
        totalStock: 2,
        missingUnknownStock: 2,
      }),
    );
  });

  it('classifies stock statuses into report buckets', () => {
    const cases: Array<[DemoInventoryStockStatus, DemoInventoryStatusBucket]> =
      [
        ['AVAILABLE', 'available'],
        ['RESERVED', 'reserved'],
        ['SOLD', 'sold'],
        ['RETURNED', 'returned'],
        ['DAMAGED', 'blockedDamaged'],
        ['BLOCKED', 'blockedDamaged'],
        ['MISSING', 'missingUnknown'],
        ['UNKNOWN', 'missingUnknown'],
      ];

    for (const [status, bucket] of cases) {
      expect(service.classifyInventoryItemStatus({ status })).toBe(bucket);
    }
  });

  it('exposes the inventory IMEI/serial stock report through the controller', () => {
    const controller = new ErpLocalDemoController(service);
    const report = controller.getInventoryImeiStockReport();

    expect(report.reportName).toBe(
      'ERP local demo Inventory -> IMEI/Serial -> Stock Status Report',
    );
    expect(report.rows).toHaveLength(16);
    expect(report.rows).toContainEqual(
      expect.objectContaining({
        sku: 'MH-PHONE-X100',
        serialNumber: 'MHX100-HCM-007',
        status: 'MISSING',
        statusBucket: 'missingUnknown',
      }),
    );
  });
});
