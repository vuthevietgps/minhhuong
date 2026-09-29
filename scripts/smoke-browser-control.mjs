// Real Chromium + real built Next.js pages; deterministic API fixture.
// Database persistence and authorization are tested separately by test-browser-control.mjs.
import { chromium, expect } from "@playwright/test";
import { createServer } from "node:http";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { once } from "node:events";
const web = process.env.BROWSER_CONTROL_WEB_URL || "http://localhost:3000";
const output = resolve("output/browser-control-smoke");
await mkdir(output, { recursive: true });
const itemId = "5c385a42-fbdc-482d-b2dd-c34a7bb44830";
let policy = {
  mode: "WATCH",
  dailyMinutes: 20,
  timezone: "Asia/Ho_Chi_Minh",
  windows: [],
  items: [
    {
      id: itemId,
      title: "Màu sắc quanh em",
      url: "https://example.test/watch?v=colors",
      minutes: 1,
      context:
        "Ngữ cảnh tự viết về màu sắc. Red là đỏ, green là xanh lá, blue là xanh dương. Ví dụ mới: The leaf is green. Mỗi lượt chỉ hỏi một câu ngắn phù hợp trẻ dưới 10 tuổi.",
      questions: [
        { prompt: "Green là màu gì?", options: ["Xanh lá", "Đỏ"], answer: 0 },
      ],
    },
  ],
};
let revision = 1;
let revoked = false;
let offline = false;
let usage = [];
const events = [];
let paired = false;
const code = "1".repeat(32);
const token = "a".repeat(64);
const preparedItem = {
  ...structuredClone(policy.items[0]),
  id: "a9661f6c-2608-4537-8c22-f8e23d53dd2e",
  title: "Động vật quanh em",
  url: "https://www.youtube.com/watch?v=abcdefghijk",
  minutes: 10,
};
let imports = [];
const snapshot = () => ({
  policy: {
    ...policy,
    items: policy.items.map(({ context, questions, ...item }) => ({
      ...item,
      learningUrl: `${web}/kid-learning?item=${item.id}`,
    })),
  },
  revision,
  usage,
  serverTime: new Date().toISOString(),
  webOrigin: web,
  childName: "Bé An",
});
const server = createServer(async (req, res) => {
  if (offline && req.url?.includes("browser-extension")) {
    req.destroy();
    return;
  }
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  if (req.method === "OPTIONS") {
    res.writeHead(204).end();
    return;
  }
  let raw = "";
  for await (const chunk of req) raw += chunk;
  const body = raw ? JSON.parse(raw) : {};
  const send = (data, status = 200) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  };
  if (req.url === "/v1/browser-extension/pair") {
    if (paired || body.code !== code)
      return send({ message: "Invalid pairing" }, 401);
    paired = true;
    return send({ ...snapshot(), token, deviceId: "device-one" });
  }
  if (req.url.startsWith("/v1/browser-extension/")) {
    if (revoked || req.headers.authorization !== `Bearer ${token}`)
      return send({ message: "Device revoked" }, 401);
    if (req.url.endsWith("/sync")) {
      for (const row of body.usage) {
        const existing = usage.find(
          (u) => u.day === row.day && u.itemId === row.itemId,
        );
        if (existing)
          existing.seconds = Math.max(existing.seconds, row.seconds);
        else usage.push(row);
      }
      for (const event of body.events)
        if (!events.some((e) => e.eventId === event.eventId))
          events.push({ ...event, id: event.eventId, deviceId: "device-one" });
      return send(snapshot());
    }
    if (req.url.endsWith("/attempt")) {
      const detail = {
        correct: body.answers[0] === 0 ? 1 : 0,
        total: 1,
        title: policy.items[0].title,
      };
      events.push({
        id: body.eventId,
        eventId: body.eventId,
        deviceId: "device-one",
        kind: "EXERCISE",
        itemId,
        occurredAt: new Date().toISOString(),
        detail,
      });
      return send(detail);
    }
    if (req.url.endsWith("/chat"))
      return send({ text: "I like green. What color do you like?" });
    return send({
      title: policy.items[0].title,
      context: policy.items[0].context,
      aiEnabled: true,
      questions: policy.items[0].questions.map(({ answer, ...q }) => q),
      messages: [],
    });
  }
  if (req.url === "/v1/parent/children")
    return send({ children: [{ id: "child-one", displayName: "Bé An" }] });
  if (req.url.endsWith("/content/combos"))
    return send({
      combos: [
        {
          id: "combo-one",
          title: "Combo khám phá đầu tiên",
          description: "Các chủ đề ngắn cho con luyện tập mỗi ngày.",
          videos: [
            {
              title: preparedItem.title,
              url: preparedItem.url,
              sourceId: "source-one",
            },
          ],
        },
      ],
    });
  if (req.url.endsWith("/content/combos/combo-one")) {
    imports = [
      {
        id: preparedItem.id,
        title: preparedItem.title,
        url: preparedItem.url,
        minutes: 10,
        status: "READY",
        result: preparedItem,
      },
    ];
    return send({ queued: 1, skipped: 0, jobs: imports });
  }
  if (req.url.endsWith("/content/imports") && req.method === "POST") {
    if (!body.rightsConfirmed || !body.url)
      return send({ message: "Missing source information" }, 400);
    imports.push({
      id: "import-new",
      title: body.title || "Video mới",
      url: body.url,
      minutes: body.minutes,
      status: "WAITING_CONTEXT",
      result: null,
    });
    return send({ id: "import-new", reused: false });
  }
  if (req.url.endsWith("/content/imports")) return send({ jobs: imports });
  if (req.url.endsWith("/pairing"))
    return send({
      code,
      expiresAt: new Date(Date.now() + 600000).toISOString(),
    });
  if (req.method === "PUT") {
    policy = body;
    revision++;
    return send({ revision });
  }
  return send({
    policy,
    revision,
    devices: paired
      ? [
          {
            id: "device-one",
            name: "Máy học của An",
            revokedAt: null,
            lastSeenAt: new Date().toISOString(),
          },
        ]
      : [],
    usage: usage.map((u) => ({ ...u, deviceId: "device-one" })),
    events,
  });
});
server.listen(0, "127.0.0.1");
await once(server, "listening");
const api = `http://127.0.0.1:${server.address().port}`;
const launch = {
  headless: true,
  channel: "chromium",
  ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
    : {}),
};
const profile = await mkdtemp(join(tmpdir(), "minhhuong-browser-smoke-"));
let parentBrowser;
let child;
try {
  parentBrowser = await chromium.launch(launch);
  const parentContext = await parentBrowser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  await parentContext.addInitScript(() =>
    localStorage.setItem(
      "mhe_session",
      JSON.stringify({
        accessToken: "test-parent",
        user: { roles: ["PARENT"] },
      }),
    ),
  );
  await parentContext.route("**/v1/parent/**", (route) =>
    route.continue({ url: api + new URL(route.request().url()).pathname }),
  );
  const parent = await parentContext.newPage();
  await parent.goto(`${web}/browser-control`);
  await expect(
    parent.getByRole("heading", { name: "Thời gian & chế độ" }),
  ).toBeVisible();
  await parent.getByRole("button", { name: "Tạo mã kết nối" }).click();
  await expect(parent.getByText(code, { exact: true })).toBeVisible();
  await parent.getByRole("button", { name: "Chọn combo này" }).click();
  await parent
    .getByRole("button", { name: "Thêm 1 video vào danh sách của con" })
    .click();
  await expect(parent.getByText("Đã thêm cho con")).toBeVisible();
  await parent.getByText("+ Thêm link YouTube khác", { exact: true }).click();
  await parent
    .getByLabel("Link video YouTube")
    .fill("https://www.youtube.com/watch?v=12345678901");
  await parent
    .getByLabel("Tên gọi (tùy chọn)")
    .fill("Video riêng của gia đình");
  await parent
    .getByText("Thông tin bản quyền và lời thoại video", { exact: true })
    .click();
  await parent
    .getByLabel("Thông tin nguồn / căn cứ sử dụng")
    .fill("Video gốc do gia đình tự quay");
  await parent
    .getByLabel("Tôi xác nhận có quyền dùng nguồn để tạo nội dung học.")
    .check();
  await parent.getByRole("button", { name: "Thêm link & tạo bài học" }).click();
  await expect(
    parent.getByText("Đang chuẩn bị bài học"),
  ).toBeVisible();
  await parent.getByLabel("Phút xem mỗi ngày / thiết bị").fill("25");
  await parent.getByRole("button", { name: "Lưu thay đổi" }).click();
  await expect(
    parent.getByRole("status").filter({ hasText: "Đã lưu" }),
  ).toBeVisible();
  if (policy.dailyMinutes !== 25)
    throw new Error("Parent changes were not saved");
  if (
    policy.items.length !== 2 ||
    policy.items.some((item) => item.title === "Video riêng của gia đình")
  )
    throw new Error("Pending content was activated or combo was not saved");
  await parent.screenshot({
    path: join(output, "parent-desktop.png"),
    fullPage: true,
  });
  await parent.setViewportSize({ width: 390, height: 844 });
  if (
    await parent.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    )
  )
    throw new Error("Parent mobile page overflows");
  await parent.screenshot({
    path: join(output, "parent-mobile.png"),
    fullPage: true,
  });
  console.log(
    "Parent UI: combo selection, new link queue, pending exclusion, configuration, pairing and mobile layout passed",
  );

  const extension = resolve("minhhuongextension");
  const launchChild = async () => {
    const context = await chromium.launchPersistentContext(profile, {
      ...launch,
      args: [
        `--disable-extensions-except=${extension}`,
        `--load-extension=${extension}`,
      ],
      viewport: { width: 1280, height: 900 },
    });
    await context.route("https://example.test/**", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: "<html><body><h1>Approved colors video</h1><video></video></body></html>",
      }),
    );
    const worker =
      context.serviceWorkers()[0] ||
      (await context.waitForEvent("serviceworker"));
    const id = worker.url().split("/")[2];
    return { context, worker, id };
  };
  let runtime = await launchChild();
  child = runtime.context;
  const popup = await child.newPage();
  await popup.goto(`chrome-extension://${runtime.id}/popup.html`);
  await popup.getByLabel("Địa chỉ API").fill(api);
  await popup.getByLabel("Tên thiết bị").fill("Máy học của An");
  await popup.getByLabel("Mã kết nối").fill(code);
  await popup.getByRole("button", { name: "Kết nối máy" }).click();
  await expect(popup.locator("#status")).toContainText("Bé An");
  const tab = await child.newPage();
  await tab.goto("https://unapproved.test").catch(() => {});
  await expect(tab).toHaveURL(
    new RegExp(`chrome-extension://${runtime.id}/blocked.html`),
  );
  await tab.screenshot({
    path: join(output, "extension-blocked.png"),
    fullPage: true,
  });
  await tab.goto(policy.items[0].url);
  await tab.bringToFront();
  await expect(
    tab.getByRole("heading", { name: "Approved colors video" }),
  ).toBeVisible();
  await expect
    .poll(
      async () =>
        (
          await runtime.worker.evaluate(
            async () =>
              (await chrome.storage.local.get("control")).control.usage,
          )
        )[0]?.seconds,
    )
    .toBeGreaterThan(0);
  const beforeRestart = await runtime.worker.evaluate(
    async () =>
      (await chrome.storage.local.get("control")).control.usage[0].seconds,
  );
  await child.close();
  runtime = await launchChild();
  child = runtime.context;
  const afterRestart = await runtime.worker.evaluate(
    async () =>
      (await chrome.storage.local.get("control")).control.usage[0].seconds,
  );
  if (afterRestart < beforeRestart)
    throw new Error("Restart refunded watch allowance");
  console.log(
    "Extension: actual DNR deny/allow, pairing, persisted allowance passed",
  );

  // Leave only the final five-second viewing block; the content script must stop it.
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: policy.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format();
  usage = [{ day, itemId, seconds: 55 }];
  const settings = await child.newPage();
  await settings.goto(`chrome-extension://${runtime.id}/popup.html`);
  await settings.getByRole("button", { name: "Kiểm tra thay đổi" }).click();
  await expect(
    settings.getByRole("button", { name: "Kiểm tra thay đổi" }),
  ).toBeEnabled();
  const learning = await child.newPage();
  await learning.goto(policy.items[0].url);
  await learning.bringToFront();
  await expect(learning).toHaveURL(`${web}/kid-learning?item=${itemId}`, {
    timeout: 16000,
  });
  await expect(
    learning.getByRole("heading", { name: "Chọn câu trả lời nhé" }),
  ).toBeVisible();
  await learning.getByLabel("Xanh lá", { exact: true }).check();
  await learning.getByRole("button", { name: "Xem kết quả" }).click();
  await expect(learning.getByText("Con trả lời đúng 1/1 câu.")).toBeVisible();
  await learning.getByLabel("Con muốn nói gì?").fill("Hello");
  await learning.getByRole("button", { name: "Gửi lời nhắn" }).click();
  await expect(
    learning.getByText("I like green. What color do you like?"),
  ).toBeVisible();
  await learning.screenshot({
    path: join(output, "kid-learning.png"),
    fullPage: true,
  });
  console.log(
    "Extension → website: deadline transition, learning bridge, quiz and chat passed",
  );
  offline = true;
  await settings.getByRole("button", { name: "Kiểm tra thay đổi" }).click();
  await expect(settings.locator("#status")).toContainText("Offline");
  await learning.goto(policy.items[0].url).catch(() => {});
  await expect(learning).not.toHaveURL(policy.items[0].url);
  offline = false;
  revoked = true;
  await settings.getByRole("button", { name: "Kiểm tra thay đổi" }).click();
  await expect(settings.locator("#status")).toContainText(
    "Thiết bị đã bị thu hồi",
  );
  await expect(learning).toHaveURL(new RegExp("/blocked.html$"));
  await parent.getByRole("button", { name: "Làm mới báo cáo" }).click();
  await expect(parent.getByText("1/1 câu đúng")).toBeVisible();
  console.log(
    "Offline enforcement, revocation and parent result report passed",
  );
  console.log(`Screenshots: ${output}`);
} finally {
  await child?.close();
  await parentBrowser?.close();
  server.close();
  if (!profile.startsWith(join(tmpdir(), "minhhuong-browser-smoke-")))
    throw new Error("Unexpected temporary profile path");
  await rm(profile, { recursive: true, force: true });
}
