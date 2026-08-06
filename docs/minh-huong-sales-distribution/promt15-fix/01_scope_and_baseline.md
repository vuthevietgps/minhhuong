# Scope And Baseline

## Scope

This run is a no-code BA synchronization and readiness/specification task.

Allowed:

- copy exact canonical BA files from the supplied bundle into `docs/minh-huong-sales-distribution/ba/`
- read the copied BA files first
- inspect existing docs and source for current readiness
- write a Prompt 15 fix result packet under `docs/minh-huong-sales-distribution/promt15-fix/`

Not allowed:

- product source changes
- Prisma schema changes
- migrations
- controller/service implementation
- frontend implementation
- test rewrites
- commission behavior changes
- public redirect/click tracking implementation

## Baseline Finding

The existing repo has referral and channel-attribution foundations, but not the affiliate-link/QR BA layer.

Known current foundations:

- `AgencyMember.referralCode` is unique in `apps/api/prisma/schema.prisma`.
- `ChannelParticipant` models channel hierarchy and scope.
- `ActivationOrder` stores `channelParticipantId`, `agencyId`, and `referrerMemberId`.
- Self-service order creation accepts `referralCode`.
- Approval is the commercial event used by existing commission logic.
- Status history and scoped read-side foundations exist from Prompt 12-14.

Prompt 15 prior state:

- result packet in `docs/minh-huong-sales-distribution/promt15/`
- verdict `FAIL / MISSING_CANONICAL_BA_DOCS`
- no BA files copied
- no affiliate/QR spec produced

Prompt 15 fix state:

- canonical BA files copied and verified
- readiness matrix and technical spec produced
- no product code changed
- product tests not run because there were no product changes
