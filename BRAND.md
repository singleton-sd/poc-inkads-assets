# Brand assets — InkAds

Source of truth for **InkAds logo / favicon / OG binaries** is this package
(`@singleton-sd/inkads-assets`). Parent brand: [Singleton SD](https://singletonsd.com).

Public catalog: [assets.inkads.poc.singletonsd.com](https://assets.inkads.poc.singletonsd.com)
(`config/product.json` → `publicUrl`).

Token **values** should align with `@singleton-sd/tokens` semantic yellows/grays
when the product adopts the design-system package; until then the hex values in
`meta.json` are authoritative for these masters.

## Formats

- **SVG** — preferred for web UI. Masters live under `src/`.
- **PNG** — favicons, app icons, lockup rasters, OG cards. Generated into `dist/` by `npm run build`.

## Roles (design doc 3a–3e)

| Role | Path | Typical use |
| --- | --- | --- |
| Icon (3a) | `src/logo/sources/{dark,light,mono,favicon}.svg` | Nav mark, app icon, e-paper mono |
| Horizontal lockup (3b) | `src/logo/wordmark/sources/lockup-horizontal/` | Headers / wide UI |
| Stacked lockup (3c) | `src/logo/wordmark/sources/lockup-stacked/` | Centered / square |
| Wordmark (3d) | `src/logo/wordmark/sources/wordmark/` | Text + refresh lines only |
| Mono (3e) | `*-mono.svg` themes | E-paper / single-ink |

## Usage

- Do not stretch. Keep aspect ratio.
- Clear space ≈ mark height.
- Yellow-dark (`#FFB300`) on black; yellow-light (`#C89200`) on white.
- Use `favicon` / 16px simplified mark for browser favicons.
- Lockup SVGs still contain `<text>` (Open Sauce Sans). Browsers render them;
  CI PNG rasterization may fall back to a system font until text is outlined.

## Layout

```text
src/logo/sources/                 # icon masters
src/logo/wordmark/sources/…       # lockups + wordmark
src/og-image/{dark,light}/        # 1200×630 social cards
svg/                              # legacy jsDelivr paths (synced from src)
dist/                             # build output (Pages CDN) — do not edit
```

## Related

- Blueprint: GitLab `@singleton-sd/assets`
- Consumer: [poc-inkads-marketing](https://github.com/singleton-sd/poc-inkads-marketing)
