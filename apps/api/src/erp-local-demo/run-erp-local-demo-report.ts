import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { ErpLocalDemoService } from './erp-local-demo.service';

const outputDir = resolve(
  process.env.ERP_LOCAL_DEMO_REPORT_DIR ?? '../../exports',
);
const service = new ErpLocalDemoService();
const report = service.buildLeadOrderProfitReport(
  undefined,
  '2026-06-29T00:00:00.000Z',
);
const inventoryReport = service.buildInventoryImeiStockReport(
  undefined,
  '2026-06-29T00:00:00.000Z',
);

mkdirSync(outputDir, { recursive: true });

const jsonPath = join(
  outputDir,
  'erp-local-demo-lead-order-profit-report.json',
);
const mdPath = join(outputDir, 'erp-local-demo-lead-order-profit-report.md');
const inventoryJsonPath = join(
  outputDir,
  'erp-local-demo-inventory-imei-stock-report.json',
);
const inventoryMdPath = join(
  outputDir,
  'erp-local-demo-inventory-imei-stock-report.md',
);

writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
writeFileSync(mdPath, service.toMarkdown(report), 'utf8');
writeFileSync(
  inventoryJsonPath,
  `${JSON.stringify(inventoryReport, null, 2)}\n`,
  'utf8',
);
writeFileSync(
  inventoryMdPath,
  service.toInventoryImeiStockMarkdown(inventoryReport),
  'utf8',
);

console.log('ERP_LOCAL_DEMO_REPORT PASS');
console.log(`json=${jsonPath}`);
console.log(`markdown=${mdPath}`);
console.log(`inventoryJson=${inventoryJsonPath}`);
console.log(`inventoryMarkdown=${inventoryMdPath}`);
console.log(`leads=${report.totals.leadCount}`);
console.log(`orders=${report.totals.orderCount}`);
console.log(`approvedOrders=${report.totals.approvedOrderCount}`);
console.log(`revenueCents=${report.totals.revenueCents}`);
console.log(`adCostCents=${report.totals.adCostCents}`);
console.log(`grossProfitCents=${report.totals.grossProfitCents}`);
console.log(`contributionProfitCents=${report.totals.contributionProfitCents}`);
console.log(`inventoryTotalStock=${inventoryReport.totals.totalStock}`);
console.log(`inventoryAvailableStock=${inventoryReport.totals.availableStock}`);
console.log(`inventoryReservedStock=${inventoryReport.totals.reservedStock}`);
console.log(`inventorySoldStock=${inventoryReport.totals.soldStock}`);
console.log(`inventoryReturnedStock=${inventoryReport.totals.returnedStock}`);
console.log(
  `inventoryBlockedDamagedStock=${inventoryReport.totals.blockedDamagedStock}`,
);
console.log(
  `inventoryMissingUnknownStock=${inventoryReport.totals.missingUnknownStock}`,
);
