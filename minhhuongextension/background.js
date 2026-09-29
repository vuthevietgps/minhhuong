import {
  decide,
  exactRegex,
  mergeUsage,
  reserve,
  sameUrl,
  learningTarget,
  itemAvailability,
} from "./policy.mjs";

const blocked = chrome.runtime.getURL("blocked.html");
let chain = Promise.resolve();
// Serialize ledger changes across tabs, alarms, startup and network replies.
function serial(fn) {
  const result = chain.then(fn);
  chain = result.catch(console.error);
  return result;
}
const read = async () => (await chrome.storage.local.get("control")).control;
const save = (state) => chrome.storage.local.set({ control: state });
async function request(api, path, token, body) {
  const response = await fetch(`${api}/v1/browser-extension/${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(12000),
    cache: "no-store",
    redirect: "error",
  });
  if (!response.ok) {
    const error = new Error(
      (await response.json().catch(() => ({}))).message ||
        "Không thể kết nối máy chủ",
    );
    error.status = response.status;
    throw error;
  }
  return response.json();
}
function log(state, kind, itemId) {
  // Do not collect arbitrary browsing URLs or page contents.
  const last = state.events.at(-1);
  if (
    last?.kind === kind &&
    last.itemId === itemId &&
    Date.now() - Date.parse(last.occurredAt) < 30000
  )
    return;
  state.events.push({
    eventId: crypto.randomUUID(),
    kind,
    ...(itemId ? { itemId } : {}),
    occurredAt: new Date().toISOString(),
  });
  state.events = state.events.slice(-2000);
}
function safeNow(state) {
  const now = Date.now();
  if (now + 60000 < (state.lastNow || 0)) state.clockWarning = true;
  state.lastNow = Math.max(now, state.lastNow || 0);
  return state.lastNow;
}
async function rules(state) {
  const now = state ? safeNow(state) : Date.now();
  const urls =
    state?.policy?.items
      .flatMap((item) =>
        [item.url, item.learningUrl, item.aiUrl].filter(Boolean),
      )
      .filter((url) => decide(state, url, now).allowed) || [];
  const addRules = [...new Set(urls)].map((url, index) => ({
    id: 100 + index,
    priority: 10,
    action: { type: "allow" },
    condition: {
      regexFilter: exactRegex(url),
      isUrlFilterCaseSensitive: true,
      resourceTypes: ["main_frame"],
    },
  }));
  for (const item of state?.policy?.items || []) {
    const decision = decide(state, item.url, now);
    if (!decision.allowed && decision.target)
      addRules.push({
        id: 1000 + addRules.length,
        priority: 5,
        action: { type: "redirect", redirect: { url: decision.target } },
        condition: {
          regexFilter: exactRegex(item.url),
          isUrlFilterCaseSensitive: true,
          resourceTypes: ["main_frame"],
        },
      });
  }
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: (await chrome.declarativeNetRequest.getDynamicRules()).map(
      (r) => r.id,
    ),
    addRules,
  });
}
async function enforce(state) {
  const now = state ? safeNow(state) : Date.now();
  for (const tab of await chrome.tabs.query({})) {
    if (!/^https?:/.test(tab.url || "")) continue;
    const decision = decide(state, tab.url, now);
    // A prepaid lease is valid until its deadline, including the last five seconds.
    const lease = state?.leases?.[tab.id];
    if (
      lease &&
      lease.until > now &&
      sameUrl(lease.url, tab.url) &&
      state.policy.mode === "WATCH" &&
      !state.revoked &&
      !state.clockWarning &&
      lease.revision === state.revision
    )
      continue;
    if (!decision.allowed) {
      if (state)
        log(state, decision.item ? "TIME_UP" : "BLOCKED", decision.item?.id);
      await chrome.tabs
        .update(tab.id, { url: decision.target || blocked })
        .catch(() => {});
    }
  }
  if (state) await save(state);
}
async function sync() {
  const state = await read();
  if (!state?.token || state.revoked) return;
  try {
    const cutoff = new Date(Date.now() - 30 * 86400000)
      .toISOString()
      .slice(0, 10);
    state.usage = state.usage.filter((u) => u.day >= cutoff);
    // Oldest unsent snapshots first; remove only acknowledged event IDs.
    const events = state.events.slice(0, 200);
    const pending = state.usage
      .filter(
        (u) =>
          !state.sentUsage ||
          state.sentUsage[`${u.day}:${u.itemId}`] !== u.seconds,
      )
      .slice(0, 200);
    const response = await request(state.api, "sync", state.token, {
      usage: pending,
      events,
    });
    state.sentUsage ||= {};
    pending.forEach((u) => {
      state.sentUsage[`${u.day}:${u.itemId}`] = u.seconds;
    });
    state.events = state.events.filter(
      (e) => !events.some((sent) => sent.eventId === e.eventId),
    );
    state.usage = mergeUsage(state.usage, response.usage);
    Object.assign(state, {
      policy: response.policy,
      revision: response.revision,
      webOrigin: response.webOrigin,
      childName: response.childName,
      lastSync: Date.now(),
      lastError: "",
    });
    state.clockWarning =
      Math.abs(Date.now() - Date.parse(response.serverTime)) > 60000;
    if (!state.clockWarning) state.lastNow = Date.now();
  } catch (error) {
    state.lastError = error.message;
    if (error.status === 401 || error.status === 403) {
      state.revoked = true;
      state.leases = {};
    }
  }
  await save(state);
  await rules(state);
  await enforce(state);
}
async function heartbeat(sender) {
  const state = await read();
  if (!state) return { allowed: false, target: blocked };
  const now = safeNow(state);
  const tab = await chrome.tabs.get(sender.tab.id);
  const window = await chrome.windows.get(tab.windowId);
  const decision = decide(state, sender.url, now);
  state.leases ||= {};
  const lease = state.leases[tab.id];
  if (decision.kind === "LEARN") {
    log(state, "LEARN", decision.item.id);
    await save(state);
    return { allowed: true };
  }
  if (!tab.active || !window.focused) return { allowed: false, inactive: true };
  if (
    lease?.until > now &&
    sameUrl(lease.url, sender.url) &&
    lease.revision === state.revision &&
    !state.clockWarning &&
    !state.revoked &&
    state.policy.mode === "WATCH"
  )
    return { allowed: true, expiresAt: lease.until };
  if (!decision.allowed) {
    log(state, decision.item ? "TIME_UP" : "BLOCKED", decision.item?.id);
    await save(state);
    await rules(state);
    const target = decision.target || blocked;
    await chrome.tabs.update(tab.id, { url: target });
    return { allowed: false, target };
  }
  const seconds = reserve(state, decision.item, now);
  state.leases[tab.id] = {
    until: now + seconds * 1000,
    url: sender.url,
    revision: state.revision,
  };
  log(state, "WATCH", decision.item.id);
  await save(state); // Persist the charge BEFORE allowing viewing: restart never refunds it.
  return { allowed: true, expiresAt: state.leases[tab.id].until };
}
async function handle(message, sender) {
  const internal =
    sender.id === chrome.runtime.id &&
    sender.url === chrome.runtime.getURL("popup.html");
  const localPage = sender.url === blocked || internal;
  if (message.type === "STATUS" && localPage) {
    const state = await read();
    if (!state) return { paired: false };
    const now = safeNow(state);
    return {
      paired: true,
      childName: state.childName,
      revoked: state.revoked,
      clockWarning: state.clockWarning,
      lastSync: state.lastSync,
      lastError: state.lastError,
      mode: state.policy.mode,
      items: state.policy.items.map((i) => {
        const availability = itemAvailability(state, i, now);
        const decision = decide(state, i.url, now);
        return {
          id: i.id,
          title: i.title,
          status: availability.kind,
          remainingSeconds: availability.remainingSeconds,
          watchUrl:
            decision.allowed && decision.kind === "WATCH" ? i.url : null,
          learningUrl: learningTarget(state.policy, i),
        };
      }),
    };
  }
  if (message.type === "PAIR" && internal) {
    if ((await read())?.token)
      throw new Error("Thiết bị đã ghép. Phụ huynh quản lý tại website.");
    const url = new URL(message.api);
    if (
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname !== "/" ||
      (url.protocol !== "https:" &&
        !(
          url.protocol === "http:" &&
          ["localhost", "127.0.0.1"].includes(url.hostname)
        ))
    )
      throw new Error("API phải dùng HTTPS (hoặc localhost để chạy thử)");
    const response = await request(url.origin, "pair", null, {
      code: message.code.trim(),
      name: message.name.trim(),
    });
    const state = {
      ...response,
      api: url.origin,
      usage: response.usage || [],
      events: [],
      leases: {},
      lastNow: Date.now(),
      lastSync: Date.now(),
    };
    await save(state);
    await rules(state);
    await enforce(state);
    return { paired: true };
  }
  if (message.type === "SYNC" && localPage) {
    await sync();
    return { ok: true };
  }
  if (message.type === "HEARTBEAT" && sender.tab && sender.frameId === 0)
    return heartbeat(sender);
  if (message.type === "LEARNING" && sender.tab && sender.frameId === 0) {
    const state = await read();
    const url = new URL(sender.url);
    if (
      !state ||
      url.origin !== state.webOrigin ||
      url.pathname !== "/kid-learning" ||
      !decide(state, sender.url, safeNow(state)).allowed
    )
      throw new Error("Trang học không được phép");
    const itemId = url.searchParams.get("item");
    if (!state.policy.items.some((i) => i.id === itemId))
      throw new Error("Nội dung không được phép");
    const action = message.action;
    if (!["lesson", "chat", "attempt"].includes(action))
      throw new Error("Thao tác không được phép");
    return request(
      state.api,
      `learning/${itemId}${action === "lesson" ? "" : "/" + action}`,
      state.token,
      action === "lesson" ? undefined : message.body,
    );
  }
  throw new Error("Yêu cầu không được phép");
}
chrome.runtime.onMessage.addListener((message, sender, respond) => {
  serial(() => handle(message, sender)).then(
    (data) => respond({ ok: true, data }),
    (error) => respond({ ok: false, error: error.message }),
  );
  return true;
});
async function boot() {
  await chrome.storage.local.setAccessLevel({
    accessLevel: "TRUSTED_CONTEXTS",
  });
  await chrome.alarms.create("sync", { periodInMinutes: 0.5 });
  const state = await read();
  if (state) {
    state.leases = {};
    await save(state);
  }
  await rules(state);
  await enforce(state);
  await sync();
}
chrome.runtime.onInstalled.addListener(() => void serial(boot));
chrome.runtime.onStartup.addListener(() => void serial(boot));
chrome.alarms.onAlarm.addListener(() => void serial(sync));
chrome.webNavigation.onHistoryStateUpdated.addListener((info) => {
  if (info.frameId === 0) void serial(async () => enforce(await read()));
});
chrome.webNavigation.onCommitted.addListener((info) => {
  if (info.frameId === 0) void serial(async () => enforce(await read()));
});
chrome.tabs.onRemoved.addListener(
  (id) =>
    void serial(async () => {
      const state = await read();
      if (state?.leases) {
        delete state.leases[id];
        await save(state);
      }
    }),
);
