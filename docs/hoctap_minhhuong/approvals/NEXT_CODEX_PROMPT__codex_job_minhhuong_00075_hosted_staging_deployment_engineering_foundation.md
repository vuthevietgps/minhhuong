codex_job_minhhuong_00075_hosted_staging_deployment_engineering_foundation - HOSTED_STAGING_DEPLOYMENT_ENGINEERING_FOUNDATION

Objective:
Turn the Minh Huong Learning release candidate into a provider-neutral, containerized hosted-staging deployment package that can be deployed safely once a hosting account, domain, and managed service credentials are supplied. Work only in the repository and isolated local containers. Do not deploy externally or enable production.

Must read first:
- docs/hoctap_minhhuong/approvals/2026-07-10_auto_coding_hosted_staging_foundation_approval.json
- docs/hoctap_minhhuong/approvals/2026-07-10_staging_conditional_approval.json
- docs/hoctap_minhhuong/00_truc_lamviec_hoctap_minhhuong.md
- docs/hoctap_minhhuong/production_hardening_go_live_gate.md
- Root package.json, docker-compose.yml, .env.example, .gitignore, README.md, and all applicable AGENTS.md files.
- The supplied job 00074 CHATGPT_REVIEW_BUNDLE.md, RESULT.json, DEPLOY_READINESS_GAPS.md, GO_LIVE_GATE_REPORT.md, PRODUCTION_HARDENING_PLAN.md, TESTS_RUN.md, and NEXT_CONTEXT_PACKET.md.

Required:
- Inspect the monorepo and existing runtime safety, Prisma, auth/session, health, static asset/upload, API URL, CORS, and Next.js configuration before changing code.
- Add production-quality multi-stage container builds for the Nest API and Next web application. Run application processes as non-root, use deterministic dependency installation, minimize runtime contents, and add explicit health checks.
- Add repository-level docker ignore rules that exclude node_modules, build outputs, local runtime data, secrets, uploads, evidence workspaces, and unnecessary artifacts without excluding required package manifests or Prisma assets.
- Add a provider-neutral hosted-staging compose/reference topology for API, web, migration job, PostgreSQL, and Redis. Secrets must come only from environment references; do not embed real or default production credentials.
- Keep the existing local dependency compose usable. Do not replace local developer workflows with hosted assumptions.
- Add a one-shot, fail-closed migration entrypoint with preflight validation, backup/restore/rollback hooks, advisory or equivalent single-run protection, and clear failure propagation. Do not use `prisma migrate dev` for hosted staging.
- Harden environment contracts for API_PUBLIC_URL, WEB_PUBLIC_URL, CORS_ORIGIN, NEXT_PUBLIC_API_URL, DATABASE_URL, REDIS_URL, JWT/auth secrets, local-demo route denial, session/control/alert providers, uploads/storage, and provider-disabled defaults.
- Add or reuse liveness and readiness endpoints that distinguish process health from database/Redis readiness without leaking secrets or sensitive diagnostics.
- Add structured startup/runtime logging and a minimal provider-neutral metrics/observability contract suitable for external routing later. No external telemetry account is required in this slice.
- Add CI-ready verification definitions or scripts for install, Prisma generate/validate, targeted tests, learning-local regression, build, container build, compose validation, migration preflight, and isolated smoke. The repository currently has no `.git`; create files only and do not initialize/push a remote repository.
- Build both images locally and execute an isolated synthetic container smoke when supported. Prove API readiness, web reachability, API-to-database/Redis behavior, production denial of local-demo routes, migration one-shot behavior, restart safety, and exact cleanup.
- Add a hosted-staging runbook covering required accounts/services, DNS/TLS, secrets, database/Redis, object storage/uploads, migration, seed policy, smoke, monitoring, rollback, backup/restore, incident response, and promotion criteria.
- Preserve the parent/child learning flow, paid-pilot safety, auth/session/operational/alert controls, role-negative matrix, and immutable test-standard behavior.
- Keep `production_ready=false`, `production_enabled=false`, and all live providers disabled.

Forbidden:
- External deploy, paid hosting mutation, source push, image publication, DNS/TLS mutation, or cloud resource creation.
- Production DB access, production credentials, or real customer/learner/order/payment data.
- Live payment/refund/payout/notification/AI/provider calls or mutations.
- Plaintext secrets, insecure default secrets, public admin/support endpoints, or relaxed runtime fail-closed controls.
- Deleting, skipping, renaming, weakening, or rewriting tests/acceptance criteria merely to pass.

Tests and verification:
- Validate JSON/YAML/compose/Dockerfile syntax and container build contexts.
- Run Prisma generate and validate.
- Run targeted runtime-safety, health/readiness, migration-entrypoint, and deployment-contract tests.
- Run `npm run seed:demo`, `npm run report:demo`, `npm run test:learning-local`, and `npm run build`.
- Build API and web container images locally and run the isolated container smoke if the environment supports it; otherwise record the exact blocker without claiming success.
- Verify images contain no `.env`, plaintext secrets, local uploads, `.codex-workspaces`, or unnecessary source artifacts.
- Verify exact cleanup: no matching containers, processes, listeners, databases, volumes, networks, or temporary artifacts remain after the smoke.
- Produce CHATGPT_REVIEW_BUNDLE.md, RESULT.md, RESULT.json, REVIEW_PACKET.md, MANIFEST.json, FILES_CHANGED.md, TESTS_RUN.md, RISKS_AND_GAPS.md, NEXT_CONTEXT_PACKET.md, NEXT_CONTEXT_INDEX.json, CONTEXT_DELTA.md, DEPLOYMENT_ENGINEERING_REPORT.md, HOSTED_STAGING_RUNBOOK.md, CONTAINER_SMOKE_REPORT.md, DEPLOY_READINESS_GAPS.md, and GO_LIVE_GATE_REPORT.md.

Decision rule:
- PASS only if the provider-neutral deployment package is internally consistent and all runnable local gates pass truthfully.
- Do not claim hosted staging or production deployment occurred.
- Recommend the smallest next step requiring an actual hosting target/account, domain, and managed-service credentials; do not auto-enable production.
