# Scope And Baseline

## Baseline Read

Prompt 8 followed the Prompt 7 result packet, especially:

- `ketqua_promt_quanly_minhhuong_7.md`
- `ketqua_promt_quanly_minhhuong_7.json`
- `02_test_db_strategy.md`
- `03_fixture_design_and_seed_evidence.md`
- `04_activation_order_scope_evidence.md`
- `05_channel_finance_scope_evidence.md`
- `06_csv_channel_admin_scope_evidence.md`
- `07_tests_run.md`
- `10_remaining_gaps_and_risks.md`
- `11_next_prompt_recommendation.md`

Accepted earlier baselines from Prompt 2, Prompt 4, and Prompt 6 were preserved by rerunning required regression commands.

## In Scope

- Audit current schema versus migration SQL history for the channel scope foundation.
- Add a safe reconciliation migration where migration history was missing current schema fields.
- Change Prompt 7 DB-backed scope test from `db push` to `migrate deploy`.
- Prove a fresh temp DB built by migrations can seed and pass the Prompt 7 scope fixture.
- Create Prompt 8 result packet.

## Out Of Scope

No affiliate/QR, payment gateway/webhook/reconciliation, package entitlement/snapshot, entitlement enforcement, commission policy version engine, frontend rewrite, Lead CRM, RenewalOpportunity, `AgencyMember` cleanup, broad model rename, or broad commercial architecture rewrite was implemented.

## Product Source

No product service/controller behavior changed. Prompt 8 changed only:

- Prisma migration SQL;
- a DB-backed test harness;
- result documentation.

