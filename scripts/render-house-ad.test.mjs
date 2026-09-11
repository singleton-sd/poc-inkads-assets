import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import jsQR from "jsqr";
import sharp from "sharp";
import { HOUSE_AD_QR_TARGET } from "./generate-house-ad-qr.mjs";
import { renderHouseAd } from "./render-house-ad.mjs";

const WIDTH = 800;
const HEIGHT = 480;
const QR_SIZE = 260;
const QR_LEFT = 476;
const QR_TOP = 110;

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

    const meta = await sharp(preview).metadata();
    assert.equal(meta.width, WIDTH);
    assert.equal(meta.height, HEIGHT);

    const { data, info } = await sharp(preview)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    assert.equal(info.width, WIDTH);
    assert.equal(info.height, HEIGHT);
    assert.equal(info.channels, 4);

    let black = 0;
    let white = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      assert.equal(r, g);
      assert.equal(g, b);
      assert.ok(r === 0 || r === 255, `non-monochrome pixel ${r}`);
      if (r === 0) black += 1;
      else white += 1;
    }
    assert.ok(black > 0, "preview should contain black pixels");
    assert.ok(white > 0, "preview should contain white pixels");

    const qrRgba = await sharp(preview)
      .extract({ left: QR_LEFT, top: QR_TOP, width: QR_SIZE, height: QR_SIZE })
      .ensureAlpha()
      .raw()
      .toBuffer();
    const decoded = jsQR(
      new Uint8ClampedArray(qrRgba.buffer, qrRgba.byteOffset, qrRgba.byteLength),
      QR_SIZE,
      QR_SIZE,
    );
    assert.ok(decoded, "QR region should decode");
    assert.equal(decoded.data, HOUSE_AD_QR_TARGET);
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }
});
