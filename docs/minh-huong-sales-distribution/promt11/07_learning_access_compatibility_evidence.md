# Learning Access Compatibility Evidence

## Runtime Behavior

Prompt 11 does not enforce package entitlements.

`EntitlementService` still grants access based on:

- `childProfileId`;
- status in `TRIALING` or `ACTIVE`;
- `currentPeriodStart <= now`;
- `currentPeriodEnd > now`.

It now selects and parses `Subscription.entitlementSnapshotJson` as a read seam only.

Evidence:

- `apps/api/src/entitlement/entitlement.service.ts:41`
- `apps/api/src/entitlement/entitlement.service.ts:59`
- `apps/api/src/entitlement/entitlement.service.ts:87`

## Tests

`entitlement.service.spec.ts` proves:

- active legacy subscription with null snapshot still grants access;
- active traced subscription with snapshot still grants access;
- expired/canceled access behavior remains blocked by the existing active query;
- snapshot parser returns null safely for missing/invalid legacy values.

Command:

```bash
npm --prefix apps/api test -- --runInBand entitlement.service.spec.ts learning.service.spec.ts
```

Result:

- passed;
- 2 suites;
- 21 tests.
