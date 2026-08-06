# Snapshot Builder Evidence

## Helper

Added:

- `apps/api/src/package-entitlement/package-entitlement-snapshot.ts`

It supports MVP keys:

- `COURSE_ACCESS`
- `AI_MESSAGES_PER_MONTH`
- `CHILD_COUNT`
- `DAILY_STUDY_MINUTES`
- `TEACHER_GRADING`
- `OFFLINE_ACCESS`

## Behavior

The builder:

- captures package id, code, name, version, amount, and duration;
- sorts entitlement rows deterministically by key and value;
- filters inactive entitlement rows;
- normalizes JSON object key order;
- supports sold amount/duration overrides;
- builds `LEGACY_ORDER_FIELDS` fallback snapshots;
- parses snapshots null-safely for learning/entitlement code.

Evidence:

- `apps/api/src/package-entitlement/package-entitlement-snapshot.ts:1`
- `apps/api/src/package-entitlement/package-entitlement-snapshot.ts:57`
- `apps/api/src/package-entitlement/package-entitlement-snapshot.ts:96`
- `apps/api/src/package-entitlement/package-entitlement-snapshot.ts:116`
- `apps/api/src/package-entitlement/package-entitlement-snapshot.ts:142`

## Tests

`package-entitlement-snapshot.spec.ts` covers:

- deterministic package snapshot;
- amount/duration overrides;
- unresolved custom package fallback;
- legacy fallback without current entitlements;
- null-safe parser.
