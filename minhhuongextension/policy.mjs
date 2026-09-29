export function dayAt(now, timezone) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(now));
}
export function inWindow(policy, now) {
  if (!policy.windows.length) return true;
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: policy.timezone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date(now))
      .map((p) => [p.type, p.value]),
  );
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
    parts.weekday,
  );
  const time = `${parts.hour}:${parts.minute}`;
  return policy.windows.some(
    (w) => w.days.includes(day) && time >= w.start && time < w.end,
  );
}
export function sameUrl(a, b) {
  try {
    const left = new URL(a);
    const right = new URL(b);
    left.hash = "";
    right.hash = "";
    return left.href === right.href;
  } catch {
    return false;
  }
}
export function usedFor(usage, day, itemId) {
  return usage.find((u) => u.day === day && u.itemId === itemId)?.seconds || 0;
}
export function remaining(policy, usage, item, now) {
  const day = dayAt(now, policy.timezone);
  const total = usage
    .filter((u) => u.day === day)
    .reduce((n, u) => n + u.seconds, 0);
  return Math.max(
    0,
    Math.min(
      item.minutes * 60 - usedFor(usage, day, item.id),
      policy.dailyMinutes * 60 - total,
    ),
  );
}
export function learningTarget(policy, item) {
  return policy.mode === "EXERCISE_ONLY"
    ? item.learningUrl
    : item.aiUrl || item.learningUrl;
}
export function itemAvailability(state, item, now) {
  if (!state?.policy || state.revoked || state.clockWarning)
    return { kind: "UNAVAILABLE", remainingSeconds: 0 };
  const policy = state.policy;
  const remainingSeconds = remaining(policy, state.usage || [], item, now);
  if (policy.mode === "PAUSED")
    return { kind: "PAUSED", remainingSeconds };
  if (policy.mode === "EXERCISE_ONLY")
    return { kind: "EXERCISE_ONLY", remainingSeconds };
  if (policy.mode !== "WATCH")
    return { kind: "LEARN_ONLY", remainingSeconds };
  if (!inWindow(policy, now))
    return { kind: "OUTSIDE_WINDOW", remainingSeconds };
  if (remainingSeconds <= 0)
    return { kind: "TIME_UP", remainingSeconds: 0 };
  return { kind: "WATCH_AVAILABLE", remainingSeconds };
}
export function decide(state, url, now) {
  if (!state?.policy || state.revoked || state.clockWarning)
    return { allowed: false };
  const policy = state.policy;
  if (policy.mode === "PAUSED") return { allowed: false };
  const lesson = policy.items.find(
    (item) =>
      sameUrl(item.learningUrl, url) ||
      (policy.mode !== "EXERCISE_ONLY" &&
        item.aiUrl &&
        sameUrl(item.aiUrl, url)),
  );
  if (lesson) return { allowed: true, kind: "LEARN", item: lesson };
  const item = policy.items.find((item) => sameUrl(item.url, url));
  if (!item) return { allowed: false };
  const target = learningTarget(policy, item);
  if (
    policy.mode !== "WATCH" ||
    !inWindow(policy, now) ||
    remaining(policy, state.usage, item, now) <= 0
  )
    return { allowed: false, target, item };
  return { allowed: true, kind: "WATCH", item };
}
export function reserve(state, item, now, seconds = 5) {
  const day = dayAt(now, state.policy.timezone);
  const amount = Math.min(
    seconds,
    remaining(state.policy, state.usage, item, now),
  );
  let entry = state.usage.find((u) => u.day === day && u.itemId === item.id);
  if (!entry) {
    entry = { day, itemId: item.id, seconds: 0 };
    state.usage.push(entry);
  }
  entry.seconds += amount;
  return amount;
}
export function mergeUsage(local, remote) {
  const merged = new Map(local.map((u) => [`${u.day}:${u.itemId}`, { ...u }]));
  for (const u of remote) {
    const key = `${u.day}:${u.itemId}`;
    merged.set(key, {
      ...u,
      seconds: Math.max(u.seconds, merged.get(key)?.seconds || 0),
    });
  }
  return [...merged.values()];
}
export function exactRegex(url) {
  return "^" + url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(#.*)?$";
}
