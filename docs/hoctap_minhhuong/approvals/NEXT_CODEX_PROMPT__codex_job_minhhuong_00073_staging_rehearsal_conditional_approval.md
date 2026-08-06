codex_job_minhhuong_00073_staging_rehearsal_conditional_approval - STAGING_REHEARSAL_CONDITIONAL_APPROVAL

Objective:
Resume the Minh Huong Learning BA/truc axis under the user-delegated, business-default conditional approval in `docs/hoctap_minhhuong/approvals/2026-07-10_staging_conditional_approval.json`. Execute one truthful, isolated non-production staging rehearsal and update the release-candidate evidence. Do not approve or enable production.

Must read first:
- docs/hoctap_minhhuong/approvals/2026-07-10_staging_conditional_approval.json
- docs/hoctap_minhhuong/00_truc_lamviec_hoctap_minhhuong.md
- docs/hoctap_minhhuong/production_hardening_go_live_gate.md
- The job 00072 CHATGPT_REVIEW_BUNDLE.md, RESULT.json, PRODUCTION_HARDENING_PLAN.md, DEPLOY_READINESS_GAPS.md, GO_LIVE_GATE_REPORT.md, E2E_SMOKE_TEST_MATRIX.md, and NEXT_CONTEXT_PACKET.md supplied with this pointer.

Required:
- Treat `minhhuong-staging-rc-v3-local` as a distinct isolated non-production staging target, not as production and not as proof of hosted production capacity.
- Use only synthetic or pseudonymized fixtures. Do not use production credentials or real learner/parent/order/payment data.
- Inspect existing scripts, Docker/local PostgreSQL support, Prisma migrations, auth session/operational/alert providers, release gate, and evidence generators before changing code.
- Implement or harden the smallest reusable staging-rehearsal lane needed to run backup, checksum, migration, read validation, forward repair, rollback, restore, exact cleanup, two-process auth/session revocation, and fail-closed outage checks.
- Measure and record rehearsal RPO/RTO, resource headroom, migration/restore timing, and any truthful capacity limitation. Do not claim production capacity from local evidence.
- Run a timed synthetic incident drill covering alert correlation, acknowledgement, escalation, kill switch, containment/rollback decision, and recovery.
- Prove privacy controls for redaction, access, export, 30-day default evidence retention metadata, and exact deletion/cleanup without storing real identities, tokens, rate keys, or secrets.
- Keep all provider lanes mock/fixture/sandbox-only. If sandbox credentials do not exist, record a blocker and verify provider contracts, idempotency, reconciliation, limits, kill switch, rollback, and cleanup with mocks only.
- Preserve the existing parent/child learning MVP, 10-day refund, commission, entitlement, revoke/clawback, payout-safety, role-negative, and immutable test-standard behavior.
- Update the machine-readable release-candidate gate so approvals are scoped to this staging rehearsal only. Keep final production approval pending.

Forbidden:
- Production deploy, production DB access, or production enablement.
- Live payment/refund/payout/notification/AI/provider mutation.
- Real customer, learner, session, order, or payment mutation.
- Plaintext secrets, invented personal names/signatures, or fabricated external evidence.
- Weakening, deleting, skipping, renaming, or relaxing existing tests or acceptance criteria.

Tests and verification:
- Run Prisma generate/validate and the narrowest staging-rehearsal migration/backup/restore/forward-repair tests.
- Run the two-process auth/session/operational/alert smoke contracts against the isolated target.
- Run `npm run seed:demo`, `npm run report:demo`, `npm run test:learning-local`, and `npm run build`.
- Run exact cleanup checks proving no matching staging process, database, listener, or temporary artifact remains.
- Produce CHATGPT_REVIEW_BUNDLE.md, RESULT.md, RESULT.json, REVIEW_PACKET.md, MANIFEST.json, FILES_CHANGED.md, TESTS_RUN.md, RISKS_AND_GAPS.md, NEXT_CONTEXT_PACKET.md, NEXT_CONTEXT_INDEX.json, CONTEXT_DELTA.md, PRODUCTION_HARDENING_PLAN.md, DEMO_DATA_MATRIX.md, ROLE_PERMISSION_TEST_MATRIX.md, E2E_SMOKE_TEST_MATRIX.md, DEPLOY_READINESS_GAPS.md, GO_LIVE_GATE_REPORT.md, APPROVAL_EVIDENCE_MATRIX.md, and STAGING_REHEARSAL_REPORT.md.

Decision rule:
- PASS only if the approved isolated rehearsal and required local evidence pass truthfully.
- Keep `production_ready=false`, `production_enabled=false`, and live providers disabled.
- After PASS, recommend the smallest evidence-backed follow-up or stop for a separate final release-owner decision. Do not auto-approve production.
