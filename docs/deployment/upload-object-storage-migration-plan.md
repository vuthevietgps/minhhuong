# Upload Object-Storage Migration Plan

Status: executable read-only inventory plus dry-run design. No real upload is
migrated and no object-storage provider is contacted by this repository job.

## Inventory

Build a read-only inventory from the configured filesystem root and database references for:

- `videos/**` referenced by `VideoAsset.storageKey`;
- `invoices/**` referenced by activation-order sale/operation invoice keys;
- `invoices/**` referenced by channel-finance payout invoice keys;
- unreferenced filesystem files, missing referenced files, duplicate checksums, metadata sidecars, size, MIME, modified time, and normalized safe target key.

Reject traversal, symlinks outside the configured root, unsupported MIME, files above the surface limit, unreadable files, and ambiguous database ownership. Emit only redacted record IDs, relative keys, sizes, MIME, checksums, and decisions.

The implemented inventory also records source modified time, validates optional
metadata sidecars, fingerprints database record IDs with SHA-256, and classifies
every row without exposing raw database IDs. Run it only against a disposable or
approved localhost database:

```powershell
$env:UPLOAD_MIGRATION_DRY_RUN = "true"
$env:DATABASE_URL = "postgresql://<local-user>:<local-password>@localhost:5432/<local-db>?schema=public"
npm run uploads:migration:inventory
```

The runner refuses production and non-localhost databases. Its output states
`databaseMutationCount: 0`, `providerCallCount: 0`, and
`targetState: NOT_CHECKED_NO_PROVIDER_CALL`; redirect the JSON to an approved
local evidence path if it must be retained. A clean inventory is evidence for a
later authorized migration, not permission to perform one.

## Dry run and idempotency

1. Freeze destructive upload cleanup; normal writes may continue through the provider seam.
2. Snapshot database reference counts and filesystem inventory.
3. Stream each file to SHA-256 without loading the full migration corpus into memory.
4. Derive the target key from category, surface, SHA-256, and sanitized basename.
5. `HEAD` the target. If absent, plan immutable `PUT If-None-Match: *`. If present with the same checksum/size/MIME, mark `ALREADY_VERIFIED`. If metadata differs, mark `CONFLICT` and stop that record.
6. Write a durable checkpoint per source key with attempt, target key, checksum, size, status, and redacted error code. Reruns consume checkpoints and re-verify remote state.
7. Do not update database references during dry run.

## Execution and partial failure

An authorized later migration runs in bounded batches. After immutable put, it reads or heads the object, verifies SHA-256/size/MIME, then updates the database reference in a transaction guarded by the old key. A failed put/read/check leaves the database unchanged. A failed database update leaves a verified candidate object recorded for reconciliation, never silently deleted.

Pause when error rate, timeout rate, checksum mismatch, source mutation, or target conflict exceeds the approved threshold. Retry only retryable transport/5xx errors with the configured bounded SDK attempts. Never retry authorization, checksum, key-safety, MIME, size, or conflict failures automatically.

## Rollback

During the rollback window, retain source files read-only. Rollback atomically restores database references to the verified source key, verifies local readability, then marks the object candidate rollback-safe. Do not delete target objects until reconciliation proves no database reference, no active checkpoint, and retention-owner approval.

## Orphans, reconciliation, and cleanup

Reconcile three sets: database references, source files, and target objects under the approved prefix. Classify `CONSISTENT`, `MISSING_SOURCE`, `MISSING_TARGET`, `CHECKSUM_MISMATCH`, `SOURCE_ORPHAN`, `TARGET_ORPHAN`, `CONFLICT`, or `IN_FLIGHT`. Cleanup is a separate approved phase: export the signed/redacted reconciliation manifest, wait the retention window, re-head/recheck references, delete exact allowlisted keys, verify 404, and record deletion results. Never delete by broad prefix or bucket recursion.

## Acceptance gates

- Dry-run totals balance and every record has one terminal classification.
- Zero unsafe keys, checksum mismatches, ambiguous owners, or silent overwrites.
- Idempotent rerun produces the same plan and no additional puts.
- Sample video and invoice read through authenticated application paths.
- Rollback rehearsal restores references without data loss.
- Exact cleanup leaves no disposable containers, objects, buckets, volumes, networks, listeners, credentials, or temporary manifests.
- Production remains blocked pending target, privacy/retention, security, operations, and release-owner approvals.
