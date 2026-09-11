import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { renderHouseAd } from "./render-house-ad.mjs";

test("renderHouseAd produces Waveshare 7.5 B/W package", async () => {
  const outDir = await mkdtemp(join(tmpdir(), "inkads-house-ad-"));
  try {
    const result = await renderHouseAd({ outDir });

    assert.equal(result.byteLength, 48_000);
    assert.equal(result.profileId, "waveshare-7.5-bw");
    assert.equal(result.mode, "threshold");
    assert.ok(result.checksum && /^[0-9a-f]+$/i.test(result.checksum));

    const packed = await readFile(join(outDir, "framebuffer.bin"));
    assert.equal(packed.length, 48_000);

    const metadata = JSON.parse(
      await readFile(join(outDir, "metadata.json"), "utf8"),
    );
    assert.equal(metadata.profileId, "waveshare-7.5-bw");
    assert.equal(metadata.byteLength, 48_000);
    assert.ok(metadata.checksum);
    assert.equal(metadata.checksum, result.checksum);
    assert.equal(metadata.mode, "threshold");
    assert.ok(metadata.rendererVersion);

    const preview = await readFile(join(outDir, "preview.png"));
    assert.ok(preview.length > 100);
    assert.equal(preview[0], 0x89);
    assert.equal(preview[1], 0x50); // P
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }
});
