import { Injectable } from '@nestjs/common';
import {
  erpLocalDemoInventoryImeiStockFixture,
  erpLocalDemoLeadOrderProfitFixture,
} from './erp-local-demo.fixtures';
import type {
  DemoAttributionKey,
  DemoAttributionRow,
  DemoInventoryImeiSerialItem,
  DemoInventoryImeiStockFixture,
  DemoInventoryImeiStockReport,
  DemoInventoryLocation,
  DemoInventoryStatusBucket,
  DemoInventoryStockAggregateRow,
  DemoInventoryStockCounts,
  DemoInventoryWarehouse,
  DemoLead,
  DemoLeadOrderProfitFixture,
  DemoLeadOrderProfitReport,
  DemoOrder,
} from './erp-local-demo.types';

@Injectable()
export class ErpLocalDemoService {
  buildLeadOrderProfitReport(
    fixture: DemoLeadOrderProfitFixture = erpLocalDemoLeadOrderProfitFixture,
    generatedAt = new Date().toISOString(),
  ): DemoLeadOrderProfitReport {
    const ordersByLeadId = new Map(
      fixture.orders.map((order) => [order.leadId, order]),
    );
    const groups = new Map<string, DemoAttributionRow>();

    for (const adCost of fixture.adCosts) {
      const row = this.ensureGroup(groups, adCost);
      row.clicks += adCost.clicks;
      row.impressions += adCost.impressions;
      row.adCostCents += adCost.spendCents;
    }

    for (const lead of fixture.leads) {
      const row = this.ensureGroup(groups, lead);
      row.leadIds.push(lead.id);
      row.leadCount += 1;

      const order = ordersByLeadId.get(lead.id);
      if (!order) {
        continue;
      }

      row.orderIds.push(order.id);
      row.orderCount += 1;

      if (order.status !== 'APPROVED') {
        continue;
      }

      row.approvedOrderIds.push(order.id);
      row.approvedOrderCount += 1;
      row.revenueCents += order.amountCents;
      row.costOfGoodsCents += order.costOfGoodsCents;
      row.variableCostCents +=
        order.commissionCents + order.operationsCostCents;
    }

    const rows = [...groups.values()]
      .map((row) => this.finalizeRow(row))
      .sort((a, b) => b.contributionProfitCents - a.contributionProfitCents);

    return {
      reportName: 'ERP local demo Lead -> Order -> Profit -> Ads Attribution',
      generatedFor: fixture.generatedFor,
      generatedAt,
      currency: fixture.currency,
      safety: {
        fixtureOnly: true,
        productionDbUsed: false,
        providerApiUsed: false,
        liveAdsExecuted: false,
        realErpMutationUsed: false,
      },
      totals: rows.reduce(
        (totals, row) => ({
          leadCount: totals.leadCount + row.leadCount,
          orderCount: totals.orderCount + row.orderCount,
          approvedOrderCount:
            totals.approvedOrderCount + row.approvedOrderCount,
          revenueCents: totals.revenueCents + row.revenueCents,
          adCostCents: totals.adCostCents + row.adCostCents,
          costOfGoodsCents: totals.costOfGoodsCents + row.costOfGoodsCents,
          variableCostCents: totals.variableCostCents + row.variableCostCents,
          grossProfitCents: totals.grossProfitCents + row.grossProfitCents,
          contributionProfitCents:
            totals.contributionProfitCents + row.contributionProfitCents,
          clicks: totals.clicks + row.clicks,
          impressions: totals.impressions + row.impressions,
        }),
        {
          leadCount: 0,
          orderCount: 0,
          approvedOrderCount: 0,
          revenueCents: 0,
          adCostCents: 0,
          costOfGoodsCents: 0,
          variableCostCents: 0,
          grossProfitCents: 0,
          contributionProfitCents: 0,
          clicks: 0,
          impressions: 0,
        },
      ),
      rows,
      leadOrderMap: fixture.leads.map((lead) =>
        this.mapLeadToOrder(lead, ordersByLeadId.get(lead.id)),
      ),
    };
  }

