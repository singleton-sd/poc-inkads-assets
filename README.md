# InkAds brand assets (POC)

SVG masters and PNG exports for the InkAds product mark. Parent brand:
[Singleton SD](https://singletonsd.com).

Design source: recommended system **3a** (icon) + **3b** (horizontal lockup).
See `MANIFEST.json` for the full catalog and usage rules.

> Production build/CDN packaging is tracked in
> [#1](https://github.com/singleton-sd/poc-inkads-assets/issues/1). Until then,
> consumers may load the SVG masters below via a **pinned** jsDelivr URL.

## Consume via CDN (supported now)

Pin a **commit SHA** (not `@main`) so marketing/CI builds stay reproducible:

```text
https://cdn.jsdelivr.net/gh/singleton-sd/poc-inkads-assets@<sha>/svg/<group>/<file>
```

Current `main` tip used by marketing sync scripts:

```text
040d0a0d8e34653b780c0e807867c34c77b07e29
```

### Icons (nav / JSON-LD)

| File | URL path after the pin |
| --- | --- |
| Dark / on black | `/svg/icon/icon-dark.svg` |
| Light / on white | `/svg/icon/icon-light.svg` |
| Mono (e-paper) | `/svg/icon/icon-mono.svg` |
| Favicon simplified | `/svg/icon/icon-favicon.svg` |

Example:

`https://cdn.jsdelivr.net/gh/singleton-sd/poc-inkads-assets@040d0a0d8e34653b780c0e807867c34c77b07e29/svg/icon/icon-dark.svg`

### Horizontal lockups (design doc 3b)

| File | Path |
| --- | --- |
| Dark | `/svg/lockup-horizontal/lockup-horizontal-dark.svg` |
| Light | `/svg/lockup-horizontal/lockup-horizontal-light.svg` |
| Mono | `/svg/lockup-horizontal/lockup-horizontal-mono.svg` |

Raw GitHub URLs also work:

`https://raw.githubusercontent.com/singleton-sd/poc-inkads-assets/<sha>/svg/icon/icon-dark.svg`

## npm package (planned)

Target name: `@singleton-sd/inkads-assets` (public). Not published yet — see #1.
This repo’s `package.json` is still a local PNG-export helper (`inkads-brand-export`).

## Generate PNGs locally

```sh
npm install
npm run generate
```

## Related

- [poc-inkads-marketing](https://github.com/singleton-sd/poc-inkads-marketing) — primary web consumer
- Company blueprint: GitLab `@singleton-sd/assets`
