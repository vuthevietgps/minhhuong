# Learning Release Candidate Evidence Manifest

Generated: 2026-07-10T10:00:00.000Z

## Decision

- status=PASS_LOCAL
- gate_contract_status=PASS
- source_gate_schema=learning-release-candidate-go-live-gate.v4
- overall_sha256=fa161fba1a7eb872b3fb8d12ddedf4bef0e36c19203136ad6e7ac9cf15f4879b
- production_ready=false
- production_enabled=false
- production_execution_authorized=false

## Totals

- References: 104
- Unique evidence paths: 41
- Verified evidence paths: 41
- Failed evidence paths: 0
- Hashed files: 78
- Hashed bytes: 860049

## Evidence

| Path | Status | Kind | Files | Bytes | SHA-256 | Referenced by | Failure |
| --- | --- | --- | ---: | ---: | --- | --- | --- |
| apps/api/prisma/migrations | VERIFIED | DIRECTORY | 38 | 88782 | 62bb9cd5e7acd28a64b2ce7bdc14a4925b2d9fbe1a0af510a5c5cb0548989e07 | deploy_gate:migration-and-rollback-rehearsal | - |
| apps/api/src/activation-orders/activation-orders.service.spec.ts | VERIFIED | FILE | 1 | 115831 | 834c284dd3a511b3c86241f1363b5853abdd693cabff1defd4a7754a13df9e2e | smoke:rc-smoke-refund-commission-payout-safety | - |
| apps/api/src/ai-chat/ai-chat.service.ts | VERIFIED | FILE | 1 | 3152 | f7bd74620913ae7d4b27075e82874f1f353cf8926957bc361f19af6c53210104 | deploy_gate:live-provider-execution-gates | - |
| apps/api/src/auth/auth-operational-control.ts | VERIFIED | FILE | 1 | 10107 | 69e2e76579f8f453d751d91f13a7ebc2e575236edd94a6f838c31b582fca3d71 | deploy_gate:monitoring-alerting-and-incident-runbook | - |
| apps/api/src/auth/auth.module.ts | VERIFIED | FILE | 1 | 5980 | efc03f21b72b8ab745e95040ae1cf6c66e821ede3562e7bf8fbaebcffaee937d | deploy_gate:runtime-config-fail-closed | - |
| apps/api/src/auth/prisma-auth-session.integration.spec.ts | VERIFIED | FILE | 1 | 16594 | e154636a18756ec4bcf88059a9ccc474fb145ba173a1c21d1eceda58fc6d7cb9 | deploy_gate:auth-persistence-and-distributed-revocation | - |
| apps/api/src/auth/prisma-auth-session.store.ts | VERIFIED | FILE | 1 | 21403 | 2224b4976fa8ae84e0aff767fcd890749d52336ea816c4021e6fc7c71f3d08c1 | deploy_gate:auth-persistence-and-distributed-revocation | - |
| apps/api/src/channel-finance/channel-finance.service.spec.ts | VERIFIED | FILE | 1 | 28666 | f80253c26865e7766936b5ac49274c8b8d7242b131f09cc79189f59947eb43c4 | role_journey:rc-finance-denied-path<br>role_journey:rc-finance-happy-path<br>role_journey:rc-finance-inactive-or-expired-path<br>role_journey:rc-finance-permission-negative-path<br>smoke:rc-smoke-refund-commission-payout-safety | - |
| apps/api/src/erp-local-demo/erp-local-demo.controller.ts | VERIFIED | FILE | 1 | 664 | 8abc130c6ebeddb4043d0998547e3431733a2c503aeba026b153c4a381482374 | deploy_gate:local-demo-route-containment | - |
| apps/api/src/health/dependency-readiness.service.ts | VERIFIED | FILE | 1 | 7794 | 146abcdafc02c87f4913ef96402bb04626ab5de364b7abe1cde6c275f4a12b6b | deploy_gate:runtime-config-fail-closed | - |
| apps/api/src/health/health.controller.ts | VERIFIED | FILE | 1 | 1079 | 5db91d76f7cb4eeca7ac31e939c5718be30797a84e9d669abc96ca68f9bf5037 | deploy_gate:monitoring-alerting-and-incident-runbook | - |
| apps/api/src/learning-local-demo/auth-operational-control-matrix.ts | VERIFIED | FILE | 1 | 8597 | 41fa3ce981156978ca25d9340b89a271c8739fc236a0ff6c3e52a1f8bc7589e9 | deploy_gate:monitoring-alerting-and-incident-runbook | - |
| apps/api/src/learning-local-demo/auth-persistence-security-gate-matrix.ts | VERIFIED | FILE | 1 | 23480 | 343e12aa114cce906ad054a6d7533b3e7858d8bbef29bbe5abcf180b77bd9a83 | deploy_gate:privacy-audit-and-retention | - |
| apps/api/src/learning-local-demo/auth-refresh-lifecycle-matrix.ts | VERIFIED | FILE | 1 | 18050 | 098ab5542a59264c6fef24c1e04fec0861ab68f412b49d6abb82029a48ba6de7 | deploy_gate:auth-persistence-and-distributed-revocation | - |
| apps/api/src/learning-local-demo/auth-session-repository-contract-matrix.ts | VERIFIED | FILE | 1 | 36144 | 45814b84499552579972538e09900bc71bea4313859c6275e50f694172cf5a82 | deploy_gate:auth-persistence-and-distributed-revocation | - |
| apps/api/src/learning-local-demo/learning-local-demo.controller.ts | VERIFIED | FILE | 1 | 7803 | 9d014d75fc56b8d40b15079bb2510829b9ead975acedf8bb231ccc578cc01580 | deploy_gate:local-demo-route-containment | - |
| apps/api/src/learning-local-demo/learning-local-demo.production-hardening.spec.ts | VERIFIED | FILE | 1 | 37571 | 501a6d868e788bbeea4a1d3ebb824049ad20b24b04d027ae44da3c7b9ce5c8cc | deploy_gate:privacy-audit-and-retention<br>smoke:rc-smoke-auth-session-negative-matrix<br>smoke:rc-smoke-role-permission-negative-paths | - |
| apps/api/src/main.ts | VERIFIED | FILE | 1 | 5052 | e9f85f88835a9cb1c322eed4f34d7a8991161ddc8f477ed5cfb4e237b238adcd | deploy_gate:runtime-config-fail-closed | - |
| apps/api/src/runtime-safety/local-demo-only.guard.ts | VERIFIED | FILE | 1 | 489 | cc99275db0d8d0197aec9f40e41ea84a332e936959fdae1966d6ed63e52327f4 | deploy_gate:local-demo-route-containment<br>smoke:rc-smoke-local-demo-production-containment | - |
| apps/api/src/runtime-safety/production-runtime-safety.ts | VERIFIED | FILE | 1 | 13017 | 232626ce731959e3fa7c9579aac7e261128cb0250981fc1c723c76dd9b8ead12 | deploy_gate:runtime-config-fail-closed | - |
| apps/api/src/upload-storage/filesystem-upload-storage.ts | VERIFIED | FILE | 1 | 3232 | 0db10bcabd53c23e3a890dd7a1e8f60645aca528e0bbebbf410443b063fe327d | deploy_gate:runtime-config-fail-closed | - |
| audit-output/promt_hoctap_minhhuong_4B_db_migration_recovery/promt_hoctap_minhhuong_4B_db_recovery_report.md | VERIFIED | FILE | 1 | 2804 | 90e93dab819c860e9e0a3c8799588812222efc50307da6f56722558a7bb86a92 | deploy_gate:migration-and-rollback-rehearsal | - |
| docker-compose.yml | VERIFIED | FILE | 1 | 784 | b21686986349694f4048d3888423db2b633c2639e646f3da4b62f9037245be82 | deploy_gate:monitoring-alerting-and-incident-runbook | - |
| docs/hoctap_minhhuong/00_truc_lamviec_hoctap_minhhuong.md | VERIFIED | FILE | 1 | 60646 | 96916a44fa334684d3ded70060249fcf39dbfa8906be3910ce3e7d688de7f16a | deploy_gate:manual-go-live-approval | - |
| docs/hoctap_minhhuong/approvals/2026-07-10_staging_conditional_approval.json | VERIFIED | FILE | 1 | 5525 | 7410357b5d0ce0ed27298972c047c4a20764ee101adccc59d371917b416c801e | approval:release-approval-database-owner<br>approval:release-approval-incident-owner<br>approval:release-approval-privacy-retention-owner<br>approval:release-approval-provider-owner<br>approval:release-approval-release-owner<br>approval:release-approval-security-owner<br>approval_scope | - |
| docs/hoctap_minhhuong/prisma_auth_session_store_runbook.md | VERIFIED | FILE | 1 | 20543 | 711fd30882d9d543234c13ef7429feb91b1cd3ecdfa40b1c962d1855e512ed8e | smoke:rc-smoke-staging-release-rehearsal | - |
| docs/hoctap_minhhuong/production_hardening_go_live_gate.md | VERIFIED | FILE | 1 | 58735 | 6b433f3a217aace1aa0d414bbfc6da03366f9aed269134f372f0525f2f35d354 | deploy_gate:backup-and-restore-rehearsal<br>deploy_gate:live-provider-execution-gates<br>deploy_gate:manual-go-live-approval<br>role_journey:rc-admin-denied-path<br>role_journey:rc-admin-happy-path<br>role_journey:rc-admin-inactive-or-expired-path<br>role_journey:rc-admin-permission-negative-path<br>smoke:rc-smoke-observability-incident-drill | - |
| exports/learning-local-demo-auth-operational-alert-policy-matrix-report.json | VERIFIED | FILE | 1 | 13308 | 6952a91c4b8040b2b1dea7385fbd14b5425e87df002e21a38675855c01bf3d3d | role_journey:rc-support-denied-path<br>role_journey:rc-support-happy-path<br>role_journey:rc-support-inactive-or-expired-path<br>role_journey:rc-support-permission-negative-path | - |
| exports/learning-local-demo-auth-session-smoke-matrix-report.json | VERIFIED | FILE | 1 | 11539 | 6f3e034b51d36ab838d2053cca7ad024fe95d1fbd0a9445a1c24217d02c27b0d | smoke:rc-smoke-auth-session-negative-matrix | - |
| exports/learning-local-demo-learning-path-daily-plan-video-practice-evidence-report.json | VERIFIED | FILE | 1 | 15149 | d63009596831bb331e504750b9bcacbd03940773b802acf9b545916ad8934857 | role_journey:rc-student-denied-path<br>role_journey:rc-student-happy-path<br>role_journey:rc-student-inactive-or-expired-path<br>role_journey:rc-student-permission-negative-path | - |
| exports/learning-local-demo-mvp-end-to-end-readiness-trace-report.json | VERIFIED | FILE | 1 | 20558 | a0972b2f018832f91081447a49b2b6dbbc24da29e56d584ca262c181f8208b6b | smoke:rc-smoke-parent-child-learning-flow | - |
| exports/learning-local-demo-parent-portal-approved-report-inbox-read-receipt-report.json | VERIFIED | FILE | 1 | 30962 | 33548ca0be9cbb571e900496437bca5f9c5114fd5e7ce9151c12e2e1d33bda7e | role_journey:rc-parent-denied-path<br>role_journey:rc-parent-happy-path<br>role_journey:rc-parent-inactive-or-expired-path<br>role_journey:rc-parent-permission-negative-path<br>smoke:rc-smoke-parent-child-learning-flow | - |
| exports/learning-local-demo-parent-teacher-report-permission-privacy-redaction-report.json | VERIFIED | FILE | 1 | 59497 | 93a784131a4510c7559df039b3d8d2cb8977e73ce515ae9a88babf01c8fa1391 | role_journey:rc-parent-denied-path<br>role_journey:rc-parent-happy-path<br>role_journey:rc-parent-inactive-or-expired-path<br>role_journey:rc-parent-permission-negative-path<br>role_journey:rc-support-denied-path<br>role_journey:rc-support-happy-path<br>role_journey:rc-support-inactive-or-expired-path<br>role_journey:rc-support-permission-negative-path | - |
| exports/learning-local-demo-production-runtime-gate-matrix-report.json | VERIFIED | FILE | 1 | 9248 | f28adb2eb684426b37d0f43631457d9f715093ec34e3817ec26ffe106b4e14c3 | role_journey:rc-admin-denied-path<br>role_journey:rc-admin-happy-path<br>role_journey:rc-admin-inactive-or-expired-path<br>role_journey:rc-admin-permission-negative-path<br>smoke:rc-smoke-local-demo-production-containment | - |
| exports/learning-local-demo-student-course-enrollment-subscription-flow-report.json | VERIFIED | FILE | 1 | 9109 | 8633a36ee94439afa4453ebc792cc62c8b3be2621aad98074b392ee053144464 | role_journey:rc-sales-denied-path<br>role_journey:rc-sales-happy-path<br>role_journey:rc-sales-inactive-or-expired-path<br>role_journey:rc-sales-permission-negative-path | - |
| exports/learning-local-demo-student-course-enrollment-subscription-report.json | VERIFIED | FILE | 1 | 7870 | d82a65a99501f18e2f5179e5dd2babad271998cb753c6e27e6188c7d052b98c9 | role_journey:rc-channel-denied-path<br>role_journey:rc-channel-happy-path<br>role_journey:rc-channel-inactive-or-expired-path<br>role_journey:rc-channel-permission-negative-path<br>role_journey:rc-finance-denied-path<br>role_journey:rc-finance-happy-path<br>role_journey:rc-finance-inactive-or-expired-path<br>role_journey:rc-finance-permission-negative-path | - |
| exports/learning-local-demo-subscription-entitlement-daily-plan-access-report.json | VERIFIED | FILE | 1 | 22881 | cb6decc4a9d977921b7ba3e9222f5c9e154994b3a02eeb5ed7bfd2052796f84c | role_journey:rc-student-denied-path<br>role_journey:rc-student-happy-path<br>role_journey:rc-student-inactive-or-expired-path<br>role_journey:rc-student-permission-negative-path<br>smoke:rc-smoke-entitlement-lifecycle | - |
| exports/learning-local-demo-teacher-escalation-followup-resolution-report.json | VERIFIED | FILE | 1 | 23796 | 247ed90a9b20b20d2e2d31102e17e50be98cd5219cde77583634c5233fad9a41 | role_journey:rc-teacher-denied-path<br>role_journey:rc-teacher-happy-path<br>role_journey:rc-teacher-inactive-or-expired-path<br>role_journey:rc-teacher-permission-negative-path | - |
| exports/learning-local-demo-teacher-intervention-remedial-assignment-support-plan-report.json | VERIFIED | FILE | 1 | 20080 | 88334f361316722484d2bcb615fc7a0f267c97f27c4ec89d4991f65d3cf012cf | role_journey:rc-teacher-denied-path<br>role_journey:rc-teacher-happy-path<br>role_journey:rc-teacher-inactive-or-expired-path<br>role_journey:rc-teacher-permission-negative-path | - |
| exports/learning-local-demo-upload-storage-hardening-matrix-report.json | VERIFIED | FILE | 1 | 3692 | 269c069c7d831f71895019146707d57d4b2481ff9684646c432f8b7393981dde | deploy_gate:runtime-config-fail-closed | - |
| exports/minhhuong-staging-rc-v3-local-rehearsal.json | VERIFIED | FILE | 1 | 9836 | 24f0f3d41eb37816ff39c324d3e13b14b03d7f0f320ac1946cbe3acc26d56580 | smoke:rc-smoke-observability-incident-drill<br>smoke:rc-smoke-staging-release-rehearsal<br>staging_rehearsal | - |
