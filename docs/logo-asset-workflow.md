# Logo asset workflow (InkAds)

## Masters

1. Update SVG under `src/logo/…` (or OG under `src/og-image/…`).
2. Run `npm run sync:legacy-svg` so root `svg/` matches (legacy CDN).
3. Run `npm run validate && npm run build`.
4. Commit `src/` + synced `svg/` (never commit `dist/`).

## Build outputs

| Dist path | Source |
| --- | --- |
| `favicons/*` | `src/logo/sources/favicon.svg` + `dark.svg` |
| `logo/static/{theme}/{size}.png` | `src/logo/sources/{theme}.svg` |
| `logo/wordmark/{role}/{theme}/*` | wordmark SVG masters (+ PNG widths) |
| `og-image/{theme}/og-default.png` | `src/og-image/…` |
| `svg/**` | full vector mirror for Pages |
| `manifest.json` | SHA-256 inventory of `dist/` |

## CDN

Pages deploys `dist/` to the site root (`config/product.json` → `publicUrl`).
Omit `/dist` from URLs.

Legacy (pinned commit, no Pages required):

```text
https://cdn.jsdelivr.net/gh/singleton-sd/poc-inkads-assets@<sha>/svg/icon/icon-dark.svg
```

## Follow-ups

- Outline lockup `<text>` to paths for deterministic PNG / email.
- Custom CDN host vs `assets.singletonsd.com/inkads/`.
- Email / documents packs.
- npm publish of `@singleton-sd/inkads-assets` (optional; Pages is primary).
