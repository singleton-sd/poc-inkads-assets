# Contributing

## Conventional Commits

Use [Conventional Commits](https://www.conventionalcommits.org/) for commit
messages and PR titles. The next published version is computed from the latest
git tag plus these commits (`feat` → minor, `fix` → patch,
`BREAKING CHANGE` → major).

Do not bump `package.json` or edit `CHANGELOG.md` in a feature PR for the sake
of releasing. The release workflow does that on merge to `main`.

## Releases

On merge to `main` (or `workflow_dispatch`), `.github/workflows/release.yml`
runs `pnpm release:ci` (release-it):

1. Compute the next version from the latest `X.Y.Z` tag plus conventional
   commits. Git tags in this repo are unprefixed (`0.4.0`); GitHub Release
   titles use `vX.Y.Z`.
2. Bump `package.json` and write `CHANGELOG.md`.
3. Commit `chore(release): vX.Y.Z [skip ci]`, tag, and push to `main`.
4. Publish `@singleton-sd/inkads-assets` to npm via Trusted Publishing (OIDC).
   Do not add `NPM_TOKEN`.
5. Create a GitHub Release with the generated notes.

The git push uses the **singleton-release** GitHub App
(`vars.RELEASE_APP_ID` + `secrets.RELEASE_APP_PRIVATE_KEY`), which is on the
default-branch ruleset bypass list. Do not use `GITHUB_TOKEN` or a PAT for
that push — `GITHUB_TOKEN` cannot bypass the CodeRabbit required ruleset
(GH013).

The job is skipped when the head commit message starts with `chore(release):`,
so the release commit does not loop.

Local dry-run: `pnpm release`.
