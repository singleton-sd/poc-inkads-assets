#!/usr/bin/env node
/**
 * Mirror src/ logo SVGs into root svg/ for jsDelivr / marketing pin paths.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** @type {Array<[string, string]>} */
const MAP = [
  ["src/logo/sources/dark.svg", "svg/icon/icon-dark.svg"],
  ["src/logo/sources/light.svg", "svg/icon/icon-light.svg"],
  ["src/logo/sources/mono.svg", "svg/icon/icon-mono.svg"],
  ["src/logo/sources/favicon.svg", "svg/icon/icon-favicon.svg"],
  [
    "src/logo/wordmark/sources/lockup-horizontal/dark.svg",
    "svg/lockup-horizontal/lockup-horizontal-dark.svg",
  ],
  [
    "src/logo/wordmark/sources/lockup-horizontal/light.svg",
    "svg/lockup-horizontal/lockup-horizontal-light.svg",
  ],
  [
    "src/logo/wordmark/sources/lockup-horizontal/mono.svg",
    "svg/lockup-horizontal/lockup-horizontal-mono.svg",
  ],
  [
    "src/logo/wordmark/sources/lockup-stacked/dark.svg",
    "svg/lockup-stacked/lockup-stacked-dark.svg",
  ],
  [
    "src/logo/wordmark/sources/lockup-stacked/light.svg",
    "svg/lockup-stacked/lockup-stacked-light.svg",
  ],
  [
    "src/logo/wordmark/sources/wordmark/dark.svg",
    "svg/wordmark/wordmark-dark.svg",
  ],
  [
    "src/logo/wordmark/sources/wordmark/light.svg",
    "svg/wordmark/wordmark-light.svg",
  ],
];

export async function syncLegacySvg({ checkOnly = false } = {}) {
  const mismatches = [];
  for (const [from, to] of MAP) {
    const src = await readFile(join(ROOT, from), "utf8");
    const destPath = join(ROOT, to);
    if (checkOnly) {
      let dest;
      try {
        dest = await readFile(destPath, "utf8");
      } catch {
        mismatches.push(to);
        continue;
      }
      if (dest !== src) mismatches.push(to);
      continue;
    }
    await mkdir(dirname(destPath), { recursive: true });
    await writeFile(destPath, src);
  }
  return mismatches;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  const checkOnly = process.argv.includes("--check");
  const mismatches = await syncLegacySvg({ checkOnly });
  if (checkOnly) {
    if (mismatches.length) {
      console.error("legacy svg/ out of sync with src/:\n" + mismatches.join("\n"));
      process.exit(1);
    }
    console.log("legacy svg/ matches src/");
  } else {
    console.log(`synced ${MAP.length} files -> svg/`);
  }
}
