#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import toIco from 'to-ico';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SVG = join(ROOT, 'svg');
const PNG = join(ROOT, 'png');

const ICON_SIZES = [16, 32, 48, 64, 128, 180, 192, 256, 512, 1024];

async function ensureDir(p) {
  await mkdir(p, { recursive: true });
}

async function readSvg(...parts) {
  return readFile(join(SVG, ...parts), 'utf8');
}

async function iconPng(svg, size, { bg = null, padding = 0 } = {}) {
  const inner = Math.round(size * (1 - padding * 2));
  let icon = sharp(Buffer.from(svg)).resize(inner, inner, { fit: 'contain' });
  if (!bg && padding === 0) return icon.png();
  const iconBuf = await icon.png().toBuffer();
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: bg ?? { r: 0, g: 0, b: 0, alpha: 0 },
    },
  }).composite([{ input: iconBuf, gravity: 'centre' }]).png();
}

async function writeFileFromPipeline(pipeline, path) {
  await ensureDir(dirname(path));
  await pipeline.toFile(path);
}

async function exportIcons() {
  const variants = {
    dark: await readSvg('icon', 'icon-dark.svg'),
    light: await readSvg('icon', 'icon-light.svg'),
    mono: await readSvg('icon', 'icon-mono.svg'),
    favicon: await readSvg('icon', 'icon-favicon.svg'),
  };

  for (const [name, svg] of Object.entries(variants)) {
    if (name === 'favicon') {
      for (const size of [16, 32]) {
        await writeFileFromPipeline(await iconPng(svg, size), join(PNG, 'icon', name, `${size}x${size}.png`));
      }
      continue;
    }
    for (const size of ICON_SIZES) {
      await writeFileFromPipeline(await iconPng(svg, size), join(PNG, 'icon', name, `${size}x${size}.png`));
    }
  }

  for (const [theme, svgName, bg] of [
    ['on-black', 'dark', '#000000'],
    ['on-white', 'light', '#FFFFFF'],
  ]) {
    for (const size of ICON_SIZES) {
      await writeFileFromPipeline(
        await iconPng(variants[svgName], size, { bg, padding: 0.18 }),
        join(PNG, 'app-icon', theme, `${size}x${size}.png`)
      );
    }
  }

  const fav16 = await iconPng(variants.favicon, 16).then((p) => p.toBuffer());
  const fav32 = await iconPng(variants.favicon, 32).then((p) => p.toBuffer());
  const fav48 = await iconPng(variants.dark, 48).then((p) => p.toBuffer());
  const ico = await toIco([fav16, fav32, fav48]);

  const webDir = join(PNG, 'web');
  await ensureDir(webDir);
  await writeFile(join(webDir, 'favicon.ico'), ico);
  await writeFileFromPipeline(await iconPng(variants.favicon, 16), join(webDir, 'favicon-16x16.png'));
  await writeFileFromPipeline(await iconPng(variants.favicon, 32), join(webDir, 'favicon-32x32.png'));
  await writeFileFromPipeline(await iconPng(variants.dark, 180), join(webDir, 'apple-touch-icon.png'));
  await writeFileFromPipeline(await iconPng(variants.dark, 192), join(webDir, 'icon-192.png'));
  await writeFileFromPipeline(await iconPng(variants.dark, 512), join(webDir, 'icon-512.png'));
}

async function main() {
  await exportIcons();
  console.log('PNG export complete -> brand-export/png/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
