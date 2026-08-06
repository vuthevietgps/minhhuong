export type DemoAdSource =
  'GOOGLE_ADS' | 'FACEBOOK_ADS' | 'TIKTOK_ADS' | 'DIRECT';

export type DemoOrderStatus =
  'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELED';

export type DemoAttributionKey = {
  source: DemoAdSource;
  campaign: string;
  adGroup: string;
  keyword?: string;
};

export type DemoLead = DemoAttributionKey & {
  id: string;
  capturedAt: string;
  clickId?: string;
  landingPage: string;
  customerEmail: string;
  packageCode: string;
};

export type DemoOrder = {
  id: string;
  leadId: string;
  orderedAt: string;
  status: DemoOrderStatus;
  amountCents: number;
  costOfGoodsCents: number;
  commissionCents: number;
  operationsCostCents: number;
  currency: 'VND';
  packageCode: string;
  packageName: string;
};

export type DemoAdCost = DemoAttributionKey & {
  spendCents: number;
  clicks: number;
  impressions: number;
};

export type DemoLeadOrderProfitFixture = {
  generatedFor: string;
  currency: 'VND';
  leads: DemoLead[];
  orders: DemoOrder[];
  adCosts: DemoAdCost[];
};

export type DemoAttributionRow = DemoAttributionKey & {
  leadIds: string[];
  orderIds: string[];
  approvedOrderIds: string[];
  leadCount: number;
  orderCount: number;
  approvedOrderCount: number;
  revenueCents: number;
  adCostCents: number;
  costOfGoodsCents: number;
  variableCostCents: number;
  grossProfitCents: number;
  contributionProfitCents: number;
  clicks: number;
  impressions: number;
  costPerLeadCents: number | null;
  revenuePerLeadCents: number | null;
  roas: number | null;
  grossProfitRoas: number | null;
};

export type DemoLeadOrderProfitReport = {
  reportName: string;
  generatedFor: string;
  generatedAt: string;
  currency: 'VND';
  safety: {
    fixtureOnly: true;
    productionDbUsed: false;
    providerApiUsed: false;
    liveAdsExecuted: false;
    realErpMutationUsed: false;
  };
  totals: {
    leadCount: number;
    orderCount: number;
    approvedOrderCount: number;
    revenueCents: number;
    adCostCents: number;
    costOfGoodsCents: number;
    variableCostCents: number;
    grossProfitCents: number;
    contributionProfitCents: number;
    clicks: number;
    impressions: number;
  };
  rows: DemoAttributionRow[];
  leadOrderMap: Array<{
    leadId: string;
    orderId: string | null;
    source: DemoAdSource;
    campaign: string;
    adGroup: string;
    keyword?: string;
    status: DemoOrderStatus | 'NO_ORDER';
    revenueCents: number;
    grossProfitCents: number;
    contributionBeforeAdCostCents: number;
  }>;
};

export type DemoInventoryTrackingMode = 'IMEI' | 'SERIAL';

export type DemoInventoryStockStatus =
  | 'AVAILABLE'
  | 'RESERVED'
  | 'SOLD'
  | 'RETURNED'
  | 'DAMAGED'
  | 'BLOCKED'
  | 'MISSING'
  | 'UNKNOWN';

export type DemoInventoryStatusBucket =
  | 'available'
  | 'reserved'
  | 'sold'
  | 'returned'
  | 'blockedDamaged'
  | 'missingUnknown';

export type DemoInventoryProduct = {
  id: string;
  sku: string;
  name: string;
  category: string;
  trackingMode: DemoInventoryTrackingMode;
};

export type DemoInventoryLocation = {
  id: string;
  name: string;
  type: 'SELLABLE' | 'RESERVE' | 'RETURN' | 'BLOCKED' | 'EXCEPTION';
};

export type DemoInventoryWarehouse = {
  id: string;
  code: string;
  name: string;
  city: string;
  locations: DemoInventoryLocation[];
};

export type DemoInventoryCondition =
  'NEW' | 'OPEN_BOX' | 'RETURNED' | 'DAMAGED' | 'UNKNOWN';

export type DemoInventoryImeiSerialItem = {
  id: string;
  productId: string;
  sku: string;
  warehouseId: string;
  locationId: string;
  imei?: string;
  serialNumber: string;
  status: DemoInventoryStockStatus;
  condition: DemoInventoryCondition;
  statusAt: string;
  statusReason?: string;
  relatedOrderId?: string;
};

export type DemoInventoryImeiStockFixture = {
  generatedFor: string;
  products: DemoInventoryProduct[];
  warehouses: DemoInventoryWarehouse[];
  items: DemoInventoryImeiSerialItem[];
};

export type DemoInventoryStockCounts = {
  totalStock: number;
  availableStock: number;
  reservedStock: number;
  soldStock: number;
  returnedStock: number;
  blockedDamagedStock: number;
  missingUnknownStock: number;
};

export type DemoInventoryStockReportRow = DemoInventoryImeiSerialItem & {
  productName: string;
  warehouseCode: string;
  warehouseName: string;
  locationName: string;
  statusBucket: DemoInventoryStatusBucket;
  sellable: boolean;
  exception: boolean;
};

export type DemoInventoryStockAggregateRow = DemoInventoryStockCounts & {
  productId: string;
  sku: string;
  productName: string;
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  locationId: string;
  locationName: string;
};

export type DemoInventoryImeiStockReport = {
  reportName: string;
  generatedFor: string;
  generatedAt: string;
  safety: {
    fixtureOnly: true;
    productionDbUsed: false;
    providerApiUsed: false;
    liveAdsExecuted: false;
    realErpMutationUsed: false;
    secretsRequired: false;
    inventoryMutationUsed: false;
    warehouseMutationUsed: false;
    imeiMutationUsed: false;
  };
  totals: DemoInventoryStockCounts & {
    productCount: number;
    warehouseCount: number;
    locationCount: number;
    imeiSerialRowCount: number;
  };
  aggregates: DemoInventoryStockAggregateRow[];
  rows: DemoInventoryStockReportRow[];
};
