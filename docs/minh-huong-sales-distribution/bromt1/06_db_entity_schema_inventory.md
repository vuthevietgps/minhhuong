# 06 DB Entity Schema Inventory

## Implemented / Present Models

| Model/Enum | Evidence | Assessment |
|---|---|---|
| `SubscriptionStatus` | [DIRECT] `apps/api/prisma/schema.prisma:77-83` | Missing `REVOKED`; revoke uses `CANCELED`. |
| `ActivationOrderStatus` | [DIRECT] `apps/api/prisma/schema.prisma:85-92` | Has WAITING/PENDING/APPROVED/REJECTED/CANCELED/REVOKED; missing REFUNDED from BA. |
| `PaymentStatus` | [DIRECT] `apps/api/prisma/schema.prisma:99-104` | Has REFUNDED but not transaction/webhook status. |
| `LedgerEntryType` | [DIRECT] `apps/api/prisma/schema.prisma:106-111` | CREDIT/DEBIT/HOLD/RELEASE. |
| `ChannelParticipantType` | [DIRECT] `apps/api/prisma/schema.prisma:124-129` | DIRECTOR/MANAGER/AGENCY/SALE present. |
| `CommissionStatus` | [DIRECT] `apps/api/prisma/schema.prisma:141-145` | PENDING/AVAILABLE/CANCELED present. |
| `PayoutRequestStatus` | [DIRECT] `apps/api/prisma/schema.prisma:154-160` | PENDING_REVIEW/APPROVED/REJECTED/PAID/CANCELED present. |
| `Plan` | [DIRECT] `apps/api/prisma/schema.prisma:504-514` | Technical subscription plan. |
| `Subscription` | [DIRECT] `apps/api/prisma/schema.prisma:516-532` | Child-based; lacks `sourceOrderId` and `packageId`. |
| `Payment` | [DIRECT] `apps/api/prisma/schema.prisma:534-547` | Legacy/manual payment rows; no idempotency key. |
| `Agency` | [DIRECT] `apps/api/prisma/schema.prisma:549-566` | Agency profile and finance relations. |
| `AgencyMember` | [DIRECT] `apps/api/prisma/schema.prisma:568-585` | Legacy/referral model still active. |
| `ChannelParticipant` | [DIRECT] `apps/api/prisma/schema.prisma:587-619` | Tree fields parent/root/lineage/depth present. |
| `CommissionPolicy` | [DIRECT] `apps/api/prisma/schema.prisma:621-638` | No version/effective date/rules JSON. |
| `CommissionEarning` | [DIRECT] `apps/api/prisma/schema.prisma:640-668` | Depth and available/released dates present; no formula snapshot. |
| `CommissionLedgerEntry` | [DIRECT] `apps/api/prisma/schema.prisma:670-689` | Commission wallet ledger. |
| `PayoutRequest` | [DIRECT] `apps/api/prisma/schema.prisma:691-721` | Has status/bank/proof/review fields; no status history relation. |
| `ActivationOrder` | [DIRECT] `apps/api/prisma/schema.prisma:723-783` | Core order; has channel/referrer, proof/invoice, child, trial/expires; no status history or explicit attribution snapshot. |
| `ActivationPackage` | [DIRECT] `apps/api/prisma/schema.prisma:785-798` | Basic price/duration package; no entitlements. |
| `WalletLedgerEntry` | [DIRECT] `apps/api/prisma/schema.prisma:800-814` | Legacy user wallet/payment ledger separate from commission ledger. |
| `AuditLog` | [DIRECT] `apps/api/prisma/schema.prisma:835-847` | Generic audit event table. |

## Missing Target Models

- [MISSING] `ProductPackage` as separate canonical commercial package. Current equivalent is `ActivationPackage`.
- [MISSING] `PackageEntitlement`.
- [MISSING] `PriceBook`, `PriceBookItem`.
- [MISSING] `Lead`.
- [MISSING] `SalesAttributionSnapshot`.
- [MISSING] `OrderStatusHistory`.
- [MISSING] `PaymentTransaction`, `PaymentWebhookEvent`, `ReconciliationBatch`.
- [MISSING] `CommissionPolicyVersion`.
- [MISSING] `CommissionClawbackEntry`.
- [MISSING] `RenewalOpportunity`.
- [MISSING] `AffiliateLink`, `AffiliateQrAsset`, `AffiliateClickEvent`, `AppInstallAttribution`, `CustomerAttribution`.

## Migration Evidence

- [DIRECT] `apps/api/prisma/migrations/20260526135852_activation_orders/migration.sql` - initial ActivationOrder.
- [DIRECT] `apps/api/prisma/migrations/20260526142121_self_service_activation_orders/migration.sql` - self-service source/waiting payment/bank fields.
- [DIRECT] `apps/api/prisma/migrations/20260527103000_channel_participants_compensation/migration.sql` - ChannelParticipant and commission linkage.
- [DIRECT] `apps/api/prisma/migrations/20260529155545_child_profiles_model/migration.sql` - childProfile subscription/order linkage.
- [DIRECT] `apps/api/prisma/migrations/20260529120000_packages_revoke_suspend_reason/migration.sql` - ActivationPackage and revoke fields.

