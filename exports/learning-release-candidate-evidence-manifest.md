# Learning Release Candidate Evidence Manifest

Generated: 2026-07-10T10:00:00.000Z

## Decision

- status=PASS_LOCAL
- gate_contract_status=PASS
- source_gate_schema=learning-release-candidate-go-live-gate.v4
- overall_sha256=2f81c1ed436a82231981342ff7b604a80ce225fbf58aee0cf5276fcbdd3dc81f
- production_ready=false
- production_enabled=false
- production_execution_authorized=false

## Totals

- References: 111
- Unique evidence paths: 46
- Verified evidence paths: 46
- Failed evidence paths: 0
- Hashed files: 94
- Hashed bytes: 863367

## Evidence

| Path | Status | Kind | Files | Bytes | SHA-256 | Referenced by | Failure |
| --- | --- | --- | ---: | ---: | --- | --- | --- |
| apps/api/prisma/migrations | VERIFIED | DIRECTORY | 47 | 104755 | 7be22946b2d9d3e19dfb974fd082877c5d38e0a6260311a6531ae45cb385ebc6 | deploy_gate:migration-and-rollback-rehearsal | - |
| apps/api/prisma/runbooks | VERIFIED | DIRECTORY | 3 | 2237 | 764152608e707d0e581ba50221eb85d64ad2ba69e2304052db4a327419784e3b | deploy_gate:migration-and-rollback-rehearsal | - |
| apps/api/src/activation-orders/activation-orders.service.affiliate-commission.spec.ts | VERIFIED | FILE | 1 | 20204 | c4df52c39d5dee6071001ff12d7cdbdb5f43c8bcb9e31da704f7d37d91fa7e14 | smoke:rc-smoke-refund-commission-payout-safety | - |
| apps/api/src/activation-orders/activation-orders.service.approval.spec.ts | VERIFIED | FILE | 1 | 18422 | f863bd4811bab1bc5ffbb52144a03a69800ebe34b34d83020881affbce9a6812 | smoke:rc-smoke-refund-commission-payout-safety | - |
| apps/api/src/activation-orders/activation-orders.service.checkout.spec.ts | VERIFIED | FILE | 1 | 20932 | e126a166b635eb17c1c13ef0ead849bf2f19f51e0aa9afeb98622ea6eb69f5b0 | smoke:rc-smoke-refund-commission-payout-safety | - |
| apps/api/src/activation-orders/activation-orders.service.refunds.spec.ts | VERIFIED | FILE | 1 | 30499 | 288d00c7a5ba7e384c7abd4f511d61540688b7100d9bdf4d754de3b33eaa5999 | smoke:rc-smoke-refund-commission-payout-safety | - |
| apps/api/src/activation-orders/activation-orders.service.status-history.spec.ts | VERIFIED | FILE | 1 | 24161 | b685bc7df69ddf48d1e6adc00e1514b1f31fafb1687689d3d90d209ecd87ac0f | smoke:rc-smoke-refund-commission-payout-safety | - |
| apps/api/src/ai-chat/ai-chat.service.ts | VERIFIED | FILE | 1 | 4769 | 33aca1eea642afc08324f25cad2e6c56e3ad092a240608fe1f7ffeac27f6083f | deploy_gate:live-provider-execution-gates | - |
| apps/api/src/auth/auth-operational-control.ts | VERIFIED | FILE | 1 | 10530 | f20a446aa6b4bf07d3e14c71fbe37deaaaad4d472199ecb5c8d63a8f6af6aef5 | deploy_gate:monitoring-alerting-and-incident-runbook | - |
| apps/api/src/auth/auth.module.ts | VERIFIED | FILE | 1 | 6146 | 07d00dbd2fe582d1973b08569d816d412d3a66a1f4f21bdd20d019bbec97e02e | deploy_gate:runtime-config-fail-closed | - |
| apps/api/src/auth/prisma-auth-session.integration.spec.ts | VERIFIED | FILE | 1 | 17163 | 63725972c24cdceaf950b8b75f06b0b4b8b5a631ffe5ff10891766fbc655d345 | deploy_gate:auth-persistence-and-distributed-revocation | - |
| apps/api/src/auth/prisma-auth-session.store.ts | VERIFIED | FILE | 1 | 22100 | 33b52fc9c3a088ddfaebf6ec51caf3d1a9dc02720398a9dcb7f8d5cc8f989c71 | deploy_gate:auth-persistence-and-distributed-revocation | - |
| apps/api/src/channel-finance/channel-finance.service.spec.ts | VERIFIED | FILE | 1 | 29535 | c59bcb31c861ca2714b08980b6e7c212cc6ff1522ccadb5f376627179ac082ff | role_journey:rc-finance-denied-path<br>role_journey:rc-finance-happy-path<br>role_journey:rc-finance-inactive-or-expired-path<br>role_journey:rc-finance-permission-negative-path<br>smoke:rc-smoke-refund-commission-payout-safety | - |
| apps/api/src/erp-local-demo/erp-local-demo.controller.ts | VERIFIED | FILE | 1 | 683 | 3b1ba748b7d1db2f3a269bec3ca2ea8f86a709899e23726e28ba1cef9cc1a247 | deploy_gate:local-demo-route-containment | - |
| apps/api/src/health/dependency-readiness.service.ts | VERIFIED | FILE | 1 | 8085 | a7bbbed699c53a6bc8c33bbba6f6c1ace735299104edceec58e98e68e346baa5 | deploy_gate:runtime-config-fail-closed | - |
| apps/api/src/health/health.controller.ts | VERIFIED | FILE | 1 | 1129 | 693747a4a520af5ad757c27ada2f6ff81b2a500b2885f84f8653557427c36fa5 | deploy_gate:monitoring-alerting-and-incident-runbook | - |
| apps/api/src/learning-local-demo/auth-operational-control-matrix.ts | VERIFIED | FILE | 1 | 8816 | 34fb54041dda9d99e5d07119f2d0e7b58f2b5946e102b9ce1b5a99d4a5ccce5d | deploy_gate:monitoring-alerting-and-incident-runbook | - |
| apps/api/src/learning-local-demo/auth-persistence-security-gate-matrix.ts | VERIFIED | FILE | 1 | 24002 | 070a0b8e13175534ae7d0145e802f7bc4fdb89b49146438a96eb24b90ba9e1c4 | deploy_gate:privacy-audit-and-retention | - |
| apps/api/src/learning-local-demo/auth-refresh-lifecycle-matrix.ts | VERIFIED | FILE | 1 | 18514 | 0b6393cac3fe1b86f7b723854fe6018bec1ac6860d36b612a802dcff4f293260 | deploy_gate:auth-persistence-and-distributed-revocation | - |
| apps/api/src/learning-local-demo/auth-session-repository-contract-matrix.ts | VERIFIED | FILE | 1 | 13065 | 1acd8f98220c4f9de8aa1b28b5c4605c633421e818dbe0725b0a0beee660c4a4 | deploy_gate:auth-persistence-and-distributed-revocation | - |
| apps/api/src/learning-local-demo/learning-local-demo.controller.ts | VERIFIED | FILE | 1 | 7999 | ff67e2873a832042a0eea1733cbf1c0d3d16173f2006bc90196b1e7f0ba1a05b | deploy_gate:local-demo-route-containment | - |
| apps/api/src/learning-local-demo/learning-local-demo.production-hardening.auth-store-evidence.spec.ts | VERIFIED | FILE | 1 | 21389 | 6c615cb8a5262a67d5786781cb4dbcee45a52c7ba541d2cd6086b59ef9bd075f | deploy_gate:privacy-audit-and-retention<br>smoke:rc-smoke-auth-session-negative-matrix<br>smoke:rc-smoke-role-permission-negative-paths | - |
| apps/api/src/learning-local-demo/learning-local-demo.production-hardening.gate-auth-session.spec.ts | VERIFIED | FILE | 1 | 16923 | df050fec0308ec3b100ae373c4326d220018955e244fe97dccb05686a31fe14e | deploy_gate:privacy-audit-and-retention<br>smoke:rc-smoke-auth-session-negative-matrix<br>smoke:rc-smoke-role-permission-negative-paths | - |
| apps/api/src/main.ts | VERIFIED | FILE | 1 | 5477 | 93ab0ef404d42e9069e357734fb3ac7468eb6d1c61bf20d35ce1a9b259295220 | deploy_gate:runtime-config-fail-closed | - |
| apps/api/src/runtime-safety/local-demo-only.guard.ts | VERIFIED | FILE | 1 | 451 | 66500a911d075ead0754a4d2aaa54122f4263e45d6e84eda3d1907e53d214e5a | deploy_gate:local-demo-route-containment<br>smoke:rc-smoke-local-demo-production-containment | - |
| apps/api/src/runtime-safety/production-runtime-safety.ts | VERIFIED | FILE | 1 | 13529 | 2d89e37b1279154fc22903abbfc217692d70f187fd5dcb4461267c9342ddc43b | deploy_gate:runtime-config-fail-closed | - |
| apps/api/src/upload-storage/filesystem-upload-storage.ts | VERIFIED | FILE | 1 | 3338 | 581ad4e8ff9d1bf653dc6325bbae6f2b5b1af318cefcfa2ab462b0366c001a7c | deploy_gate:runtime-config-fail-closed | - |
| docker-compose.yml | VERIFIED | FILE | 1 | 821 | 85e6c6ccacb34c1477cba4ee53669d9b1c35f506be7bfa9b285356f1dcdd297e | deploy_gate:monitoring-alerting-and-incident-runbook | - |
| docs/hoctap_minhhuong/00_truc_lamviec_hoctap_minhhuong.md | VERIFIED | FILE | 1 | 61337 | 66424a041cf855606c5f414547860e1c0623f5a066a9630800d62e631f6dd15b | deploy_gate:manual-go-live-approval | - |
| docs/hoctap_minhhuong/approvals/2026-07-10_staging_conditional_approval.json | VERIFIED | FILE | 1 | 5626 | ed7cd3d39065aa0c1a9f5eb235df0bffc607817ea87fa4e0dac9b64564d3bb9d | approval:release-approval-database-owner<br>approval:release-approval-incident-owner<br>approval:release-approval-privacy-retention-owner<br>approval:release-approval-provider-owner<br>approval:release-approval-release-owner<br>approval:release-approval-security-owner<br>approval_scope | - |
| docs/hoctap_minhhuong/prisma_auth_session_store_runbook.md | VERIFIED | FILE | 1 | 20723 | 93cb028b56e0519fa7af0a329589e8a576fa5d6f5d143171d8f8757664816461 | smoke:rc-smoke-staging-release-rehearsal | - |
| docs/hoctap_minhhuong/production_hardening_go_live_gate.md | VERIFIED | FILE | 1 | 62193 | ee52850f05fc09c9eb5fe3cc4d98113182ac5a73eef295cebca7e5175084555d | deploy_gate:backup-and-restore-rehearsal<br>deploy_gate:live-provider-execution-gates<br>deploy_gate:manual-go-live-approval<br>role_journey:rc-admin-denied-path<br>role_journey:rc-admin-happy-path<br>role_journey:rc-admin-inactive-or-expired-path<br>role_journey:rc-admin-permission-negative-path<br>smoke:rc-smoke-observability-incident-drill | - |
| exports/learning-local-demo-auth-operational-alert-policy-matrix-report.json | VERIFIED | FILE | 1 | 13308 | 6952a91c4b8040b2b1dea7385fbd14b5425e87df002e21a38675855c01bf3d3d | role_journey:rc-support-denied-path<br>role_journey:rc-support-happy-path<br>role_journey:rc-support-inactive-or-expired-path<br>role_journey:rc-support-permission-negative-path | - |
| exports/learning-local-demo-auth-session-smoke-matrix-report.json | VERIFIED | FILE | 1 | 11539 | 6f3e034b51d36ab838d2053cca7ad024fe95d1fbd0a9445a1c24217d02c27b0d | smoke:rc-smoke-auth-session-negative-matrix | - |
| exports/learning-local-demo-learning-path-daily-plan-video-practice-evidence-report.json | VERIFIED | FILE | 1 | 15149 | d63009596831bb331e504750b9bcacbd03940773b802acf9b545916ad8934857 | role_journey:rc-student-denied-path<br>role_journey:rc-student-happy-path<br>role_journey:rc-student-inactive-or-expired-path<br>role_journey:rc-student-permission-negative-path | - |
| exports/learning-local-demo-mvp-end-to-end-readiness-trace-report.json | VERIFIED | FILE | 1 | 20558 | a0972b2f018832f91081447a49b2b6dbbc24da29e56d584ca262c181f8208b6b | smoke:rc-smoke-parent-child-learning-flow | - |
| exports/learning-local-demo-parent-portal-approved-report-inbox-read-receipt-report.json | VERIFIED | FILE | 1 | 30962 | 33548ca0be9cbb571e900496437bca5f9c5114fd5e7ce9151c12e2e1d33bda7e | role_journey:rc-parent-denied-path<br>role_journey:rc-parent-happy-path<br>role_journey:rc-parent-inactive-or-expired-path<br>role_journey:rc-parent-permission-negative-path<br>smoke:rc-smoke-parent-child-learning-flow | - |
| exports/learning-local-demo-parent-teacher-report-permission-privacy-redaction-report.json | VERIFIED | FILE | 1 | 59497 | 93a784131a4510c7559df039b3d8d2cb8977e73ce515ae9a88babf01c8fa1391 | role_journey:rc-parent-denied-path<br>role_journey:rc-parent-happy-path<br>role_journey:rc-parent-inactive-or-expired-path<br>role_journey:rc-parent-permission-negative-path<br>role_journey:rc-support-denied-path<br>role_journey:rc-support-happy-path<br>role_journey:rc-support-inactive-or-expired-path<br>role_journey:rc-support-permission-negative-path | - |
| exports/learning-local-demo-production-runtime-gate-matrix-report.json | VERIFIED | FILE | 1 | 9304 | 2399aa5c915019997afabc2b1f88ad565fb86d1500fc64e1a3cd212de9aafa53 | role_journey:rc-admin-denied-path<br>role_journey:rc-admin-happy-path<br>role_journey:rc-admin-inactive-or-expired-path<br>role_journey:rc-admin-permission-negative-path<br>smoke:rc-smoke-local-demo-production-containment | - |
| exports/learning-local-demo-student-course-enrollment-subscription-flow-report.json | VERIFIED | FILE | 1 | 9109 | 8633a36ee94439afa4453ebc792cc62c8b3be2621aad98074b392ee053144464 | role_journey:rc-sales-denied-path<br>role_journey:rc-sales-happy-path<br>role_journey:rc-sales-inactive-or-expired-path<br>role_journey:rc-sales-permission-negative-path | - |
| exports/learning-local-demo-student-course-enrollment-subscription-report.json | VERIFIED | FILE | 1 | 7870 | d82a65a99501f18e2f5179e5dd2babad271998cb753c6e27e6188c7d052b98c9 | role_journey:rc-channel-denied-path<br>role_journey:rc-channel-happy-path<br>role_journey:rc-channel-inactive-or-expired-path<br>role_journey:rc-channel-permission-negative-path<br>role_journey:rc-finance-denied-path<br>role_journey:rc-finance-happy-path<br>role_journey:rc-finance-inactive-or-expired-path<br>role_journey:rc-finance-permission-negative-path | - |
| exports/learning-local-demo-subscription-entitlement-daily-plan-access-report.json | VERIFIED | FILE | 1 | 22881 | cb6decc4a9d977921b7ba3e9222f5c9e154994b3a02eeb5ed7bfd2052796f84c | role_journey:rc-student-denied-path<br>role_journey:rc-student-happy-path<br>role_journey:rc-student-inactive-or-expired-path<br>role_journey:rc-student-permission-negative-path<br>smoke:rc-smoke-entitlement-lifecycle | - |
| exports/learning-local-demo-teacher-escalation-followup-resolution-report.json | VERIFIED | FILE | 1 | 23796 | 247ed90a9b20b20d2e2d31102e17e50be98cd5219cde77583634c5233fad9a41 | role_journey:rc-teacher-denied-path<br>role_journey:rc-teacher-happy-path<br>role_journey:rc-teacher-inactive-or-expired-path<br>role_journey:rc-teacher-permission-negative-path | - |
| exports/learning-local-demo-teacher-intervention-remedial-assignment-support-plan-report.json | VERIFIED | FILE | 1 | 20080 | 88334f361316722484d2bcb615fc7a0f267c97f27c4ec89d4991f65d3cf012cf | role_journey:rc-teacher-denied-path<br>role_journey:rc-teacher-happy-path<br>role_journey:rc-teacher-inactive-or-expired-path<br>role_journey:rc-teacher-permission-negative-path | - |
| exports/learning-local-demo-upload-storage-hardening-matrix-report.json | VERIFIED | FILE | 1 | 3692 | 269c069c7d831f71895019146707d57d4b2481ff9684646c432f8b7393981dde | deploy_gate:runtime-config-fail-closed | - |
| exports/minhhuong-staging-rc-v3-local-rehearsal.json | VERIFIED | FILE | 1 | 10069 | 46822695bd8c9758b86d412240e29e028949d63498f76fdcae0101a1073d9bb2 | smoke:rc-smoke-observability-incident-drill<br>smoke:rc-smoke-staging-release-rehearsal<br>staging_rehearsal | - |
