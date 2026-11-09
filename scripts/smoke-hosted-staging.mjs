import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const project = `mh-staging-smoke-${process.pid}`.toLowerCase();
const composeFile = "deploy/hosted-staging.compose.yml";
const secret = (prefix) => `${prefix}-${randomBytes(32).toString("hex")}`;

const reservePort = () =>
  new Promise((resolvePort, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close(() => resolvePort(port));
    });
  });

const [apiPort, webPort, minioPort] = await Promise.all([
  reservePort(),
  reservePort(),
  reservePort(),
]);
const postgresPassword = secret("postgres");
const redisPassword = secret("redis");
const environment = {
  ...process.env,
  POSTGRES_USER: "mh_smoke",
  POSTGRES_PASSWORD: postgresPassword,
  POSTGRES_DB: "mh_smoke",
  REDIS_PASSWORD: redisPassword,
  DATABASE_URL: `postgresql://mh_smoke:${encodeURIComponent(postgresPassword)}@postgres:5432/mh_smoke?schema=public`,
  REDIS_URL: `redis://:${encodeURIComponent(redisPassword)}@redis:6379/0`,
  API_PUBLIC_URL: "https://api.staging.example.test",
  WEB_PUBLIC_URL: "https://learn.staging.example.test",
  CORS_ORIGIN: "https://learn.staging.example.test",
  NEXT_PUBLIC_API_URL: "https://api.staging.example.test",
  JWT_SECRET: secret("jwt"),
  AUTH_OPERATIONAL_CONTROL_KEY_SECRET: secret("control"),
  API_BIND_ADDRESS: "127.0.0.1",
  API_PUBLISHED_PORT: String(apiPort),
  WEB_BIND_ADDRESS: "127.0.0.1",
  WEB_PUBLISHED_PORT: String(webPort),
  MINIO_BIND_ADDRESS: "127.0.0.1",
  MINIO_PUBLISHED_PORT: String(minioPort),
  UPLOAD_S3_BUCKET: "mh-smoke-private",
  UPLOAD_S3_REGION: "us-east-1",
  UPLOAD_S3_ENDPOINT: "http://minio:9000",
  UPLOAD_S3_FORCE_PATH_STYLE: "true",
  UPLOAD_S3_CREDENTIALS_REFERENCE: "disposable-local-minio-env",
  UPLOAD_S3_ACCESS_KEY_ID: "synthetic-minio-user",
  UPLOAD_S3_SECRET_ACCESS_KEY: "synthetic-minio-secret-key-123456",
  UPLOAD_S3_KEY_PREFIX: "smoke",
  UPLOAD_S3_TIMEOUT_MS: "5000",
  UPLOAD_S3_MAX_ATTEMPTS: "3",
  OBJECT_STORAGE_SMOKE_ENDPOINT: `http://127.0.0.1:${minioPort}`,
};

const composeArgs = [
  "compose",
  "--project-name",
  project,
  "-f",
  composeFile,
  "-f",
  "deploy/object-storage-smoke.compose.yml",
];

const run = (command, args, { capture = false, allowFailure = false } = {}) =>
  new Promise((resolveRun, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      env: environment,
      shell: false,
      stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
    });
    let stdout = "";
    let stderr = "";
    if (capture) {
      child.stdout.on("data", (chunk) => (stdout += chunk.toString()));
      child.stderr.on("data", (chunk) => (stderr += chunk.toString()));
    }
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0 || allowFailure) {
        resolveRun({ code: code ?? 1, stdout, stderr });
      } else {
        reject(new Error(`${command} exited ${code}: ${stderr.slice(0, 500)}`));
      }
    });
  });

const waitFor = async (url, expectedStatus = 200, timeoutMs = 120000) => {
  const deadline = Date.now() + timeoutMs;
  let lastStatus = 0;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      lastStatus = response.status;
      if (response.status === expectedStatus) return response;
    } catch {}
    await new Promise((resolveWait) => setTimeout(resolveWait, 1000));
  }
  throw new Error(`timeout waiting for ${url}; last status ${lastStatus}`);
};

const cleanup = async () => {
  await run(
    "docker",
    [
      ...composeArgs,
      "down",
      "--volumes",
      "--remove-orphans",
      "--rmi",
      "local",
      "--timeout",
      "20",
    ],
    { allowFailure: true },
  );
};

const dockerInfo = await run("docker", ["info"], {
  capture: true,
  allowFailure: true,
});
if (dockerInfo.code !== 0) {
  process.stderr.write(
    `${JSON.stringify({
      status: "BLOCKED",
      blocker: "DOCKER_ENGINE_UNAVAILABLE",
      productionReady: false,
      productionEnabled: false,
    })}\n`,
  );
  process.exit(2);
}

