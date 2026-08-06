# 10 Tests Run

## Commands

| Command | Status | Summary |
|---|---|---|
| `git status --short` | failed | [DIRECT] Failed: `fatal: not a git repository (or any of the parent directories): .git`. |
| `npm --prefix apps/api test -- --runInBand` | passed | [DIRECT] 6 test suites passed, 20 tests passed. |
| `npm --prefix apps/api run test:e2e -- --runInBand` | passed | [DIRECT] 1 e2e suite passed, 1 test passed. Dotenv logged env injection counts only; no secret values printed. |

## Test Coverage Evidence

- [DIRECT] `apps/api/src/channel-admin/channel-admin.service.spec.ts:24-71` - covers cursor pagination for user list.
- [DIRECT] `apps/api/src/learning/learning.service.spec.ts:176-225` - covers subscription present for learning watch and daily device limit block.
- [DIRECT] `apps/api/src/parent/parent.service.spec.ts:34-111` - covers child list with subscription/progress/device usage.
- [DIRECT] `apps/api/test/app.e2e-spec.ts:19-23` - root endpoint smoke only.

## Commercial Test Gaps

- [MISSING] No activation-order service/controller spec found.
- [MISSING] No self-service order -> payment proof -> approve -> subscription test found.
- [MISSING] No sale-assisted order -> approve -> commission pending test found.
- [MISSING] No commission release idempotency test found.
- [MISSING] No payout hold -> pay/reject ledger test found.
- [MISSING] No channel subtree scope test found.
- [MISSING] No affiliate/QR test possible because module is absent.

## Not Run

- `npm run lint` was intentionally not run because root/API lint scripts use `--fix`, which can edit source files and violates no-code audit constraints.
- Build commands were not run because they can rewrite `dist` output; Prompt 1 only required audit and existing tests.

