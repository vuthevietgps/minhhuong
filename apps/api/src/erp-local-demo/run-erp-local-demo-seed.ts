import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import {
  erpLocalDemoInventoryImeiStockFixture,
  erpLocalDemoLeadOrderProfitFixture,
} from './erp-local-demo.fixtures';

const outputDir = resolve(
  process.env.ERP_LOCAL_DEMO_REPORT_DIR ?? '../../exports',
);
const seedPath = join(outputDir, 'erp-local-demo-seed.json');

mkdirSync(outputDir, { recursive: true });
writeFileSync(
  seedPath,
  `${JSON.stringify(
    {
      fixtureKind: 'local-demo-only',
      productionDbUsed: false,
      providerApiUsed: false,
      liveAdsExecuted: false,
      realErpMutationUsed: false,
      fixture: erpLocalDemoLeadOrderProfitFixture,
      inventoryImeiStockFixture: erpLocalDemoInventoryImeiStockFixture,
    },
    null,
    2,
  )}\n`,
  'utf8',
);

console.log('ERP_LOCAL_DEMO_SEED PASS');
console.log(`fixture=${seedPath}`);
console.log(`leads=${erpLocalDemoLeadOrderProfitFixture.leads.length}`);
console.log(`orders=${erpLocalDemoLeadOrderProfitFixture.orders.length}`);
console.log(`adCosts=${erpLocalDemoLeadOrderProfitFixture.adCosts.length}`);
console.log(
  `inventoryProducts=${erpLocalDemoInventoryImeiStockFixture.products.length}`,
);
console.log(
  `inventoryWarehouses=${erpLocalDemoInventoryImeiStockFixture.warehouses.length}`,
);
console.log(
  `inventoryItems=${erpLocalDemoInventoryImeiStockFixture.items.length}`,
);
