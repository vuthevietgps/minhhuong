import test from "node:test";
import assert from "node:assert/strict";
import { dayAt } from "../policy.mjs";

const listeners = {};
const event = (key) => ({
  addListener: (fn) => {
    listeners[key] = fn;
  },
});
let state;
let tabs = [];
let dynamicRules = [];
let network;
const extensionUrl = "chrome-extension://test/";
globalThis.chrome = {
  runtime: {
    id: "test",
    getURL: (path) => extensionUrl + path,
    onMessage: event("message"),
    onInstalled: event("installed"),
    onStartup: event("startup"),
  },
  storage: {
    local: {
      get: async () => ({ control: structuredClone(state) }),
      set: async (data) => {
        state = structuredClone(data.control);
      },
      setAccessLevel: async () => {},
    },
  },
  alarms: { create: async () => {}, onAlarm: event("alarm") },
  tabs: {
    query: async () => tabs,
    get: async (id) => tabs.find((t) => t.id === id),
    update: async (id, props) => {
      Object.assign(
        tabs.find((t) => t.id === id),
        props,
      );
    },
    onRemoved: event("removed"),
  },
  windows: { get: async () => ({ focused: true }) },
  webNavigation: {
    onHistoryStateUpdated: event("history"),
    onCommitted: event("committed"),
  },
  declarativeNetRequest: {
    getDynamicRules: async () => dynamicRules,
    updateDynamicRules: async (input) => {
      dynamicRules = input.addRules;
    },
  },
};
globalThis.fetch = async (...args) => network(...args);
await import("../background.js");
const message = (
  body,
  sender = { id: "test", url: extensionUrl + "popup.html" },
) => new Promise((resolve) => listeners.message(body, sender, resolve));
const item = {
  id: "ff6a42dc-2522-4c8c-a2d0-915bdc7013b4",
  title: "Colors",
  url: "https://video.test/watch?id=1",
  minutes: 1,
  learningUrl:
    "https://school.test/kid-learning?item=ff6a42dc-2522-4c8c-a2d0-915bdc7013b4",
};
function setup() {
  state = {
    token: "a".repeat(64),
    api: "https://api.test",
    webOrigin: "https://school.test",
    childName: "Child",
    policy: {
      mode: "WATCH",
      dailyMinutes: 5,
      timezone: "Asia/Ho_Chi_Minh",
      windows: [],
      items: [item],
    },
    revision: 1,
    usage: [],
    events: [],
    leases: {},
    lastNow: Date.now(),
  };
  tabs = [{ id: 1, windowId: 1, url: item.url, active: true }];
  network = async () => {
    throw new Error("offline");
  };
}
const childSender = () => ({ tab: tabs[0], frameId: 0, url: tabs[0].url });
test("worker persists charge before response, serializes simultaneous heartbeats and hides credentials", async () => {
  setup();
  const replies = await Promise.all([
    message({ type: "HEARTBEAT" }, childSender()),
    message({ type: "HEARTBEAT" }, childSender()),
  ]);
  assert.ok(replies.every((r) => r.data.allowed));
  assert.equal(state.usage[0].seconds, 5);
  const status = await message({ type: "STATUS" });
  assert.equal(status.data.token, undefined);
  assert.equal((await message({ type: "STATUS" }, childSender())).ok, false);
});
test("offline sync retains policy, ledger and unsent events", async () => {
  setup();
  await message({ type: "HEARTBEAT" }, childSender());
  await message({ type: "SYNC" });
  assert.equal(state.usage[0].seconds, 5);
  assert.equal(state.events[0].kind, "WATCH");
  assert.equal(state.policy.mode, "WATCH");
});
test("status exposes the safe next action for each content state", async () => {
  setup();
  let status = await message({ type: "STATUS" });
  assert.equal(status.data.items[0].status, "WATCH_AVAILABLE");
  assert.equal(status.data.items[0].watchUrl, item.url);
  assert.equal(status.data.items[0].learningUrl, item.learningUrl);

  state.usage = [
    {
      day: dayAt(Date.now(), state.policy.timezone),
      itemId: item.id,
      seconds: item.minutes * 60,
    },
  ];
  status = await message({ type: "STATUS" });
  assert.equal(status.data.items[0].status, "TIME_UP");
  assert.equal(status.data.items[0].watchUrl, null);
  assert.equal(status.data.items[0].learningUrl, item.learningUrl);

  state.policy.mode = "LEARN_ONLY";
  status = await message({ type: "STATUS" });
  assert.equal(status.data.items[0].status, "LEARN_ONLY");
  assert.equal(status.data.items[0].watchUrl, null);

  state.policy.mode = "EXERCISE_ONLY";
  status = await message({ type: "STATUS" });
  assert.equal(status.data.items[0].status, "EXERCISE_ONLY");
});
test("restart clears leases but cannot refund persistent usage", async () => {
  setup();
  await message({ type: "HEARTBEAT" }, childSender());
  listeners.startup();
  await message({ type: "STATUS" }); // queue barrier
  await message({ type: "HEARTBEAT" }, childSender());
  assert.equal(state.usage[0].seconds, 10);
});
test("revocation removes allow rules, clears leases and redirects existing tabs", async () => {
  setup();
  await message({ type: "HEARTBEAT" }, childSender());
  network = async () => ({
    ok: false,
    status: 401,
    json: async () => ({ message: "revoked" }),
  });
  await message({ type: "SYNC" });
  assert.equal(state.revoked, true);
  assert.deepEqual(dynamicRules, []);
  assert.equal(tabs[0].url, extensionUrl + "blocked.html");
});
test("unauthorized page cannot relay learning, pair or reset device", async () => {
  setup();
  assert.equal(
    (await message({ type: "LEARNING", action: "lesson" }, childSender())).ok,
    false,
  );
  assert.equal(
    (await message({ type: "PAIR", api: "https://evil.test" }, childSender()))
      .ok,
    false,
  );
  assert.equal((await message({ type: "RESET" })).ok, false);
  assert.equal(
    (await message({ type: "PAIR", api: "https://evil.test" })).ok,
    false,
  );
});
test("learning bridge restricts exact sender and methods, retaining token in worker", async () => {
  setup();
  tabs[0].url = item.learningUrl;
  let requested;
  network = async (url, options) => {
    requested = { url, options };
    return { ok: true, json: async () => ({ title: "Colors" }) };
  };
  const response = await message(
    { type: "LEARNING", action: "lesson" },
    childSender(),
  );
  assert.equal(response.data.title, "Colors");
  assert.equal(response.data.token, undefined);
  assert.equal(
    requested.url,
    `https://api.test/v1/browser-extension/learning/${item.id}`,
  );
  assert.equal(
    (await message({ type: "LEARNING", action: "../sync" }, childSender())).ok,
    false,
  );
});
test("clock rollback locks current tab even if it has a prepaid lease", async () => {
  setup();
  state.lastNow = Date.now() + 120000;
  const response = await message({ type: "HEARTBEAT" }, childSender());
  assert.equal(response.data.allowed, false);
  assert.equal(state.clockWarning, true);
});
