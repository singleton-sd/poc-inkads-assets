#!/usr/bin/env node
/**
 * Rasterize house-ad SVG → Waveshare 7.5″ B/W package under dist/marketing/house-ad/.
 *
 * Uses @singleton-sd/inkads-epaper-renderer (threshold mode for QR/text/logos).
 * Out of scope: firmware / device serving.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  RENDERER_VERSION,
  packMonoBitmap,
  renderMono,
  toPreviewImage,
  waveshare75BwProfile as profile,
} from "@singleton-sd/inkads-epaper-renderer";
import {
  encodePreviewPng,
  ingestImageToProfile,
} from "@singleton-sd/inkads-epaper-renderer/node";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = join(ROOT, "src/marketing/house-ad");
const DEFAULT_OUT = join(ROOT, "dist/marketing/house-ad");

const MODE = "threshold";
const WIDTH = 800;
const HEIGHT = 480;
const QR_SIZE = 260;
const QR_LEFT = 476;
const QR_TOP = 110;

/**
 * Sharp/librsvg does not reliably resolve relative &lt;image href&gt; from a
 * buffer, so we rasterize the master without the QR image and composite the
 * QR PNG at the design coordinates.
 */
async function rasterizeHouseAdPng() {
  const masterSvg = await readFile(join(SRC_DIR, "house-ad-800x480.svg"), "utf8");
  const qrSvg = await readFile(join(SRC_DIR, "qr-go.svg"));

  const withoutQr = masterSvg.replace(
    /<image\b[^>]*\bhref=["']qr-go\.svg["'][^>]*\/>/i,
    "",
  );

  const basePng = await sharp(Buffer.from(withoutQr, "utf8"))
    .resize(WIDTH, HEIGHT, { fit: "fill" })
    .png()
    .toBuffer();

  const qrPng = await sharp(qrSvg)
    .resize(QR_SIZE, QR_SIZE, { fit: "fill" })
    .png()
    .toBuffer();

  return sharp(basePng)
    .composite([{ input: qrPng, left: QR_LEFT, top: QR_TOP }])
    .png()
    .toBuffer();
}

export async function renderHouseAd({ outDir = DEFAULT_OUT } = {}) {
  const pngBytes = await rasterizeHouseAdPng();
  const rgb = ingestImageToProfile(pngBytes, { profile });
  const bitmap = renderMono(rgb, { mode: MODE });
  const packed = packMonoBitmap(bitmap, { profile });
  const preview = toPreviewImage(packed, profile);
  const previewPng = encodePreviewPng(preview);

  await mkdir(outDir, { recursive: true });

  const framebufferPath = join(outDir, "framebuffer.bin");
  const previewPath = join(outDir, "preview.png");
  const metadataPath = join(outDir, "metadata.json");

  await writeFile(framebufferPath, packed.bytes);
  await writeFile(previewPath, previewPng);

  const metadata = {
    ...packed.metadata,
    mode: MODE,
    rendererVersion: packed.metadata.rendererVersion ?? RENDERER_VERSION,
    source: "src/marketing/house-ad/house-ad-800x480.svg",
    generatedAt: new Date().toISOString(),
  };
  await writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);

  // Publish editable sources next to the package for CDN consumers.
  await writeFile(
    join(outDir, "house-ad-800x480.svg"),
    await readFile(join(SRC_DIR, "house-ad-800x480.svg")),
  );
  await writeFile(join(outDir, "qr-go.svg"), await readFile(join(SRC_DIR, "qr-go.svg")));

  return {
    outDir,
    byteLength: packed.bytes.length,
    checksum: packed.metadata.checksum,
    profileId: packed.metadata.profileId,
    mode: MODE,
    rendererVersion: metadata.rendererVersion,
    paths: {
      framebuffer: framebufferPath,
      preview: previewPath,
      metadata: metadataPath,
    },
  };
}

const isMain =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  const result = await renderHouseAd();
  console.log(
    `house-ad render ok -> ${result.outDir} (${result.byteLength} bytes, ${result.profileId}, checksum ${result.checksum})`,
  );
}
