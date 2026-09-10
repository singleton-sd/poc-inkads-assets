# Firmware / device UI — consume brand assets

Contract for [poc-inkads-firmware-display-device](https://github.com/singleton-sd/poc-inkads-firmware-display-device)
and any on-device UI that needs InkAds marks (e-paper chrome, captive portal,
admin shell). **This repo owns binaries;** firmware owns packing into the
display framebuffer and embedding HTML/CSS.

## Runtime policy

Firmware today compiles HTML, CSS, and design tokens into the binary and
**does not fetch internet-hosted assets at runtime**. Prefer that model on
device (offline, captive portal, TLS admin).

Use this catalog when:

- A **host build / CI / renderer** step needs mono SVG or PNG to convert into a
  packed e-paper buffer.
- A future surface opts into CDN (document the pin below before shipping).

## Preferred base URL (floating latest)

**https://assets.inkads.poc.singletonsd.com**

`dist/` is the site root (omit `/dist`). Marketing already uses this host.

## Mono mark (e-paper / single-ink)

| Asset | URL |
| --- | --- |
| Icon SVG | `https://assets.inkads.poc.singletonsd.com/svg/icon/icon-mono.svg` |
| Icon SVG (dist mirror) | `…/logo/static/mono/mono.svg` |
| Icon PNG 16–512 | `…/logo/static/mono/{16,32,48,64,128,180,192,256,512}.png` |
| Horizontal lockup SVG | `…/svg/lockup-horizontal/lockup-horizontal-mono.svg` |
| Horizontal lockup (dist) | `…/logo/wordmark/lockup-horizontal/mono/mono.svg` |

Master path: `src/logo/sources/mono.svg` (role 3e). Keep aspect ratio; clear
space ≈ mark height. E-paper producers still output a **packed 1 bpp
framebuffer** — do not expect the device to decode PNG/SVG on chip.

## Favicons (browser chrome on device admin / setup, if not embedded)

| Asset | URL |
| --- | --- |
| Favicon 16 | `…/favicons/favicon-16x16.png` |
| Favicon 32 | `…/favicons/favicon-32x32.png` |
| Favicon ICO | `…/favicons/favicon.ico` |
| Apple touch | `…/favicons/apple-touch-icon.png` |
| SVG mark | `…/svg/icon/icon-favicon.svg` |

## Immutable pins

Floating Pages URLs change when `main` deploys. For reproducible firmware /
renderer builds:

1. **Preferred today:** pin npm `@singleton-sd/inkads-assets@<semver>` and read
   files from the package `dist/` (or `svg/`) tree at build time.
2. **Git pin:** jsDelivr or raw GitHub at a **tag or commit**, not `@main`
   (see root README legacy section).
3. **Pages path convention (not published yet):**  
   `https://assets.inkads.poc.singletonsd.com/releases/<tag>/…`  
   Reserve this shape for historical `dist/` snapshots if CI later mirrors
   release artifacts under `/releases/<tag>/`. Until then, use (1) or (2).

Example npm pin:

```sh
pnpm add @singleton-sd/inkads-assets@0.2.0
# then: node_modules/@singleton-sd/inkads-assets/dist/logo/static/mono/512.png
```

## Out of scope here

Implementing device UI chrome, e-paper packing, or changing firmware to
download marks at runtime. Link back from the firmware README when a consumer
path exists; keep this file as the assets-side contract.

## Related

- [BRAND.md](../BRAND.md) — roles, colors, clear space
- [docs/deployment.md](deployment.md) — Pages / DNS
- [poc-inkads-marketing](https://github.com/singleton-sd/poc-inkads-marketing) — web CDN consumer
- Issue [#6](https://github.com/singleton-sd/poc-inkads-assets/issues/6)
