import assert from "node:assert/strict";
import test from "node:test";
import {
  checkFileLengths,
  countLines,
  isCheckedFile,
} from "./check-file-length.mjs";

test("countLines matches wc -l for text with and without a final newline", () => {
  assert.equal(countLines(""), 0);
  assert.equal(countLines("a"), 1);
  assert.equal(countLines("a\n"), 1);
  assert.equal(countLines("a\r\nb\r\n"), 2);
  assert.equal(countLines("a\nb"), 2);
});

test("isCheckedFile covers source files and skips generated data", () => {
  assert.equal(isCheckedFile("apps/api/src/auth/auth.service.ts"), true);
  assert.equal(isCheckedFile("apps/web/src/app/page.tsx"), true);
  assert.equal(isCheckedFile("apps/api/prisma/schema.prisma"), true);
  assert.equal(isCheckedFile("README.md"), false);
  assert.equal(isCheckedFile("apps/api/exports/report.json"), false);
  assert.equal(isCheckedFile("apps/api/src/types.d.ts"), false);
  assert.equal(isCheckedFile("apps/web/node_modules/x/index.js"), false);
});

test("a new file over the limit is an error", () => {
  const result = checkFileLengths({
    lengths: { "a.ts": 1001, "b.ts": 1000 },
    baseline: {},
  });
  assert.equal(result.errors.length, 1);
  assert.match(result.errors[0], /^a\.ts: 1001 dong/);
});

test("a baseline file may stay or shrink but not grow", () => {
  const baseline = { "big.ts": 1500 };
  assert.deepEqual(
    checkFileLengths({ lengths: { "big.ts": 1500 }, baseline }).errors,
    [],
  );
  const shrunk = checkFileLengths({ lengths: { "big.ts": 1400 }, baseline });
  assert.deepEqual(shrunk.errors, []);
  assert.equal(shrunk.warnings.length, 1);
  const grown = checkFileLengths({ lengths: { "big.ts": 1501 }, baseline });
  assert.equal(grown.errors.length, 1);
  assert.match(grown.errors[0], /tang so voi muc ghi nhan 1500/);
});

test("baseline entries that are split or deleted only warn", () => {
  const result = checkFileLengths({
    lengths: { "split.ts": 300 },
    baseline: { "split.ts": 1500, "gone.ts": 2000 },
  });
  assert.deepEqual(result.errors, []);
  assert.equal(result.warnings.length, 2);
});
