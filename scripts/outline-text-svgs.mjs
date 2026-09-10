#!/usr/bin/env node
/**
 * Replace <text> in wordmark/lockup SVGs with outlined <path> using
 * Open Sauce Sans OTFs under fonts/. Run before committing vector masters.
 *
 *   pnpm outline:text
 *   pnpm sync:legacy-svg
 */
import { readFile, writeFile, readdir } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FONTS = join(ROOT, "fonts");
const WORDMARK_ROOT = join(ROOT, "src/logo/wordmark/sources");

const WEIGHT_TO_FONT = {
  500: "OpenSauceSans-Medium.otf",
  600: "OpenSauceSans-SemiBold.otf",
};

/** @type {Map<string, import('opentype.js').Font>} */
const fontCache = new Map();

function loadFont(file) {
  if (!fontCache.has(file)) {
    const buf = readFileSync(join(FONTS, file));
    fontCache.set(file, opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)));
  }
  return fontCache.get(file);
}

/**
 * @param {import('opentype.js').Font} font
 * @param {string} text
 * @param {number} x
 * @param {number} y baseline
 * @param {number} fontSize
 * @param {number} letterSpacing
 */
function textToPathData(font, text, x, y, fontSize, letterSpacing) {
  const scale = (1 / font.unitsPerEm) * fontSize;
  let cursor = x;
  const parts = [];
  for (const ch of text) {
    const glyph = font.charToGlyph(ch);
    const path = glyph.getPath(cursor, y, fontSize);
    const d = path.toPathData(2);
    if (d) parts.push(d);
    cursor += glyph.advanceWidth * scale + letterSpacing;
  }
  return parts.join(" ");
}

/**
 * @param {string} svg
 */
function outlineSvgText(svg) {
  return svg.replace(/<text\b([^>]*)>([^<]*)<\/text>/g, (_full, attrs, content) => {
    const get = (name) => {
      const m = attrs.match(new RegExp(`\\b${name}="([^"]*)"`));
      return m ? m[1] : null;
    };
    const x = Number(get("x") ?? 0);
    const y = Number(get("y") ?? 0);
    const fontSize = Number(get("font-size") ?? 16);
    const weight = Number(get("font-weight") ?? 500);
    const fill = get("fill") ?? "#000000";
    const letterSpacing = Number(get("letter-spacing") ?? 0);
    const fontFile = WEIGHT_TO_FONT[weight] ?? WEIGHT_TO_FONT[500];
    const font = loadFont(fontFile);
    const d = textToPathData(font, content, x, y, fontSize, letterSpacing);
    return `<path d="${d}" fill="${fill}"/>`;
  });
}

async function walkSvgs(dir, acc = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) await walkSvgs(full, acc);
    else if (e.name.endsWith(".svg")) acc.push(full);
  }
  return acc;
}

async function main() {
  const files = await walkSvgs(WORDMARK_ROOT);
  let changed = 0;
  for (const file of files) {
    const before = await readFile(file, "utf8");
    if (!/<text\b/.test(before)) continue;
    const after = outlineSvgText(before);
    if (after === before) continue;
    if (/<text\b/.test(after)) {
      throw new Error(`failed to outline all text in ${file}`);
    }
    await writeFile(file, after);
    changed += 1;
    console.log("outlined", file.replace(ROOT + "/", ""));
  }
  console.log(`outline complete (${changed} files)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
