# Minh Huong Hosted-Staging Runbook

Status: provider-neutral reference only. No external deployment or production enablement is authorized. `production_ready=false` and `production_enabled=false` are mandatory.

## 1. Required target and owners

Before using this package outside an isolated local smoke, record a separately approved hosted non-production target with:

- Hosting account/project and billing owner.
- Staging domain and DNS/TLS owner.
- Managed PostgreSQL and Redis instances with staging-only credentials.
- Private S3-compatible bucket and staging-only credential references, with storage/privacy owners.
- Database, security, privacy/retention, incident/on-call, and release owners.
- Backup retention, RPO/RTO, alert thresholds, rollback authority, and a deletion date for staging evidence.

Do not reuse production credentials, data, domains, provider accounts, or encryption/signing keys.

## 2. Secrets and configuration

Copy `deploy/hosted-staging.env.example` to a secret manager or an untracked file outside the repository. Generate independent high-entropy values for PostgreSQL, Redis, JWT, and the auth operational HMAC key. URLs must use the approved staging domains and TLS at the public edge.

The staging contract requires:

- `NODE_ENV=production` and `DEPLOYMENT_ENVIRONMENT=hosted-staging`.
- `PRODUCTION_READY=false`, `PRODUCTION_ENABLED=false`, and `LOCAL_DEMO_ROUTES_ENABLED=false`.
- Explicit HTTPS `API_PUBLIC_URL`, `WEB_PUBLIC_URL`, `CORS_ORIGIN`, and `NEXT_PUBLIC_API_URL`.
- Auth session, operational control, and alert state providers set to `prisma`.
- Notification, payment, AI, and video providers set to `disabled`.
- Authenticated `DATABASE_URL` and `REDIS_URL`; TLS verification must stay enabled for managed TLS services.
- `UPLOAD_STORAGE_PROVIDER=s3`, `UPLOAD_STORAGE_TOPOLOGY=shared-object`, `API_REPLICA_COUNT=1`, private bucket/region, bounded timeout/retry values, and staging-only credential references. Runtime validation fails closed for incomplete S3 configuration. Filesystem is local-development only unless an explicit single-instance emergency override is separately authorized.

Render the topology before any start:

```sh
docker compose --env-file /secure/path/minhhuong-staging.env -f deploy/hosted-staging.compose.yml config --quiet
```

Never attach the rendered config to public logs because interpolation may contain credentials.

## 3. DNS, TLS, and network policy

Terminate TLS at the approved provider edge. Route the web domain only to the web service and the API domain only to the API service. PostgreSQL and Redis must stay private and must not publish host ports. Restrict API CORS to the exact approved web origins. Keep admin/support routes behind the existing JWT/RBAC controls; do not add a public inspection bypass.

Do not change DNS or certificates from this repository job. The target owner performs those actions only after separate authorization.

## 4. Database, migration, and backup

The `migrate` service is a one-shot prerequisite for the API. It validates the staging-only safety contract, runs `prisma validate`, opens the database, acquires a PostgreSQL advisory lock, executes the required backup hook, runs `prisma migrate deploy`, checks migration status and database readability, and exits nonzero on any failure.

The default hook writes a custom-format `pg_dump` and SHA-256 sidecar to the `migration-backups` volume. Preserve that volume or export the encrypted backup to the approved backup service before activation. Never use `prisma migrate dev` in hosted staging.

Run migration and inspect its exit state:

```sh
docker compose --env-file /secure/path/minhhuong-staging.env -f deploy/hosted-staging.compose.yml up migrate
docker compose --env-file /secure/path/minhhuong-staging.env -f deploy/hosted-staging.compose.yml ps --all migrate
```

If migration fails, keep API activation stopped. The rollback hook defaults to containment and does not automatically restore. Prefer forward repair after writes. A destructive restore requires database-owner approval, `MIGRATION_AUTO_RESTORE_ON_FAILURE=true`, `MIGRATION_RESTORE_APPROVED=true`, and an exact `MIGRATION_RESTORE_CONFIRM_DATABASE` match; test the backup checksum first.

## 5. Start and smoke

After the migration has exited successfully:

