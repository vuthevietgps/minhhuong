import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("API and web images are deterministic, multi-stage, non-root, and health checked", async () => {
  const [api, web] = await Promise.all([
    read("apps/api/Dockerfile"),
    read("apps/web/Dockerfile"),
  ]);

  for (const dockerfile of [api, web]) {
    assert.match(dockerfile, /npm ci/);
    assert.match(dockerfile, /USER node/);
    assert.match(dockerfile, /HEALTHCHECK/);
    assert.doesNotMatch(dockerfile, /COPY\s+\.\s+\./);
  }
  assert.match(api, /AS api-migrate/);
  assert.match(api, /dist\/src\/main\.js/);
  assert.match(web, /\.next\/standalone/);

  const apiRuntime = api.split("AS api-runtime")[1].split("AS api-migrate")[0];
  assert.doesNotMatch(apiRuntime, /apps\/api\/prisma/);
});

test("hosted staging topology has isolated data services and a one-shot migration dependency", async () => {
  const compose = await read("deploy/hosted-staging.compose.yml");

  for (const service of ["postgres", "redis", "migrate", "api", "web"]) {
    assert.match(compose, new RegExp(`^  ${service}:`, "m"));
  }
  assert.match(compose, /service_completed_successfully/);
  assert.match(compose, /internal: true/);
  assert.match(compose, /PRODUCTION_READY: "false"/);
  assert.match(compose, /PRODUCTION_ENABLED: "false"/);
  assert.match(compose, /LOCAL_DEMO_ROUTES_ENABLED: "false"/);
  assert.match(compose, /NOTIFICATION_PROVIDER: disabled/);
  assert.match(compose, /UPLOAD_STORAGE_PROVIDER: s3/);
  assert.match(compose, /UPLOAD_STORAGE_TOPOLOGY: shared-object/);
  assert.match(compose, /UPLOAD_S3_BUCKET/);
  assert.match(compose, /API_REPLICA_COUNT: "1"/);
  assert.doesNotMatch(compose, /minhhuong:minhhuong/);
  assert.doesNotMatch(compose, /change-me-in-production/);
});

test("repository Docker context excludes secrets, local data, evidence, and build output", async () => {
  const dockerignore = await read(".dockerignore");
  for (const entry of [
    ".codex-workspaces",
    ".env.*",
    "**/node_modules",
    "**/.next",
    "**/dist",
    "apps/api/uploads",
    "audit-output",
  ]) {
    assert.ok(dockerignore.includes(entry), `missing ${entry}`);
  }
  assert.ok(dockerignore.includes("!.env.example"));
});

test("runtime contracts distinguish liveness, readiness, metrics, and web health", async () => {
  const [health, readiness, webHealth] = await Promise.all([
    read("apps/api/src/health/health.controller.ts"),
    read("apps/api/src/health/dependency-readiness.service.ts"),
    read("apps/web/src/app/health/route.ts"),
  ]);

  assert.match(health, /@Get\('live'\)/);
  assert.match(health, /@Get\('ready'\)/);
  assert.match(health, /@Get\('metrics'\)/);
  assert.match(readiness, /SELECT 1/);
  assert.match(readiness, /\['PING'\]/);
  assert.match(readiness, /resolveBlobStorage/);
  assert.match(readiness, /uploadStorage/);
  assert.match(webHealth, /cache-control/);
});

test("all API upload surfaces share the provider-neutral immutable storage resolver", async () => {
  const [storage, engine, admin, teacher, orders, finance, main] =
    await Promise.all([
      read("apps/api/src/upload-storage/blob-storage.ts"),
      read("apps/api/src/upload-storage/provider-upload-storage.ts"),
      read("apps/api/src/admin-content/admin-content.controller.ts"),
      read("apps/api/src/teacher-content/teacher-content.controller.ts"),
      read("apps/api/src/activation-orders/activation-orders.controller.ts"),
      read("apps/api/src/channel-finance/channel-finance.controller.ts"),
      read("apps/api/src/main.ts"),
    ]);

  assert.match(storage, /class FilesystemBlobStorage/);
  assert.match(storage, /class S3BlobStorage/);
  assert.match(storage, /UPLOAD_STORAGE_PROVIDER_UNSUPPORTED/);
  assert.match(storage, /IfNoneMatch: '\*'/);
  assert.match(engine, /buildDeterministicUploadObjectKey/);
  for (const controller of [admin, teacher, orders, finance]) {
    assert.match(controller, /createProviderUploadStorage/);
    assert.doesNotMatch(controller, /process\.cwd\(\).*uploads/);
  }
  assert.match(main, /resolveFilesystemUploadsRoot/);
  assert.match(main, /UPLOAD_STORAGE_PROVIDER.*s3/s);
});

test("protected upload reads authorize before storage access and migration inventory stays local read-only", async () => {
  const [controller, access, inventory, runner, apiPackage, webClient] =
    await Promise.all([
      read("apps/api/src/upload-storage/upload-storage.controller.ts"),
      read("apps/api/src/upload-storage/upload-object-access.service.ts"),
      read("apps/api/src/upload-storage/upload-migration-inventory.ts"),
      read("apps/api/scripts/run-upload-migration-inventory.ts"),
      read("apps/api/package.json"),
      read("apps/web/src/app/admin/_lib/admin-client.ts"),
    ]);

  assert.match(controller, /@UseGuards\(JwtAuthGuard\)/);
  const authorization = controller.indexOf("await this.access.assertCanRead");
  const storageRead = controller.indexOf("getUploadBlobStorage().read");
  assert.ok(authorization >= 0 && storageRead > authorization);
  assert.match(access, /assertCanAccessChild/);
  assert.match(access, /assertCapability/);
  assert.match(access, /assertLessonAvailableForChild/);
  assert.match(access, /action: 'upload.object.read'/);
  assert.match(access, /keyFingerprint/);
  assert.doesNotMatch(access, /metadata:\s*{\s*key:/);

  assert.match(inventory, /databaseMutationCount: 0/);
  assert.match(inventory, /providerCallCount: 0/);
  assert.match(inventory, /recordFingerprint/);
  assert.match(inventory, /SYMLINK_NOT_ALLOWED/);
  assert.match(runner, /UPLOAD_MIGRATION_DRY_RUN/);
  assert.match(runner, /disabled in production/);
  assert.match(runner, /requires a localhost database/);
  assert.doesNotMatch(runner, /\.create\(|\.update\(|\.delete\(|\.upsert\(/);
  assert.match(apiPackage, /uploads:migration:inventory/);
  assert.match(
    webClient,
    /url\.origin !== new URL\(publicApiBaseUrl\)\.origin/,
  );
});

test("migration runner uses deploy, advisory locking, backup, and rollback hooks", async () => {
  const [migration, backupHook, restoreHook] = await Promise.all([
    read("apps/api/scripts/run-hosted-migration.mjs"),
    read("deploy/hooks/backup-postgres.sh"),
    read("deploy/hooks/restore-postgres.sh"),
  ]);

  assert.match(migration, /pg_try_advisory_lock/);
  assert.match(migration, /runPrisma\('migrate', 'deploy'\)/);
  assert.match(migration, /MIGRATION_BACKUP_HOOK/);
  assert.match(migration, /MIGRATION_ROLLBACK_HOOK/);
  assert.doesNotMatch(migration, /migrate dev/);
  assert.match(backupHook, /searchParams\.delete\('schema'\)/);
  assert.match(restoreHook, /searchParams\.delete\('schema'\)/);
});