let smokePassed = false;
try {
  await run("docker", [...composeArgs, "config", "--quiet"]);
  await run("docker", [...composeArgs, "up", "--build", "--detach", "--wait"]);

  await waitFor(`http://127.0.0.1:${apiPort}/v1/health/live`);
  const readiness = await waitFor(
    `http://127.0.0.1:${apiPort}/v1/health/ready`,
  );
  const readinessBody = await readiness.json();
  if (
    readinessBody.checks?.database?.status !== "up" ||
    readinessBody.checks?.redis?.status !== "up" ||
    readinessBody.checks?.uploadStorage?.status !== "up"
  ) {
    throw new Error(
      "API dependency readiness did not prove database, Redis, and writable upload storage",
    );
  }
  await waitFor(`http://127.0.0.1:${webPort}/health`);
  await waitFor(`http://127.0.0.1:${minioPort}/minio/health/live`);
  const objectStorageSmoke = await run(
    "node",
    ["apps/api/scripts/smoke-object-storage.mjs"],
    { capture: true },
  );
  process.stdout.write(objectStorageSmoke.stdout);
  await waitFor(
    `http://127.0.0.1:${apiPort}/v1/learning-local-demo/release-candidate-go-live-gate-matrix-report`,
    404,
  );

  await run("docker", [...composeArgs, "restart", "api"]);
  await waitFor(`http://127.0.0.1:${apiPort}/v1/health/ready`);
  await run("docker", [...composeArgs, "run", "--rm", "migrate"]);

  for (const service of ["api", "web"]) {
    const imageResult = await run(
      "docker",
      [...composeArgs, "images", "-q", service],
      { capture: true },
    );
    const image = imageResult.stdout.trim().split(/\s+/)[0];
    if (!image) throw new Error(`image id missing for ${service}`);
    await run("docker", [
      "run",
      "--rm",
      "--entrypoint",
      "sh",
      image,
      "-c",
      "test ! -e /app/.env && test ! -e /app/.env.example && test ! -e /app/.codex-workspaces && test ! -e /app/src && test ! -e /app/prisma && ! find /app -path /app/node_modules -prune -o -path '*/uploads/*' -type f -print -quit | grep -q .",
    ]);
    const user = await run(
      "docker",
      ["inspect", "--format", "{{.Config.User}}", image],
      { capture: true },
    );
    if (user.stdout.trim() !== "node") {
      throw new Error(`${service} image does not run as node`);
    }
  }
  smokePassed = true;
} catch (error) {
  const logs = await run(
    "docker",
    [...composeArgs, "logs", "--no-color", "migrate", "api", "web"],
    { capture: true, allowFailure: true },
  );
  process.stderr.write(logs.stdout || logs.stderr);
  throw error;
} finally {
  await cleanup();
}

const leftovers = {};
for (const [kind, args] of Object.entries({
  containers: [
    "ps",
    "-aq",
    "--filter",
    `label=com.docker.compose.project=${project}`,
  ],
  networks: [
    "network",
    "ls",
    "-q",
    "--filter",
    `label=com.docker.compose.project=${project}`,
  ],
  volumes: [
    "volume",
    "ls",
    "-q",
    "--filter",
    `label=com.docker.compose.project=${project}`,
  ],
})) {
  const result = await run("docker", args, {
    capture: true,
    allowFailure: true,
  });
  leftovers[kind] = result.stdout.trim()
    ? result.stdout.trim().split(/\s+/).length
    : 0;
}

let listenerCount = 0;
for (const url of [
  `http://127.0.0.1:${apiPort}/v1/health/live`,
  `http://127.0.0.1:${webPort}/health`,
]) {
  try {
    await fetch(url, { signal: AbortSignal.timeout(1000) });
    listenerCount += 1;
  } catch {}
}
leftovers.listeners = listenerCount;

if (!smokePassed || Object.values(leftovers).some((count) => count !== 0)) {
  throw new Error(`smoke cleanup failed: ${JSON.stringify(leftovers)}`);
}

process.stdout.write(
  `${JSON.stringify({
    status: "PASS",
    apiLiveness: true,
    apiDatabaseRedisReadiness: true,
    apiWritableUploadStorageReadiness: true,
    privateObjectStorageSmoke: true,
    syntheticVideoAndInvoiceRoundTrip: true,
    independentStorageClientRead: true,
    checksumAndDeleteVerified: true,
    webReachability: true,
    localDemoProductionDenial: true,
    migrationOneShotAndRerun: true,
    restartSafety: true,
    imageSecretAndSourceScan: true,
    nonRootImages: true,
    exactCleanup: leftovers,
    productionReady: false,
    productionEnabled: false,
  })}\n`,
);
