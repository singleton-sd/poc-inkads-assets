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
Releases (`pnpm release:ci` via `.github/workflows/release.yml`) commit the
version bump and `CHANGELOG.md` to `main` using the **singleton-release**
GitHub App (`vars.RELEASE_APP_ID` + `secrets.RELEASE_APP_PRIVATE_KEY`) so
the push can bypass the CodeRabbit required ruleset. Do not use
`GITHUB_TOKEN` or a PAT for that push. Do not add `NPM_TOKEN` (OIDC Trusted
Publishing). See [CONTRIBUTING.md](CONTRIBUTING.md).

## Related

- [BRAND.md](BRAND.md)
- [docs/logo-asset-workflow.md](docs/logo-asset-workflow.md)
- Issue [#1](https://github.com/singleton-sd/poc-inkads-assets/issues/1)
- Company blueprint: `singleton-sd/design-system/assets`
