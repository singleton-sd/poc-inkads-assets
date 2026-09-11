#!/usr/bin/env node
/**
 * Regenerate the house-ad QR module SVG.
 *
 * Target URL is intentionally only in this script + README — never as visible
 * text or comments inside SVG files (assertSvgSafe rejects https?: / //).
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src/marketing/house-ad/qr-go.svg");

/** Stable marketing redirect; final destination is configured on the marketing /go route. */
export const HOUSE_AD_QR_TARGET = "https://inkads.poc.singletonsd.com/go";

const SIZE_PX = 260;
const MARGIN_MODULES = 4;

export async function generateHouseAdQr({
  target = HOUSE_AD_QR_TARGET,
  outPath = OUT,
} = {}) {
  const svg = await QRCode.toString(target, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: MARGIN_MODULES,
    width: SIZE_PX,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, `${svg.trim()}\n`);
  return { outPath, target, sizePx: SIZE_PX, marginModules: MARGIN_MODULES };
}

const isMain =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  const result = await generateHouseAdQr();
  console.log(
    `wrote ${result.outPath} (${result.sizePx}px, margin ${result.marginModules} modules)`,
  );
}
