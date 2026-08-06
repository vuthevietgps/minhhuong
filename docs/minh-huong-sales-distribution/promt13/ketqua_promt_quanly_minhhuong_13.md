# Prompt 13 Result - Minh Huong Commercial Distribution

Date: 2026-06-14  
Mode: implementation-narrow-slice / read-side hardening  
Verdict: PASS

## Scope Implemented

Added a safe backend read path for activation order lifecycle history:

- `GET /activation-orders/:orderId/status-history`
- service method `ActivationOrdersService.getStatusHistory`
- shared order visibility helper used by both order list and history read
- deterministic history ordering by `createdAt ASC`, then `id ASC`
- conservative metadata sanitization before returning history rows

No write semantics from Prompt 12 were changed.

## Read Surface Decision

The existing backend had:

- commercial order list: `GET /activation-orders`
- sales customer list: `GET /activation-orders/my-customers`
- parent/customer list: `GET /me/activation-orders`

There was no scoped activation order detail endpoint, and full history was not appropriate for high-volume list rows. The smallest safe addition was therefore a dedicated scoped history endpoint.

## Scope/RBAC Result

The history endpoint uses `activationOrderViewRoles` and then verifies the requested order through the same visibility where-clause as commercial order list reads:

- admin/operations: global
- channel actor: subtree plus own created orders
- non-channel actor: own created orders only, matching existing list behavior
- out-of-scope reads: `NotFoundException`

DB-backed tests cover admin/ops access, scoped sale/manager access, sibling sale/agency/manager denial, and unscoped denial.

## Metadata Safety

History rows return only safe fields. `metadataJson` is sanitized recursively:

- storage keys and URLs are reduced to file names
- raw/base64/blob/file-content style fields are redacted
- mime type, size, counts, prior status, prior review notes, and other audit-safe metadata remain

## Tests

- `npm --prefix apps/api run prisma:generate` -> passed.
- `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts` -> passed, 1 suite, 17 tests.
- `npm --prefix apps/api test -- --runInBand activation-orders.service.spec.ts channel-finance.service.spec.ts` -> passed, 2 suites, 29 tests.
- `npm --prefix apps/api test -- --runInBand package-entitlement` -> passed, 3 suites, 12 tests.
- `npm --prefix apps/api test -- --runInBand entitlement.service.spec.ts learning.service.spec.ts` -> passed, 2 suites, 21 tests.
- `npm --prefix apps/api test -- --runInBand channel-participant-fk.integration.spec.ts` -> passed, 1 suite, 1 test.
- `npm --prefix apps/api test -- --runInBand channel-scope.integration.spec.ts channel-admin-scope.integration.spec.ts` -> passed, 2 suites, 7 tests.
- `npm --prefix apps/api test -- --runInBand` -> passed, 21 suites, 128 tests.
- `npm --prefix apps/api run test:e2e -- --runInBand` -> passed, 4 suites, 10 tests.
- `npm --prefix apps/api run build` -> passed.

## Hard-Ban Check

No affiliate/QR, payment gateway/webhook/reconciliation, package entitlement enforcement/UI, commission policy engine, frontend rewrite, Lead CRM, RenewalOpportunity, `AgencyMember` cleanup, broad hierarchy/model/order/subscription/commission rewrite, write-semantics change, action enum migration, or payout lifecycle history was implemented.

## Notes

`git status --short` still cannot run because this workspace is not a git repository. DB-backed channel scope suites still emit the existing non-failing `pg` deprecation warning.

