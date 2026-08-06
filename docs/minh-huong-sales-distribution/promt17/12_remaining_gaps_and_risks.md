# Remaining Gaps And Risks

## Deliberately Deferred

Prompt 17 did not implement:

- mobile first-open/deferred attribution
- `AppInstallAttribution`
- `CustomerAttribution`
- activation order attribution snapshot
- order create/approve attribution changes
- commission/reporting changes
- frontend link/QR management
- QR image rendering
- attribution override/dispute workflow
- renewal ownership

## Remaining Risks

- Production must set `AFFILIATE_REDIRECT_BASE_URL`; fallback is safe for local/dev but not a production rollout decision.
- Production should set `AFFILIATE_HASH_SECRET`; fallback exists only to keep local/dev deterministic.
- Click dedupe only applies when a client provides an explicit dedupe key.
- Click events are now stored, but they are not connected to orders until a later prompt adds order snapshot wiring.
- Invalid QR currently falls back to a normal link click; product may later choose a stricter invalid-QR policy.

## Open Business Decisions

- final attribution window
- exact order snapshot shape
- first-click vs last-click conflict handling
- retention period for click records
- fraud/risk scoring thresholds
