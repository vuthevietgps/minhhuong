# 05 API Route Inventory

Global API versioning is configured from Nest bootstrap (Swagger title detected separately), and controllers map under `/v1` in runtime.

## Commercial Routes

| Prefix | Route | Roles/Auth | Evidence | Notes |
|---|---|---|---|---|
| `/activation-orders` | `GET /` | activation order view roles | [DIRECT] `apps/api/src/activation-orders/activation-orders.controller.ts:83-90` | List scoped orders. |
| `/activation-orders` | `GET /my-customers` | create roles | [DIRECT] `apps/api/src/activation-orders/activation-orders.controller.ts:92-96` | Customer list for sale context. |
| `/activation-orders` | `POST /` | create roles, file `saleInvoice` | [DIRECT] `apps/api/src/activation-orders/activation-orders.controller.ts:98-107` | Sale-assisted order. |
| `/activation-orders` | `POST /:orderId/resubmit` | resubmit roles, optional file | [DIRECT] `apps/api/src/activation-orders/activation-orders.controller.ts:109-119` | Rejected order recovery. |
| `/activation-orders` | `POST /:orderId/approve` | admin/operations, `operationInvoice` | [DIRECT] `apps/api/src/activation-orders/activation-orders.controller.ts:121-136` | Approve and activate. |
| `/activation-orders` | `POST /:orderId/reject` | admin/operations | [DIRECT] `apps/api/src/activation-orders/activation-orders.controller.ts:138-146` | Reject with notes. |
| `/activation-orders` | `POST /:orderId/cancel` | resubmit roles | [DIRECT] `apps/api/src/activation-orders/activation-orders.controller.ts:148-155` | Cancel pre-activation. |
| `/activation-orders` | `POST /:orderId/revoke` | admin/operations | [DIRECT] `apps/api/src/activation-orders/activation-orders.controller.ts:157-165` | Revoke approved access. |
| `/activation-orders/self-service` | `GET /options` | public | [DIRECT] `apps/api/src/activation-orders/activation-orders.controller.ts:168-175` | Packages + bank transfer info. |
| `/activation-orders/self-service` | `POST /` | public | [DIRECT] `apps/api/src/activation-orders/activation-orders.controller.ts:177-179` | Parent/customer creates order. |
| `/activation-orders/self-service` | `POST /:orderId/payment-proof` | public email match + file | [DIRECT] `apps/api/src/activation-orders/activation-orders.controller.ts:182-183`, `apps/api/src/activation-orders/activation-orders.service.ts:478-524` | Upload proof, move to review. |
| `/channel-admin` | `GET /summary`, `/agencies`, `/users`, `/audit-logs` | view/admin roles | [DIRECT] `apps/api/src/channel-admin/channel-admin.controller.ts:42-110` | Channel admin/read surfaces. |
| `/channel-admin` | `POST /agencies`, `PATCH /agencies/:agencyId` | admin/operations | [DIRECT] `apps/api/src/channel-admin/channel-admin.controller.ts:54-70` | Agency CRUD. |
| `/channel-admin` | `POST /sale-users` | channel member manage roles | [DIRECT] `apps/api/src/channel-admin/channel-admin.controller.ts:73-80` | Creates channel user/participant. |
| `/channel-admin` | `PATCH /users/:id/status`, reset password, roles | manage roles/admin | [DIRECT] `apps/api/src/channel-admin/channel-admin.controller.ts:112-140` | User operations. |
| `/channel-admin` | `POST /agencies/:agencyId/members`, `PATCH /members/:memberId` | member manage roles | [DIRECT] `apps/api/src/channel-admin/channel-admin.controller.ts:142-159` | Legacy AgencyMember management. |
| `/channel-admin` | `GET/POST/PATCH /commission-policies` | view/manage | [DIRECT] `apps/api/src/channel-admin/channel-admin.controller.ts:162-184` | Commission policy CRUD. |
| `/channel-admin` | `GET/POST/PATCH /packages` | view/manage | [DIRECT] `apps/api/src/channel-admin/channel-admin.controller.ts:189-207` | ActivationPackage CRUD. |
| `/channel-finance` | `GET /overview`, `/report`, `/report/csv`, `/wallet`, `/my-report`, `/payouts` | finance/report roles | [DIRECT] `apps/api/src/channel-finance/channel-finance.controller.ts:75-123` | Reports/wallet/payout list. |
| `/channel-finance` | `POST /payouts` | finance view roles | [DIRECT] `apps/api/src/channel-finance/channel-finance.controller.ts:125-132` | Request payout. |
| `/channel-finance` | `POST /payouts/:payoutId/pay` | admin/operations + payout invoice | [DIRECT] `apps/api/src/channel-finance/channel-finance.controller.ts:134-149` | Mark paid. |
| `/channel-finance` | `POST /payouts/:payoutId/reject` | admin/operations | [DIRECT] `apps/api/src/channel-finance/channel-finance.controller.ts:151-159` | Reject payout. |

## Related Routes

| Prefix | Evidence | Commercial Relevance |
|---|---|---|
| `/billing` | [DIRECT] `apps/api/src/billing/billing.controller.ts:4-21` | Legacy plans/current subscription/wallet. |
| `/parent` | [DIRECT] `apps/api/src/parent/parent.controller.ts:12-65` | Child profile and subscription visibility. |
| `/learning` | [DIRECT] `apps/api/src/learning/learning.service.ts:1091-1135` | Access guard checks subscription. |
| `/me` | [DIRECT] `apps/api/src/me/me.controller.ts:36-39` | Current user's activation orders. |

## Missing Routes

- [MISSING] `/r/:linkCode` public affiliate redirect/tracking endpoint.
- [MISSING] `/affiliate-links`, `/affiliate-qr-assets`, affiliate report endpoints.
- [MISSING] `/sales/leads`.
- [MISSING] `/payments`, `/payment-webhooks`, `/reconciliation`.
- [MISSING] order status history endpoint.
- [MISSING] renewal opportunity endpoint.