  buildInventoryImeiStockReport(
    fixture: DemoInventoryImeiStockFixture = erpLocalDemoInventoryImeiStockFixture,
    generatedAt = new Date().toISOString(),
  ): DemoInventoryImeiStockReport {
    const productsById = new Map(
      fixture.products.map((product) => [product.id, product]),
    );
    const warehousesById = new Map(
      fixture.warehouses.map((warehouse) => [warehouse.id, warehouse]),
    );
    const locationsByWarehouseId = this.indexLocationsByWarehouse(
      fixture.warehouses,
    );

    const rows = fixture.items
      .map((item) => {
        const product = productsById.get(item.productId);
        const warehouse = warehousesById.get(item.warehouseId);
        const location = locationsByWarehouseId
          .get(item.warehouseId)
          ?.get(item.locationId);

        if (!product) {
          throw new Error(`Missing local demo product for ${item.productId}`);
        }
        if (!warehouse) {
          throw new Error(
            `Missing local demo warehouse for ${item.warehouseId}`,
          );
        }
        if (!location) {
          throw new Error(`Missing local demo location for ${item.locationId}`);
        }

        const statusBucket = this.classifyInventoryItemStatus(item);

        return {
          ...item,
          productName: product.name,
          warehouseCode: warehouse.code,
          warehouseName: warehouse.name,
          locationName: location.name,
          statusBucket,
          sellable: statusBucket === 'available',
          exception:
            statusBucket === 'blockedDamaged' ||
            statusBucket === 'missingUnknown',
        };
      })
      .sort((a, b) =>
        [a.sku, a.warehouseCode, a.locationName, a.serialNumber]
          .join('|')
          .localeCompare(
            [b.sku, b.warehouseCode, b.locationName, b.serialNumber].join('|'),
          ),
      );

    const totals = rows.reduce(
      (counts, row) => this.addInventoryStatusCount(counts, row.statusBucket),
      this.emptyInventoryCounts(),
    );

    return {
      reportName:
        'ERP local demo Inventory -> IMEI/Serial -> Stock Status Report',
      generatedFor: fixture.generatedFor,
      generatedAt,
      safety: {
        fixtureOnly: true,
        productionDbUsed: false,
        providerApiUsed: false,
        liveAdsExecuted: false,
        realErpMutationUsed: false,
        secretsRequired: false,
        inventoryMutationUsed: false,
        warehouseMutationUsed: false,
        imeiMutationUsed: false,
      },
      totals: {
        ...totals,
        productCount: fixture.products.length,
        warehouseCount: fixture.warehouses.length,
        locationCount: fixture.warehouses.reduce(
          (count, warehouse) => count + warehouse.locations.length,
          0,
        ),
        imeiSerialRowCount: rows.length,
      },
      aggregates: this.buildInventoryAggregates(rows),
      rows,
    };
  }

  classifyInventoryItemStatus(
    item: Pick<DemoInventoryImeiSerialItem, 'status'>,
  ): DemoInventoryStatusBucket {
    switch (item.status) {
      case 'AVAILABLE':
        return 'available';
      case 'RESERVED':
        return 'reserved';
      case 'SOLD':
        return 'sold';
      case 'RETURNED':
        return 'returned';
      case 'DAMAGED':
      case 'BLOCKED':
        return 'blockedDamaged';
      case 'MISSING':
      case 'UNKNOWN':
        return 'missingUnknown';
    }
  }

  toMarkdown(report: DemoLeadOrderProfitReport) {
    const money = (cents: number) =>
      `${Math.round(cents / 100).toLocaleString('en-US')} ${report.currency}`;
    const ratio = (value: number | null) =>
      value === null ? 'n/a' : value.toFixed(2);

    const lines = [
      `# ${report.reportName}`,
      '',
      `Generated at: ${report.generatedAt}`,
      '',
      '## Safety',
      '',
      '- Fixture-only local demo data.',
      '- productionDbUsed=false',
      '- providerApiUsed=false',
      '- liveAdsExecuted=false',
      '- realErpMutationUsed=false',
      '',
      '## Totals',
      '',
      `- Leads: ${report.totals.leadCount}`,
      `- Orders: ${report.totals.orderCount}`,
      `- Approved orders: ${report.totals.approvedOrderCount}`,
      `- Revenue: ${money(report.totals.revenueCents)}`,
      `- Ads cost: ${money(report.totals.adCostCents)}`,
      `- Gross profit: ${money(report.totals.grossProfitCents)}`,
      `- Contribution profit after ads: ${money(
        report.totals.contributionProfitCents,
      )}`,
      '',
      '## Attribution Rows',
      '',
      '| Source | Campaign | Ad group | Keyword | Leads | Approved orders | Revenue | Ads cost | Gross profit | Contribution profit | ROAS |',
      '| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
      ...report.rows.map(
        (row) =>
          `| ${[
            row.source,
            row.campaign,
            row.adGroup,
            row.keyword ?? '',
            String(row.leadCount),
            String(row.approvedOrderCount),
            money(row.revenueCents),
            money(row.adCostCents),
            money(row.grossProfitCents),
            money(row.contributionProfitCents),
            ratio(row.roas),
          ].join(' | ')} |`,
      ),
      '',
      '## Lead Order Map',
      '',
      '| Lead | Order | Source | Campaign | Status | Revenue | Gross profit | Contribution before ads |',
      '| --- | --- | --- | --- | --- | ---: | ---: | ---: |',
      ...report.leadOrderMap.map(
        (item) =>
          `| ${[
            item.leadId,
            item.orderId ?? '',
            item.source,
            item.campaign,
            item.status,
            money(item.revenueCents),
            money(item.grossProfitCents),
            money(item.contributionBeforeAdCostCents),
          ].join(' | ')} |`,
      ),
      '',
    ];

    return lines.join('\n');
  }

