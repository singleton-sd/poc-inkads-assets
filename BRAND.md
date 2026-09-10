# Brand assets — InkAds

Source of truth for **InkAds logo / favicon / OG binaries** is this package
(`@singleton-sd/inkads-assets`). Parent brand: [Singleton SD](https://singletonsd.com).

Public catalog: [assets.inkads.poc.singletonsd.com](https://assets.inkads.poc.singletonsd.com)
(`config/product.json` → `publicUrl`).

## Colors ↔ `@singleton-sd/tokens`

Authoritative semantic package: **`@singleton-sd/tokens@1.5.0`**
(source: [design-system/tokens](https://gitlab.com/singleton-sd/design-system/tokens)).
That package is private; InkAds SVG masters **do not** import it at build or
runtime. Hex values below are baked into masters; token ids keep marketing /
CSS / firmware in sync when those surfaces use the design-system package.

| Master key (`meta.json`) | Hex | Token id | CSS var | Use |
| --- | --- | --- | --- | --- |
| `yellowDark500` | `#FFB300` | `yellow-dark-500` | `--ssd-color-yellow-dark-500` | Mark on black / dark UI |
| `yellowLight500` | `#C89200` | `yellow-light-500` | `--ssd-color-yellow-light-500` | Mark on white / light UI |
| `gray500` | `#7F848A` | `gray-600` | `--ssd-color-gray-600` | Secondary bars / byline (legacy key name; not `gray-500`) |
| `gray300` | `#C9CCD1` | `gray-300` | `--ssd-color-gray-300` | Muted accents on light |
| `black` | `#000000` | `black` | `--ssd-color-black` | Dark ground / mono ink |
| `white` | `#FFFFFF` | `white` | `--ssd-color-white` | Light ground / mono paper |

When bumping alignment, compare hex against `@singleton-sd/tokens` core
colors and update both this table and `meta.json` → `tokens.version`.

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
| Mono (3e) | `src/logo/sources/mono.svg` and `src/logo/wordmark/sources/lockup-horizontal/mono.svg` | E-paper / single-ink |

## Usage

- Do not stretch. Keep aspect ratio.
- Clear space ≈ mark height.
- Yellow-dark (`yellow-dark-500` / `#FFB300`) on black; yellow-light
  (`yellow-light-500` / `#C89200`) on white.
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
- Tokens: `@singleton-sd/tokens` (GitLab design-system/tokens)
