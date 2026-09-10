import assert from "node:assert/strict";
import { test } from "node:test";
import { assertSvgSafe, validateAssets } from "../scripts/validate-assets.mjs";
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

test("assertSvgSafe rejects external href even with xmlns", () => {
  const evil = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
  <image href="https://attacker.example/x.png"/>
</svg>`;
  assert.throws(
    () => assertSvgSafe(evil, "fixture.svg"),
    /external URLs are not allowed/,
  );
});

test("assertSvgSafe allows W3C xmlns without other URLs", () => {
  const ok = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
  <rect width="10" height="10"/>
</svg>`;
  assert.doesNotThrow(() => assertSvgSafe(ok, "fixture.svg"));
});
