# InkAds brand assets

SVG masters and generated favicons / PNGs / OG cards for the **InkAds** product
mark. Parent brand: [Singleton SD](https://singletonsd.com).

Design source: recommended system **3a** (icon) + **3b** (horizontal lockup).
See [BRAND.md](BRAND.md) and `meta.json`.

Package: [`@singleton-sd/inkads-assets`](https://www.npmjs.com/package/@singleton-sd/inkads-assets)
(Trusted Publishing / OIDC from GitHub Actions). **Pages CDN is still primary**
for HTML consumers; npm ships a versioned `dist/` + masters for apps.

```sh
pnpm add @singleton-sd/inkads-assets
```

## Copy-paste CDN URLs (GitHub Pages)

`dist/` is served at site root (omit `/dist`):

Base: **https://assets.inkads.poc.singletonsd.com**

| Asset | URL |
| --- | --- |
| Favicon 32 | `…/favicons/favicon-32x32.png` |
| Apple touch | `…/favicons/apple-touch-icon.png` |
| Web manifest | `…/favicons/site.webmanifest` |
| OG (dark) | `…/og-image/dark/og-default.png` |
| Icon SVG (nav) | `…/svg/icon/icon-dark.svg` |
| Lockup SVG (nav) | `…/logo/wordmark/lockup-horizontal/dark/dark.svg` |
| Icon PNG 512 | `…/logo/static/dark/512.png` |
| House-ad preview | `…/marketing/house-ad/preview.png` |
| House-ad framebuffer | `…/marketing/house-ad/framebuffer.bin` |
| House-ad metadata | `…/marketing/house-ad/metadata.json` |

DNS + Pages setup: [`docs/deployment.md`](docs/deployment.md).

House-ad Waveshare package (POC-260): [`src/marketing/house-ad/README.md`](src/marketing/house-ad/README.md).

Firmware / e-paper / on-device UI: [`docs/firmware-consume.md`](docs/firmware-consume.md)
(mono SVG/PNG, favicons, pin strategy).

## Legacy jsDelivr (pinned commit)

Marketing and other consumers may still load vectors from a **pinned SHA**
(not `@main`):

```text
https://cdn.jsdelivr.net/gh/singleton-sd/poc-inkads-assets@<sha>/svg/<group>/<file>
```

Root `svg/` is kept in sync with `src/` via `npm run sync:legacy-svg`.

Example icon:

`https://cdn.jsdelivr.net/gh/singleton-sd/poc-inkads-assets@040d0a0d8e34653b780c0e807867c34c77b07e29/svg/icon/icon-dark.svg`

## Develop

```sh
pnpm install
pnpm validate
pnpm test
pnpm build   # writes dist/ (gitignored)
```

Requires Node 22 (`.nvmrc`) and pnpm 11 (`packageManager` field).

Release (CI only): `pnpm release:ci` via `.github/workflows/release.yml`.
Local dry-run: `pnpm release`.

## Layout

```text
src/                 # masters (edit here)
svg/                 # legacy CDN mirror of vectors
scripts/             # validate + build
dist/                # generated — Pages publishes this
config/product.json  # publicUrl + identity
meta.json            # inventory contract
```

## Related

- Issue [#6](https://github.com/singleton-sd/poc-inkads-assets/issues/6) — firmware / device consume docs
- [poc-inkads-marketing](https://github.com/singleton-sd/poc-inkads-marketing)
- [poc-inkads-firmware-display-device](https://github.com/singleton-sd/poc-inkads-firmware-display-device)
- Blueprint: GitLab `@singleton-sd/assets`
- Workflow: [docs/logo-asset-workflow.md](docs/logo-asset-workflow.md)
- Firmware contract: [docs/firmware-consume.md](docs/firmware-consume.md)
