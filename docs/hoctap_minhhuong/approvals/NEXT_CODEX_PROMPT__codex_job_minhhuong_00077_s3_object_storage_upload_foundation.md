codex_job_minhhuong_00077_s3_object_storage_upload_foundation - S3_OBJECT_STORAGE_UPLOAD_FOUNDATION

Objective:
Implement the provider-neutral S3-compatible object-storage foundation for Minh Huong Learning upload surfaces so hosted staging is not tied to one API container or local filesystem. Preserve filesystem storage for local development only. Verify with mocks or disposable local MinIO; do not call a real cloud provider or enable production.

Must read first:
- docs/hoctap_minhhuong/approvals/2026-07-11_object_storage_architecture_decision.json
- docs/hoctap_minhhuong/approvals/2026-07-10_auto_coding_hosted_staging_foundation_approval.json
- docs/hoctap_minhhuong/00_truc_lamviec_hoctap_minhhuong.md
- docs/hoctap_minhhuong/production_hardening_go_live_gate.md
- Root and API package manifests, Dockerfiles, compose files, .env.example, deployment verification scripts, hosted-staging runbook, and all applicable AGENTS.md files.
- Inspect all four current upload surfaces, videos/invoices directories, upload controllers/services, authorization guards, response contracts, audit behavior, and readiness probes before coding.
- The supplied job 00076 CHATGPT_REVIEW_BUNDLE.md, RESULT.json, DEPLOY_READINESS_GAPS.md, GO_LIVE_GATE_REPORT.md, TESTS_RUN.md, and NEXT_CONTEXT_PACKET.md.

Required:
- Introduce a narrow upload/blob storage provider seam used by every current upload surface. Preserve existing API response and authorization behavior unless a migration-safe compatibility layer is required.
- Implement a filesystem provider for local development and an S3-compatible provider for hosted staging. Use a maintained SDK already present or add the smallest justified dependency.
- Support safe put/read-or-stream/delete/exists-or-head operations, deterministic object keys, content type, size metadata, checksum or ETag evidence, and bounded timeouts/retries.
- Deny path traversal, unsafe object keys, oversized or disallowed MIME uploads, cross-tenant/cross-role access, unauthenticated download, and silent overwrite where the current business contract requires immutability.
- Keep buckets private. Prefer authenticated API streaming/proxy behavior unless the existing contract safely requires short-lived signed URLs; never return permanent public object URLs.
- Add explicit environment contracts for UPLOAD_STORAGE_PROVIDER, bucket, region, endpoint, path-style mode, credential references, timeout/retry limits, and optional key prefix. Do not add real secrets or insecure hosted defaults.
- Fail closed when hosted/staging mode selects filesystem without an explicit single-instance emergency override. Always fail closed when S3 configuration or readiness is invalid.
- Extend readiness so object-storage dependency state is visible without leaking endpoint credentials, bucket secrets, object keys, or customer data.
- Add disposable local MinIO or equivalent S3-compatible smoke support in a separate profile/topology. Keep the existing local filesystem workflow usable.
- Prove one synthetic video-like object and one synthetic invoice-like object can be stored, read with authorization, checked, and deleted across API restart or independent service instances using object storage.
- Add a migration/backfill inventory and dry-run plan for existing filesystem files, including checksum verification, idempotency, partial failure handling, rollback, orphan detection, reconciliation, and exact cleanup. Do not migrate any real file in this job.
- Update hosted-staging topology/runbook, deployment contract, release gate, evidence manifest, and upload matrix truthfully. Do not claim an external hosted bucket or provider acceptance occurred.
- Preserve parent/child learning, paid-pilot, auth/session, role-negative, audit, privacy, and immutable test-standard behavior.
- Keep production_ready=false, production_enabled=false, one initial API replica for staging, and all live providers disabled.

Forbidden:
- Real S3/cloud account calls, paid resource creation, image publication, source push, DNS mutation, or external deployment.
- Production credentials, real learner media, real invoices, or real customer/order/payment data.
- Public buckets, permanent unsigned object URLs, plaintext access keys, or credentials in logs/evidence/images.
- Live payment/refund/payout/notification/AI/provider mutation.
- Deleting, skipping, renaming, weakening, or rewriting existing tests or acceptance criteria to pass.

Tests and verification:
- Add provider contract tests shared by filesystem and S3 implementations.
- Add focused authorization, path/key safety, MIME/size, overwrite/idempotency, timeout/retry, fail-closed readiness, and redaction tests.
- Validate environment and deployment contracts for local filesystem, hosted S3, invalid S3, and denied hosted filesystem cases.
- Run disposable MinIO/mock S3 smoke with synthetic video/invoice objects, restart/cross-instance evidence, checksum verification, delete, reconciliation, and exact cleanup.
- Run Prisma generate/validate if touched, `npm run seed:demo`, `npm run report:demo`, `npm run test:learning-local`, deployment contract tests, `npm run build`, container builds, and hosted-staging smoke.
- Scan source, images, logs, and output for access keys, secret values, public bucket policies, real data, and unsafe URL/key patterns.
- Verify no matching containers, buckets, objects, volumes, networks, processes, listeners, or temporary artifacts remain after smoke.
- Produce CHATGPT_REVIEW_BUNDLE.md, RESULT.md, RESULT.json, REVIEW_PACKET.md, MANIFEST.json, FILES_CHANGED.md, TESTS_RUN.md, RISKS_AND_GAPS.md, NEXT_CONTEXT_PACKET.md, NEXT_CONTEXT_INDEX.json, CONTEXT_DELTA.md, OBJECT_STORAGE_REPORT.md, UPLOAD_MIGRATION_PLAN.md, CONTAINER_SMOKE_REPORT.md, DEPLOY_READINESS_GAPS.md, and GO_LIVE_GATE_REPORT.md.

Decision rule:
- PASS only when the object-storage provider seam and runnable local evidence pass truthfully.
- Keep production and external hosted deployment blocked.
- Recommend the smallest next hosted-staging authorization step after PASS; do not fabricate account, domain, secret-manager, or provider evidence.
