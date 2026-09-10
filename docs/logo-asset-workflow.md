# Logo asset workflow (InkAds)

## Masters

1. Update SVG under `src/logo/…` (or OG under `src/og-image/…`).
2. If wordmark/lockup masters use `<text>`, run `pnpm outline:text` (needs
   `fonts/OpenSauceSans-*.otf`).
3. Run `pnpm sync:legacy-svg` so root `svg/` matches (legacy CDN).
4. Run `pnpm validate && pnpm build`.
5. Commit `src/` + synced `svg/` + fonts if changed (never commit `dist/`).

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

- Email / documents packs.
- Point marketing at Pages URLs (`https://assets.inkads.poc.singletonsd.com/…`)
  — see marketing issue #94 / PR.

## npm package

Pages CDN is primary for HTML consumers. `@singleton-sd/inkads-assets` already
publishes via GitHub Actions Trusted Publishing (OIDC) —
`.github/workflows/release.yml` / `pnpm release:ci`. Do not add `NPM_TOKEN`.