  toInventoryImeiStockMarkdown(report: DemoInventoryImeiStockReport) {
    const lines = [
      `# ${report.reportName}`,
      '',
      `Generated at: ${report.generatedAt}`,
      '',
      '## Safety',
      '',
      '- Fixture-only local demo data.',
      '- productionDbUsed=false',
      '- providerApiUsed=false',
      '- liveAdsExecuted=false',
      '- realErpMutationUsed=false',
      '- inventoryMutationUsed=false',
      '- warehouseMutationUsed=false',
      '- imeiMutationUsed=false',
      '- secretsRequired=false',
      '',
      '## Totals',
      '',
      `- Products: ${report.totals.productCount}`,
      `- Warehouses: ${report.totals.warehouseCount}`,
      `- Locations: ${report.totals.locationCount}`,
      `- IMEI/serial rows: ${report.totals.imeiSerialRowCount}`,
      `- Total stock: ${report.totals.totalStock}`,
      `- Available stock: ${report.totals.availableStock}`,
      `- Reserved stock: ${report.totals.reservedStock}`,
      `- Sold stock: ${report.totals.soldStock}`,
      `- Returned stock: ${report.totals.returnedStock}`,
      `- Blocked/damaged stock: ${report.totals.blockedDamagedStock}`,
      `- Missing/unknown stock: ${report.totals.missingUnknownStock}`,
      '',
      '## Stock Aggregates',
      '',
      '| SKU | Product | Warehouse | Location | Total | Available | Reserved | Sold | Returned | Blocked/damaged | Missing/unknown |',
      '| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
      ...report.aggregates.map(
        (row) =>
          `| ${[
            row.sku,
            row.productName,
            row.warehouseCode,
            row.locationName,
            String(row.totalStock),
            String(row.availableStock),
            String(row.reservedStock),
            String(row.soldStock),
            String(row.returnedStock),
            String(row.blockedDamagedStock),
            String(row.missingUnknownStock),
          ].join(' | ')} |`,
      ),
      '',
      '## IMEI/Serial Status Rows',
      '',
      '| SKU | Product | Warehouse | Location | IMEI | Serial | Status | Bucket | Condition | Related order | Reason |',
      '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
      ...report.rows.map(
        (row) =>
          `| ${[
            row.sku,
            row.productName,
            row.warehouseCode,
            row.locationName,
            row.imei ?? '',
            row.serialNumber,
            row.status,
            row.statusBucket,
            row.condition,
            row.relatedOrderId ?? '',
            row.statusReason ?? '',
          ].join(' | ')} |`,
      ),
      '',
    ];

    return lines.join('\n');
  }

  private ensureGroup(
    groups: Map<string, DemoAttributionRow>,
    key: DemoAttributionKey,
  ) {
    const groupKey = this.groupKey(key);
    const existing = groups.get(groupKey);
    if (existing) {
      return existing;
    }

    const row: DemoAttributionRow = {
      source: key.source,
      campaign: key.campaign,
      adGroup: key.adGroup,
      keyword: key.keyword,
      leadIds: [],
      orderIds: [],
      approvedOrderIds: [],
      leadCount: 0,
      orderCount: 0,
      approvedOrderCount: 0,
      revenueCents: 0,
      adCostCents: 0,
      costOfGoodsCents: 0,
      variableCostCents: 0,
      grossProfitCents: 0,
      contributionProfitCents: 0,
      clicks: 0,
      impressions: 0,
      costPerLeadCents: null,
      revenuePerLeadCents: null,
      roas: null,
      grossProfitRoas: null,
    };

    groups.set(groupKey, row);
    return row;
  }

