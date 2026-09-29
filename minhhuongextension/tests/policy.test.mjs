import test from "node:test";
import assert from "node:assert/strict";
import {
  dayAt,
  decide,
  exactRegex,
  inWindow,
  mergeUsage,
  remaining,
  reserve,
} from "../policy.mjs";

const now = Date.parse("2026-09-19T10:00:00Z");
const item = {
  id: "one",
  url: "https://www.youtube.com/watch?v=abc",
  learningUrl: "https://school.test/kid-learning?item=one",
  aiUrl: "https://ai.test/c/one",
  minutes: 1,
};
const fixture = () => ({
  policy: {
    mode: "WATCH",
    timezone: "Asia/Ho_Chi_Minh",
    dailyMinutes: 2,
    windows: [],
    items: [item],
  },
  usage: [],
});
test("deny by default, including unpaired, unknown URL, lookalike host, extra query and alternate video", () => {
  assert.equal(decide(null, item.url, now).allowed, false);
  for (const url of [
    "https://evil.test",
    item.url + "&v=evil",
    item.url + "&list=playlist",
    "https://www.youtube.com.evil.test/watch?v=abc",
    "https://www.youtube.com/watch?v=xyz",
  ])
    assert.equal(decide(fixture(), url, now).allowed, false);
  assert.equal(decide(fixture(), item.url, now).allowed, true);
  assert.equal(decide(fixture(), item.url + "#t=2", now).allowed, true);
});
test("exhausted item goes to its own AI, never another video", () => {
  const state = fixture();
  reserve(state, item, now, 60);
  assert.equal(decide(state, item.url, now).target, item.aiUrl);
  assert.equal(decide(state, item.learningUrl, now).allowed, true);
});
test("daily budget includes removed videos and all concurrent tabs", () => {
  const state = fixture();
  state.usage.push({
    day: dayAt(now, state.policy.timezone),
    itemId: "removed",
    seconds: 118,
  });
  assert.equal(reserve(state, item, now), 2);
  assert.equal(reserve(state, item, now), 0);
});
test("persistent prepaid usage survives serialization, restarts and policy edits", () => {
  const state = fixture();
  reserve(state, item, now, 5);
  const restarted = JSON.parse(JSON.stringify(state));
  assert.equal(remaining(restarted.policy, restarted.usage, item, now), 55);
  restarted.policy.mode = "LEARN_ONLY";
  restarted.policy.mode = "WATCH";
  assert.equal(remaining(restarted.policy, restarted.usage, item, now), 55);
});
test("schedule uses selected timezone, inclusive start and exclusive end", () => {
  const state = fixture();
  state.policy.windows = [{ days: [6], start: "17:00", end: "18:00" }];
  assert.equal(inWindow(state.policy, now), true);
  assert.equal(inWindow(state.policy, now - 1), false);
  assert.equal(inWindow(state.policy, now + 3600000), false);
  assert.equal(decide(state, item.url, now - 1).target, item.aiUrl);
});
test("only the configured local midnight renews a daily allowance", () => {
  const state = fixture();
  reserve(state, item, now, 60);
  assert.equal(
    remaining(
      state.policy,
      state.usage,
      item,
      Date.parse("2026-09-19T16:59:59Z"),
    ),
    0,
  );
  assert.equal(
    remaining(
      state.policy,
      state.usage,
      item,
      Date.parse("2026-09-19T17:00:00Z"),
    ),
    60,
  );
});
test("learn only, exercise only, pause, clock warning and revocation are enforced", () => {
  const state = fixture();
  state.policy.mode = "LEARN_ONLY";
  assert.equal(decide(state, item.url, now).allowed, false);
  assert.equal(decide(state, item.aiUrl, now).allowed, true);
  state.policy.mode = "EXERCISE_ONLY";
  assert.equal(decide(state, item.aiUrl, now).allowed, false);
  assert.equal(decide(state, item.url, now).target, item.learningUrl);
  state.policy.mode = "PAUSED";
  assert.equal(decide(state, item.learningUrl, now).allowed, false);
  state.policy.mode = "WATCH";
  state.revoked = true;
  assert.equal(decide(state, item.url, now).allowed, false);
  state.revoked = false;
  state.clockWarning = true;
  assert.equal(decide(state, item.url, now).allowed, false);
});
test("sync replay can only increase usage and never erase an unsent day", () => {
  const local = [
    { day: "2026-09-19", itemId: "a", seconds: 25 },
    { day: "2026-09-18", itemId: "b", seconds: 10 },
  ];
  const merged = mergeUsage(local, [
    { day: "2026-09-19", itemId: "a", seconds: 5 },
  ]);
  assert.deepEqual(merged, local);
  assert.equal(
    mergeUsage(merged, [{ day: "2026-09-19", itemId: "a", seconds: 60 }])[0]
      .seconds,
    60,
  );
});
test("DNR regex escapes query metacharacters and is anchored", () => {
  const regex = new RegExp(exactRegex("https://school.test/watch?v=a.b+c&x=1"));
  assert.equal(regex.test("https://school.test/watch?v=a.b+c&x=1"), true);
  assert.equal(regex.test("https://schoolXtest/watch?v=aZbbbbc&x=1"), false);
  assert.equal(
    regex.test("https://school.test/watch?v=a.b+c&x=1&other=2"),
    false,
  );
});
