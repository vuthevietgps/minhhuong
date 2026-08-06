# ERP local demo Inventory -> IMEI/Serial -> Stock Status Report

Generated at: 2026-06-29T00:00:00.000Z

## Safety

- Fixture-only local demo data.
- productionDbUsed=false
- providerApiUsed=false
- liveAdsExecuted=false
- realErpMutationUsed=false
- inventoryMutationUsed=false
- warehouseMutationUsed=false
- imeiMutationUsed=false
- secretsRequired=false

## Totals

- Products: 3
- Warehouses: 2
- Locations: 8
- IMEI/serial rows: 16
- Total stock: 16
- Available stock: 5
- Reserved stock: 2
- Sold stock: 3
- Returned stock: 1
- Blocked/damaged stock: 3
- Missing/unknown stock: 2

## Stock Aggregates

| SKU | Product | Warehouse | Location | Total | Available | Reserved | Sold | Returned | Blocked/damaged | Missing/unknown |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| MH-HEADSET-PRO | Minh Huong Demo Headset Pro | HCM-DEMO | HCM Aisle A1 | 3 | 2 | 0 | 1 | 0 | 0 | 0 |
| MH-HEADSET-PRO | Minh Huong Demo Headset Pro | HCM-DEMO | HCM Blocked Cage | 1 | 0 | 0 | 0 | 0 | 1 | 0 |
| MH-PHONE-X100 | Minh Huong Demo Phone X100 | HCM-DEMO | HCM Aisle A1 | 3 | 2 | 0 | 1 | 0 | 0 | 0 |
| MH-PHONE-X100 | Minh Huong Demo Phone X100 | HCM-DEMO | HCM Blocked Cage | 1 | 0 | 0 | 0 | 0 | 1 | 0 |
| MH-PHONE-X100 | Minh Huong Demo Phone X100 | HCM-DEMO | HCM Exception Bin | 2 | 0 | 0 | 0 | 0 | 0 | 2 |
| MH-PHONE-X100 | Minh Huong Demo Phone X100 | HCM-DEMO | HCM Reserved Shelf | 1 | 0 | 1 | 0 | 0 | 0 | 0 |
| MH-PHONE-X100 | Minh Huong Demo Phone X100 | HCM-DEMO | HCM Returns Check | 1 | 0 | 0 | 0 | 1 | 0 | 0 |
| MH-TABLET-KID7 | Minh Huong Demo Kids Tablet 7 | HN-DEMO | HN Aisle A1 | 2 | 1 | 0 | 1 | 0 | 0 | 0 |
| MH-TABLET-KID7 | Minh Huong Demo Kids Tablet 7 | HN-DEMO | HN Blocked Cage | 1 | 0 | 0 | 0 | 0 | 1 | 0 |
| MH-TABLET-KID7 | Minh Huong Demo Kids Tablet 7 | HN-DEMO | HN Reserved Shelf | 1 | 0 | 1 | 0 | 0 | 0 | 0 |

## IMEI/Serial Status Rows

| SKU | Product | Warehouse | Location | IMEI | Serial | Status | Bucket | Condition | Related order | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MH-HEADSET-PRO | Minh Huong Demo Headset Pro | HCM-DEMO | HCM Aisle A1 |  | MHHS-HCM-001 | AVAILABLE | available | NEW |  |  |
| MH-HEADSET-PRO | Minh Huong Demo Headset Pro | HCM-DEMO | HCM Aisle A1 |  | MHHS-HCM-002 | AVAILABLE | available | NEW |  |  |
| MH-HEADSET-PRO | Minh Huong Demo Headset Pro | HCM-DEMO | HCM Aisle A1 |  | MHHS-HCM-003 | SOLD | sold | NEW | demo-order-sold-003 |  |
| MH-HEADSET-PRO | Minh Huong Demo Headset Pro | HCM-DEMO | HCM Blocked Cage |  | MHHS-HCM-004 | DAMAGED | blockedDamaged | DAMAGED |  | Synthetic accessory cable damage case. |
| MH-PHONE-X100 | Minh Huong Demo Phone X100 | HCM-DEMO | HCM Aisle A1 | 356000000000001 | MHX100-HCM-001 | AVAILABLE | available | NEW |  |  |
| MH-PHONE-X100 | Minh Huong Demo Phone X100 | HCM-DEMO | HCM Aisle A1 | 356000000000002 | MHX100-HCM-002 | AVAILABLE | available | OPEN_BOX |  |  |
| MH-PHONE-X100 | Minh Huong Demo Phone X100 | HCM-DEMO | HCM Aisle A1 | 356000000000004 | MHX100-HCM-004 | SOLD | sold | NEW | demo-order-sold-001 |  |
| MH-PHONE-X100 | Minh Huong Demo Phone X100 | HCM-DEMO | HCM Blocked Cage | 356000000000006 | MHX100-HCM-006 | DAMAGED | blockedDamaged | DAMAGED |  | Screen cracked in synthetic warehouse handling case. |
| MH-PHONE-X100 | Minh Huong Demo Phone X100 | HCM-DEMO | HCM Exception Bin | 356000000000007 | MHX100-HCM-007 | MISSING | missingUnknown | UNKNOWN |  | Cycle count exception in fixture-only stock take. |
| MH-PHONE-X100 | Minh Huong Demo Phone X100 | HCM-DEMO | HCM Exception Bin | 356000000000008 | MHX100-HCM-008 | UNKNOWN | missingUnknown | UNKNOWN |  | Unlabeled fixture intake awaiting classification. |
| MH-PHONE-X100 | Minh Huong Demo Phone X100 | HCM-DEMO | HCM Reserved Shelf | 356000000000003 | MHX100-HCM-003 | RESERVED | reserved | NEW | demo-order-reserve-001 |  |
| MH-PHONE-X100 | Minh Huong Demo Phone X100 | HCM-DEMO | HCM Returns Check | 356000000000005 | MHX100-HCM-005 | RETURNED | returned | RETURNED | demo-order-return-001 | Returned during local demo acceptance check. |
| MH-TABLET-KID7 | Minh Huong Demo Kids Tablet 7 | HN-DEMO | HN Aisle A1 | 357000000000001 | MHT7-HN-001 | AVAILABLE | available | NEW |  |  |
| MH-TABLET-KID7 | Minh Huong Demo Kids Tablet 7 | HN-DEMO | HN Aisle A1 | 357000000000003 | MHT7-HN-003 | SOLD | sold | NEW | demo-order-sold-002 |  |
| MH-TABLET-KID7 | Minh Huong Demo Kids Tablet 7 | HN-DEMO | HN Blocked Cage | 357000000000004 | MHT7-HN-004 | BLOCKED | blockedDamaged | OPEN_BOX |  | Quality hold in synthetic inspection queue. |
| MH-TABLET-KID7 | Minh Huong Demo Kids Tablet 7 | HN-DEMO | HN Reserved Shelf | 357000000000002 | MHT7-HN-002 | RESERVED | reserved | NEW | demo-order-reserve-002 |  |
