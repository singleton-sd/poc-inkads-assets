#!/usr/bin/env node
import { access, readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { syncLegacySvg } from "./sync-legacy-svg.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

function assertSvgSafe(svg, path) {
  if (!/viewBox\s*=/.test(svg)) {
    throw new Error(`${path}: missing viewBox`);
  }
  if (/<script/i.test(svg) || /\son[a-z]+\s*=/i.test(svg)) {
    throw new Error(`${path}: scripts / event handlers are not allowed`);
  }
  // Strip approved W3C xmlns declarations, then reject any remaining absolute
  // or scheme-relative URLs (e.g. external <image href="https://…">).
  const stripped = svg.replace(
    /\s+xmlns(?::[\w-]+)?\s*=\s*(["'])https?:\/\/www\.w3\.org[^"']*\1/gi,
    "",
  );
  if (/(?:https?:)?\/\//i.test(stripped)) {
    throw new Error(`${path}: external URLs are not allowed`);
  }
}

export { assertSvgSafe };

const MARK_THEMES = ["dark", "light", "mono", "favicon"];

const WORDMARKS = {
  "lockup-horizontal": ["dark", "light", "mono"],
  "lockup-stacked": ["dark", "light"],
  wordmark: ["dark", "light"],
};

export async function validateAssets() {
  const errors = [];

  for (const name of ["meta.json", "config/product.json", "BRAND.md", "AGENTS.md"]) {
    if (!(await exists(join(ROOT, name)))) errors.push(`missing ${name}`);
  }

  for (const theme of MARK_THEMES) {
    const path = `src/logo/sources/${theme}.svg`;
    const full = join(ROOT, path);
    if (!(await exists(full))) {
      errors.push(`missing ${path}`);
      continue;
    }
    try {
      assertSvgSafe(await readFile(full, "utf8"), path);
    } catch (e) {
      errors.push(e.message);
    }
  }

  for (const [role, themes] of Object.entries(WORDMARKS)) {
    for (const theme of themes) {
      const path = `src/logo/wordmark/sources/${role}/${theme}.svg`;
      const full = join(ROOT, path);
      if (!(await exists(full))) {
        errors.push(`missing ${path}`);
        continue;
      }
      try {
        const svg = await readFile(full, "utf8");
        assertSvgSafe(svg, path);
        if (/<text\b/i.test(svg)) {
          errors.push(`${path}: outline <text> to paths (pnpm outline:text)`);
        }
      } catch (e) {
        errors.push(e.message);
      }
    }
  }

  for (const theme of ["dark", "light"]) {
    const path = `src/og-image/${theme}/og-default.png`;
    if (!(await exists(join(ROOT, path)))) errors.push(`missing ${path}`);
  }

  for (const dir of [
    "src/email",
    "src/documents",
    "src/illustrations",
    "src/screenshots",
    "src/marketing",
  ]) {
    if (!(await exists(join(ROOT, dir)))) errors.push(`missing ${dir}/`);
  }

  const product = JSON.parse(await readFile(join(ROOT, "config/product.json"), "utf8"));
  if (!product.publicUrl || !/^https:\/\//.test(product.publicUrl)) {
    errors.push("config/product.json publicUrl must be an https URL");
  }

  const mismatches = await syncLegacySvg({ checkOnly: true });
  for (const m of mismatches) errors.push(`legacy svg out of sync: ${m}`);

  return errors;
}

const isMain =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  const errors = await validateAssets();
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exit(1);
  }
  console.log("assets validate ok");
}
