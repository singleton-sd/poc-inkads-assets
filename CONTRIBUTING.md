# Contributing

## Conventional Commits

Use [Conventional Commits](https://www.conventionalcommits.org/) for commit
messages and PR titles. The next published version is computed from the latest
git tag plus these commits (`feat` → minor, `fix` → patch,
`BREAKING CHANGE` → major).

Do not bump `package.json` in a feature PR for the sake of releasing. The
committed version on `main` is not the source of truth; git tags are.

## Releases (tag-only)

Singleton SD repos use **tag-only releases**. The release workflow must never
commit or push to the default branch (no version-bump or `CHANGELOG.md`
commits) and must not use a ruleset bypass.

On merge to `main` (or `workflow_dispatch`):

1. The next version is computed from the latest `X.Y.Z` tag plus conventional
   commits. Git tags in this repo are unprefixed (`0.4.0`); GitHub Release
   titles use `vX.Y.Z`.
2. `package.json` is bumped in the CI workspace only (not committed).
3. `@singleton-sd/inkads-assets` is published to npm via Trusted Publishing
   (OIDC). Do not add `NPM_TOKEN`.
4. Only that version tag is pushed:
   `git push origin refs/tags/<version>`.
5. A GitHub Release is created with notes generated from conventional commits.

The workflow uses the built-in `GITHUB_TOKEN` with `contents: write` (tags +
Releases) and `id-token: write` (npm OIDC). The **CodeRabbit required**
ruleset targets `~DEFAULT_BRANCH` with bypass `never`, so a push of `main`
from Actions is rejected (GH013). Tag refs are outside that branch ruleset;
do not add version tags to a branch ruleset include list.

Release notes live in
[GitHub Releases](https://github.com/singleton-sd/poc-inkads-assets/releases).
`CHANGELOG.md` is kept as a historical record through 0.4.0 and is no longer
updated by the release workflow.

CI only: `pnpm release:ci` via `.github/workflows/release.yml`. Local dry-run:
`pnpm release`.