  private buildInventoryAggregates(rows: DemoInventoryImeiStockReport['rows']) {
    const aggregates = new Map<string, DemoInventoryStockAggregateRow>();

    for (const row of rows) {
      const aggregateKey = [
        row.productId,
        row.warehouseId,
        row.locationId,
      ].join('|');
      const existing = aggregates.get(aggregateKey);
      const aggregate =
        existing ??
        ({
          productId: row.productId,
          sku: row.sku,
          productName: row.productName,
          warehouseId: row.warehouseId,
          warehouseCode: row.warehouseCode,
          warehouseName: row.warehouseName,
          locationId: row.locationId,
          locationName: row.locationName,
          ...this.emptyInventoryCounts(),
        } satisfies DemoInventoryStockAggregateRow);

      this.addInventoryStatusCount(aggregate, row.statusBucket);
      aggregates.set(aggregateKey, aggregate);
    }

    return [...aggregates.values()].sort((a, b) =>
      [a.sku, a.warehouseCode, a.locationName]
        .join('|')
        .localeCompare([b.sku, b.warehouseCode, b.locationName].join('|')),
    );
  }

  private addInventoryStatusCount<T extends DemoInventoryStockCounts>(
    counts: T,
    bucket: DemoInventoryStatusBucket,
  ) {
    counts.totalStock += 1;

    switch (bucket) {
      case 'available':
        counts.availableStock += 1;
        break;
      case 'reserved':
        counts.reservedStock += 1;
        break;
      case 'sold':
        counts.soldStock += 1;
        break;
      case 'returned':
        counts.returnedStock += 1;
        break;
      case 'blockedDamaged':
        counts.blockedDamagedStock += 1;
        break;
      case 'missingUnknown':
        counts.missingUnknownStock += 1;
        break;
    }

    return counts;
  }

  private emptyInventoryCounts(): DemoInventoryStockCounts {
    return {
      totalStock: 0,
      availableStock: 0,
      reservedStock: 0,
      soldStock: 0,
      returnedStock: 0,
      blockedDamagedStock: 0,
      missingUnknownStock: 0,
    };
  }

  private indexLocationsByWarehouse(warehouses: DemoInventoryWarehouse[]) {
    return new Map<string, Map<string, DemoInventoryLocation>>(
      warehouses.map((warehouse) => [
        warehouse.id,
        new Map(warehouse.locations.map((location) => [location.id, location])),
      ]),
    );
  }

  private finalizeRow(row: DemoAttributionRow): DemoAttributionRow {
    const grossProfitCents = row.revenueCents - row.costOfGoodsCents;
    const contributionProfitCents =
      grossProfitCents - row.variableCostCents - row.adCostCents;

    return {
      ...row,
      grossProfitCents,
      contributionProfitCents,
      costPerLeadCents:
        row.leadCount > 0 ? Math.round(row.adCostCents / row.leadCount) : null,
      revenuePerLeadCents:
        row.leadCount > 0 ? Math.round(row.revenueCents / row.leadCount) : null,
      roas:
        row.adCostCents > 0
          ? this.roundRatio(row.revenueCents / row.adCostCents)
          : null,
      grossProfitRoas:
        row.adCostCents > 0
          ? this.roundRatio(grossProfitCents / row.adCostCents)
          : null,
    };
  }

  private mapLeadToOrder(
    lead: DemoLead,
    order?: DemoOrder,
  ): DemoLeadOrderProfitReport['leadOrderMap'][number] {
    const approved = order?.status === 'APPROVED';
    const revenueCents = approved ? order.amountCents : 0;
    const grossProfitCents = approved
      ? order.amountCents - order.costOfGoodsCents
      : 0;
    const contributionBeforeAdCostCents = approved
      ? grossProfitCents - order.commissionCents - order.operationsCostCents
      : 0;

    return {
      leadId: lead.id,
      orderId: order?.id ?? null,
      source: lead.source,
      campaign: lead.campaign,
      adGroup: lead.adGroup,
      keyword: lead.keyword,
      status: order?.status ?? 'NO_ORDER',
      revenueCents,
      grossProfitCents,
      contributionBeforeAdCostCents,
    };
  }

  private groupKey(key: DemoAttributionKey) {
    return [key.source, key.campaign, key.adGroup, key.keyword ?? ''].join('|');
  }

  private roundRatio(value: number) {
    return Math.round(value * 100) / 100;
  }
}
