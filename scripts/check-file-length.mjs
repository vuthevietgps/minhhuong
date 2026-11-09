#!/usr/bin/env node
// Enforce the file length rule in quytac.md: tracked source files must stay
// at or under MAX_LINES lines. Files that were already longer when the rule
// was introduced are listed in file-length-baseline.json with their line
// count at that time; they may shrink but must never grow, and should be
// split and removed from the baseline over time.
//
// Usage: node scripts/check-file-length.mjs
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const MAX_LINES = 1000;

export const SOURCE_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".css",
  ".scss",
  ".prisma",
  ".ps1",
  ".sh",
  ".py",
];

// Generated or data-only paths that are not written by hand.
export const IGNORED_PATTERNS = [
  /(^|\/)node_modules\//,
  /(^|\/)exports\//,
  /(^|\/)generated\//,
  /(^|\/)_metadata\//,
  /\.d\.ts$/,
  /\.min\.(js|css)$/,
];

export function isCheckedFile(file) {
  const normalized = file.replace(/\\/g, "/");
  return (
    SOURCE_EXTENSIONS.includes(path.extname(normalized)) &&
    !IGNORED_PATTERNS.some((pattern) => pattern.test(normalized))
  );
}

export function countLines(text) {
  if (text.length === 0) {
    return 0;
  }
  const lines = text.split(/\r?\n/).length;
  return text.endsWith("\n") ? lines - 1 : lines;
}

/**
 * @param {{ lengths: Record<string, number>, baseline: Record<string, number>, maxLines?: number }} input
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function checkFileLengths({ lengths, baseline, maxLines = MAX_LINES }) {
  const errors = [];
  const warnings = [];

  for (const [file, lines] of Object.entries(lengths).sort()) {
    if (lines <= maxLines) {
      continue;
    }
    const allowed = baseline[file];
    if (allowed === undefined) {
      errors.push(
        `${file}: ${lines} dong, vuot gioi han ${maxLines} dong. Hay tach file (xem quytac.md muc "Gioi han do dai file").`,
      );
    } else if (lines > allowed) {
      errors.push(
        `${file}: ${lines} dong, tang so voi muc ghi nhan ${allowed} dong trong baseline. File da qua dai thi khong duoc dai them; hay tach file truoc khi them code.`,
      );
    }
  }

  for (const [file, allowed] of Object.entries(baseline).sort()) {
    const lines = lengths[file];
    if (lines === undefined) {
      warnings.push(`${file}: khong con ton tai, hay xoa khoi baseline.`);
    } else if (lines <= maxLines) {
      warnings.push(
        `${file}: con ${lines} dong (<= ${maxLines}), hay xoa khoi baseline.`,
      );
    } else if (lines < allowed) {
      warnings.push(
        `${file}: giam tu ${allowed} xuong ${lines} dong, co the cap nhat baseline.`,
      );
    }
  }

  return { errors, warnings };
}

function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const baselinePath = path.join(root, "scripts", "file-length-baseline.json");
  const baseline = JSON.parse(readFileSync(baselinePath, "utf8")).files;
  const tracked = execFileSync("git", ["ls-files", "-z"], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  })
    .split("\0")
    .filter(Boolean)
    .filter(isCheckedFile);

  const lengths = {};
  for (const file of tracked) {
    try {
      lengths[file] = countLines(readFileSync(path.join(root, file), "utf8"));
    } catch {
      // Deleted in the working tree but still in the index; skip it.
    }
  }

  const { errors, warnings } = checkFileLengths({ lengths, baseline });
  for (const warning of warnings) {
    console.warn(`canh bao: ${warning}`);
  }
  for (const error of errors) {
    console.error(`loi: ${error}`);
  }
  console.log(
    `Da kiem tra ${Object.keys(lengths).length} file, gioi han ${MAX_LINES} dong: ${errors.length} loi, ${warnings.length} canh bao.`,
  );
  if (errors.length > 0) {
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
