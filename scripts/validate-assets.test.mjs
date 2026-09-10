import assert from "node:assert/strict";
import { test } from "node:test";
import { validateAssets } from "../scripts/validate-assets.mjs";
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

test("validateAssets reports no errors on current tree", async () => {
  const errors = await validateAssets();
  assert.deepEqual(errors, []);
});

test("product publicUrl is the assets CDN host", async () => {
  const product = JSON.parse(
    await readFile(join(ROOT, "config/product.json"), "utf8"),
  );
  assert.equal(product.publicUrl, "https://assets.inkads.poc.singletonsd.com");
  assert.match(product.id, /inkads/i);
});

test("meta.json declares mono theme for e-paper", async () => {
  const meta = JSON.parse(await readFile(join(ROOT, "meta.json"), "utf8"));
  assert.ok(meta.themes.includes("mono"));
  assert.ok(meta.roles.includes("lockup-horizontal"));
});
