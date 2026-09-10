# Agent working agreements — InkAds assets

Cross-agent instructions for work in `poc-inkads-assets`.

## Scope

This repo owns **InkAds product mark binaries** (SVG masters + generated
favicons / rasters / OG). It is not the Singleton SD company assets package
(`@singleton-sd/assets`).

## Source of truth

- Edit masters under `src/` only.
- Do not hand-edit `dist/`.
- Keep root `svg/` in sync with `src/` via `npm run sync:legacy-svg` (jsDelivr /
  marketing pin compatibility until consumers move to Pages CDN).

## Commits / PRs

- Branch from latest `origin/main` in a dedicated worktree:
  `feat/<issue>-<kebab-title>` (or `fix/` / `docs/`).
- Prefer conventional commits with the GitHub issue: `feat: #1 …`.
- Open a PR for human review; do not merge.

## Build / verify

```sh
pnpm install
pnpm validate
pnpm test
pnpm build
```

CI must leave `src/` and `svg/` unchanged (`git diff` clean after build).
Releases use Trusted Publishing (OIDC) via `.github/workflows/release.yml`
(`pnpm release:ci`) — no long-lived `NPM_TOKEN`.

## Related

- [BRAND.md](BRAND.md)
- [docs/logo-asset-workflow.md](docs/logo-asset-workflow.md)
- Issue [#1](https://github.com/singleton-sd/poc-inkads-assets/issues/1)
- Company blueprint: `singleton-sd/design-system/assets`