```sh
docker compose --env-file /secure/path/minhhuong-staging.env -f deploy/hosted-staging.compose.yml up -d api web
```

Verify:

1. API `GET /v1/health/live` returns 200 independently of dependencies.
2. API `GET /v1/health/ready` returns database, Redis, and writable upload storage `up` with no credential, path, or connection-string details.
3. Web `GET /health` and the main web page return 200.
4. API local-demo routes return 404 in this production-mode staging runtime.
5. A restart returns to readiness without rerunning unsafe bootstrap or losing the shared auth state.
6. The migration job can be rerun idempotently and still exits zero.
7. Images run as `node` and contain no `.env`, `.codex-workspaces`, local upload data, or application source tree.

`npm run smoke:hosted-staging` automates these checks with synthetic credentials and exact cleanup on a Docker host. It is not hosted-provider acceptance evidence.

Do not run `seed:demo` against hosted staging. Seed/report commands are offline synthetic evidence lanes only. Any later staging dataset must be separately approved, synthetic or pseudonymized, and traceably deleted.

## 6. Uploads and object storage

All four upload surfaces use the same provider-neutral seam. Hosted staging writes content-addressed immutable keys to a private S3-compatible bucket, while local development retains filesystem storage. Downloads are proxied through the authenticated API; no permanent public object URL is returned. Readiness performs a redacted bucket-level check and returns only provider kind, `up`/`down`, and duration.

Before any separately approved backfill, run the repository's read-only
inventory against a localhost database with `UPLOAD_MIGRATION_DRY_RUN=true` and
`npm run uploads:migration:inventory`. It fingerprints record IDs, reads only
database references and local files, rejects unsafe or inconsistent inputs, and
makes zero database mutations and zero provider calls. Review
`upload-object-storage-migration-plan.md` before retaining its JSON output or
requesting migration authorization.

The disposable local smoke adds `deploy/object-storage-smoke.compose.yml`, uses synthetic MinIO credentials and objects, verifies video/invoice checksums through an independent client, deletes the objects, and removes the volume/network/containers. Do not change `API_REPLICA_COUNT` or claim hosted failover until a real staging target passes provider, security, privacy, retention, and operations acceptance.

## 7. Monitoring and incident response

Collect JSON stdout/stderr logs from both services. Scrape `/v1/health/metrics` through a private monitoring path. At minimum route availability, readiness failure, 5xx rate, latency, auth denial/throttle/replay, database saturation, Redis failure, disk/upload capacity, migration exit, and provider-disabled state.

Use the conditional rehearsal thresholds until owners approve target-specific values: 5xx at or above 1% for five minutes, database utilization at or above 80% for ten minutes, or auth failures at or above three times the 15-minute baseline. Assign a 15-minute critical acknowledgement and 30-minute containment/rollback decision objective. These are staging rehearsal objectives, not production SLAs.

On incident: freeze promotion, preserve redacted logs/audit rows, disable new writes where necessary, keep all provider lanes disabled, identify the release/image digest, choose forward repair or approved restore, verify readiness and business smoke, and record owner/time/correlation/recovery evidence.

## 8. Rollback and cleanup

Application rollback uses the last accepted immutable image set and the same schema-compatible environment. Database rollback defaults to forward repair; destructive restore requires the controls in section 4. Preserve append-only audit evidence.

For an isolated rehearsal, clean exactly:

```sh
docker compose --project-name <rehearsal-project> -f deploy/hosted-staging.compose.yml down --volumes --remove-orphans --rmi local
```

Confirm there are no project-labeled containers, networks, volumes, published listeners, temporary backups, secret env files, or processes. Hosted evidence retention/deletion follows the approved staging retention owner, never an inferred repository default.

## 9. Promotion gate

Promotion remains blocked until a real hosting target supplies passing evidence for managed database/Redis connectivity, DNS/TLS, backups/restores, migration and forward repair, multi-instance auth and upload behavior, capacity/failover, external logs/metrics/alerts/on-call drill, privacy retention/export/deletion, independent security review, and any provider-specific sandbox acceptance. A named release owner must then issue a separate production decision. This runbook and a local PASS cannot set production flags or authorize production.
