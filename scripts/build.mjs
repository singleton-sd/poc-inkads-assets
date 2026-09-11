#!/usr/bin/env node
import { createHash } from "node:crypto";
import {
  cp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import toIco from "to-ico";
import { renderHouseAd } from "./render-house-ad.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const SRC = join(ROOT, "src");

const ICON_SIZES = [16, 32, 48, 64, 128, 180, 192, 256, 512];
const CI = process.env.CI === "true";
const LOCKUP_WIDTHS = CI ? [640, 1280] : [640, 1280, 2560];

async function ensureDir(p) {
  await mkdir(p, { recursive: true });
}

async function writePng(pipeline, path) {
  await ensureDir(dirname(path));
  await pipeline.png().toFile(path);
}

function resizeSvg(svgBuf, size) {
  return sharp(svgBuf).resize(size, size, { fit: "contain" });
}

async function buildFavicons(darkSvg, favSvg) {
  const out = join(DIST, "favicons");
  await ensureDir(out);

  const fav16 = await resizeSvg(favSvg, 16).png().toBuffer();
  const fav32 = await resizeSvg(favSvg, 32).png().toBuffer();
  const fav48 = await resizeSvg(darkSvg, 48).png().toBuffer();

  await writeFile(join(out, "favicon-16x16.png"), fav16);
  await writeFile(join(out, "favicon-32x32.png"), fav32);
  await writeFile(join(out, "favicon.ico"), await toIco([fav16, fav32, fav48]));
  await writePng(resizeSvg(darkSvg, 180), join(out, "apple-touch-icon.png"));
  await writePng(resizeSvg(darkSvg, 192), join(out, "android-chrome-192x192.png"));
  await writePng(resizeSvg(darkSvg, 512), join(out, "android-chrome-512x512.png"));

  const product = JSON.parse(
    await readFile(join(ROOT, "config/product.json"), "utf8"),
  );
  const manifest = {
    name: product.name,
    short_name: product.shortName,
    icons: [
      {
        src: "./android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "./android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    theme_color: product.themeColor,
    background_color: product.backgroundColor,
    display: "standalone",
  };
  await writeFile(join(out, "site.webmanifest"), JSON.stringify(manifest, null, 2) + "\n");
}

async function buildStaticMarks() {
  for (const theme of ["dark", "light", "mono"]) {
    const svg = await readFile(join(SRC, "logo/sources", `${theme}.svg`));
    for (const size of ICON_SIZES) {
      await writePng(
        resizeSvg(svg, size),
        join(DIST, "logo/static", theme, `${size}.png`),
      );
    }
    await ensureDir(join(DIST, "logo/static", theme));
    await writeFile(join(DIST, "logo/static", theme, `${theme}.svg`), svg);
  }
}

async function buildWordmarks() {
  const roles = {
    "lockup-horizontal": ["dark", "light", "mono"],
    "lockup-stacked": ["dark", "light"],
    wordmark: ["dark", "light"],
  };

  for (const [role, themes] of Object.entries(roles)) {
    for (const theme of themes) {
      const svgPath = join(SRC, "logo/wordmark/sources", role, `${theme}.svg`);
      const svg = await readFile(svgPath);
      const outDir = join(DIST, "logo/wordmark", role, theme);
      await ensureDir(outDir);
      await writeFile(join(outDir, `${theme}.svg`), svg);

      // Rasterize by width; height follows viewBox aspect via sharp contain.
      for (const width of LOCKUP_WIDTHS) {
        const meta = await sharp(svg).metadata();
        const vb = meta.height && meta.width ? meta.height / meta.width : 72 / 320;
        const height = Math.max(1, Math.round(width * vb));
        await sharp(svg)
          .resize(width, height, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toFile(join(outDir, `${width}.png`));
      }
    }
  }
}

async function copyOg() {
  await cp(join(SRC, "og-image"), join(DIST, "og-image"), { recursive: true });
}

async function copyVectorsToDist() {
  // Pages mirror of vectors (same layout as legacy svg/)
  await cp(join(ROOT, "svg"), join(DIST, "svg"), { recursive: true });
}

async function walkFiles(dir, base = dir, acc = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) await walkFiles(full, base, acc);
    else acc.push(full);
  }
  return acc;
}

async function writeManifest() {
  const files = await walkFiles(DIST);
  const entries = {};
  for (const full of files.sort()) {
    const rel = relative(DIST, full).replaceAll("\\", "/");
    if (rel === "manifest.json" || rel === "index.html") continue;
    const buf = await readFile(full);
    entries[rel] = {
      bytes: buf.length,
      sha256: createHash("sha256").update(buf).digest("hex"),
    };
  }
  await writeFile(
    join(DIST, "manifest.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), files: entries }, null, 2) +
      "\n",
  );
}

async function writeCatalogHtml() {
  const product = JSON.parse(
    await readFile(join(ROOT, "config/product.json"), "utf8"),
  );
  const base = product.publicUrl.replace(/\/$/, "");
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${product.name} brand assets</title>
  <style>
    :root { color-scheme: dark; font-family: system-ui, sans-serif; }
    body { margin: 0; padding: 2rem; background: #0b0b0c; color: #f2f2f2; line-height: 1.5; }
    a { color: #ffb300; }
    code, pre { font-family: ui-monospace, monospace; font-size: 0.9rem; }
    pre { background: #161618; padding: 1rem; overflow: auto; border-radius: 8px; }
    table { border-collapse: collapse; width: 100%; max-width: 52rem; }
    th, td { text-align: left; padding: 0.5rem 0.75rem; border-bottom: 1px solid #2a2a2e; }
    img { max-height: 48px; background: #111; padding: 4px; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>${product.name} assets</h1>
  <p>Parent brand: Singleton SD. Catalog from <code>dist/</code> (omit <code>/dist</code> in URLs).</p>
  <p>Base: <a href="${base}/"><code>${base}</code></a></p>

  <h2>Copy-paste CDN URLs</h2>
  <table>
    <tr><th>Asset</th><th>URL</th></tr>
    <tr><td>Favicon 32</td><td><code>${base}/favicons/favicon-32x32.png</code></td></tr>
    <tr><td>Apple touch</td><td><code>${base}/favicons/apple-touch-icon.png</code></td></tr>
    <tr><td>OG (dark)</td><td><code>${base}/og-image/dark/og-default.png</code></td></tr>
    <tr><td>Nav icon SVG</td><td><code>${base}/svg/icon/icon-dark.svg</code></td></tr>
    <tr><td>Nav lockup SVG</td><td><code>${base}/logo/wordmark/lockup-horizontal/dark/dark.svg</code></td></tr>
    <tr><td>House-ad preview</td><td><code>${base}/marketing/house-ad/preview.png</code></td></tr>
    <tr><td>House-ad framebuffer</td><td><code>${base}/marketing/house-ad/framebuffer.bin</code></td></tr>
    <tr><td>House-ad metadata</td><td><code>${base}/marketing/house-ad/metadata.json</code></td></tr>
  </table>

  <h2>Previews</h2>
  <p><img src="./svg/icon/icon-dark.svg" alt="icon dark" width="48" height="48" />
     <img src="./logo/wordmark/lockup-horizontal/dark/dark.svg" alt="lockup dark" height="40" /></p>
  <p><img src="./marketing/house-ad/preview.png" alt="house-ad 800x480 preview" width="400" height="240" /></p>

  <h2>Legacy jsDelivr</h2>
  <pre>https://cdn.jsdelivr.net/gh/singleton-sd/poc-inkads-assets@&lt;sha&gt;/svg/icon/icon-dark.svg</pre>
  <p>See repo README and <a href="https://github.com/singleton-sd/poc-inkads-assets">GitHub</a>.</p>
</body>
</html>
`;
  await writeFile(join(DIST, "index.html"), html);
}

async function main() {
  await rm(DIST, { recursive: true, force: true });
  await ensureDir(DIST);

  const darkSvg = await readFile(join(SRC, "logo/sources/dark.svg"));
  const favSvg = await readFile(join(SRC, "logo/sources/favicon.svg"));

  await buildFavicons(darkSvg, favSvg);
  await buildStaticMarks();
  await buildWordmarks();
  await copyOg();
  await copyVectorsToDist();
  await renderHouseAd({ outDir: join(DIST, "marketing/house-ad") });
  await writeCatalogHtml();
  const product = JSON.parse(
    await readFile(join(ROOT, "config/product.json"), "utf8"),
  );
  const host = new URL(product.publicUrl).hostname;
  await writeFile(join(DIST, "CNAME"), `${host}\n`);
  await writeManifest();

  const files = await walkFiles(DIST);
  console.log(`build complete -> dist/ (${files.length} files)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
