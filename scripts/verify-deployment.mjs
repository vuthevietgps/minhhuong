import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error("npm_execpath is required");
const syntheticEnvironment = {
  ...process.env,
  POSTGRES_USER: "mh_contract",
  POSTGRES_PASSWORD: "synthetic-contract-password",
  POSTGRES_DB: "mh_contract",
  REDIS_PASSWORD: "synthetic-redis-password",
  DATABASE_URL:
    "postgresql://mh_contract:synthetic-contract-password@postgres:5432/mh_contract?schema=public",
  REDIS_URL: "redis://:synthetic-redis-password@redis:6379/0",
  API_PUBLIC_URL: "https://api.staging.example.test",
  WEB_PUBLIC_URL: "https://learn.staging.example.test",
  CORS_ORIGIN: "https://learn.staging.example.test",
  NEXT_PUBLIC_API_URL: "https://api.staging.example.test",
  JWT_SECRET: "synthetic-jwt-secret-at-least-thirty-two-characters",
  AUTH_OPERATIONAL_CONTROL_KEY_SECRET:
    "synthetic-control-secret-at-least-thirty-two-characters",
  UPLOAD_S3_BUCKET: "synthetic-private-bucket",
  UPLOAD_S3_REGION: "us-east-1",
  UPLOAD_S3_CREDENTIALS_REFERENCE: "synthetic-secret-reference",
  UPLOAD_S3_TIMEOUT_MS: "5000",
  UPLOAD_S3_MAX_ATTEMPTS: "3",
};

const run = (command, args, environment = process.env) => {
  const result = spawnSync(command, args, {
    cwd: root,
    env: environment,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
  });
  if (result.status !== 0) {
    process.stderr.write(
      result.stderr ||
        result.stdout ||
        result.error?.message ||
        "command failed",
    );
    process.exit(result.status ?? 1);
  }
};

run("node", [
  "--test",
  "scripts/deployment-contract.test.mjs",
  "apps/api/scripts/run-hosted-migration.test.mjs",
]);
run(
  "docker",
  [
    "compose",
    "--project-name",
    "mh-deployment-contract",
    "-f",
    "deploy/hosted-staging.compose.yml",
    "config",
    "--quiet",
  ],
  syntheticEnvironment,
);
run(
  process.execPath,
  [npmCli, "--prefix", "apps/api", "run", "prisma:validate"],
  syntheticEnvironment,
);
run(
  process.execPath,
  [npmCli, "--prefix", "apps/api", "run", "migrate:hosted-staging:preflight"],
  {
    ...syntheticEnvironment,
    NODE_ENV: "production",
    DEPLOYMENT_ENVIRONMENT: "hosted-staging",
    PRODUCTION_READY: "false",
    PRODUCTION_ENABLED: "false",
    LOCAL_DEMO_ROUTES_ENABLED: "false",
    MIGRATION_BACKUP_PATH: "/backups/pre-migration.dump",
    MIGRATION_BACKUP_HOOK: "/app/deploy/hooks/backup-postgres.sh",
    MIGRATION_ROLLBACK_HOOK: "/app/deploy/hooks/rollback-postgres.sh",
  },
);

process.stdout.write(
  `${JSON.stringify({
    status: "PASS",
    deploymentContractTests: true,
    composeConfig: true,
    prismaValidate: true,
    migrationPreflight: true,
    databaseConnectionUsed: false,
    productionReady: false,
    productionEnabled: false,
  })}\n`,
);
