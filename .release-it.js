/**
 * Tag-only releases: never commit or push to the default branch.
 * Version comes from the latest X.Y.Z tag + conventional commits.
 * package.json is bumped in the CI workspace for npm publish only.
 *
 * @typedef {import('release-it').Config} ReleaseItConfig
 * @type {ReleaseItConfig}
 */
export default {
  git: {
    tagName: "${version}",
    tagMatch: "[0-9]*.[0-9]*.[0-9]*",
    requireBranch: "main",
    requireCleanWorkingDir: true,
    requireCommits: true,
    requireCommitsFail: false,
    commit: false,
    push: false,
    tag: true,
  },
  npm: {
    publish: true,
    skipChecks: true, // required for OIDC — npm whoami fails without a static token
    // package.json on main lags the latest tag; git tags are the version source.
    ignoreVersion: true,
  },
  hooks: {
    "before:release": "pnpm validate && pnpm test && pnpm build",
    // after:git:release is skipped when git.push is false. Push the
    // annotated tag immediately before the GitHub Release. release-it
    // interpolates ${version}; $GITHUB_ACTIONS is expanded by the shell.
    // Only push from Actions, and only a strict X.Y.Z tag — never HEAD/main.
    "before:github:release":
      'if [ "$GITHUB_ACTIONS" != true ]; then printf "%s\\n" "Skipping tag push outside GitHub Actions"; exit 0; fi; ' +
      'if ! printf "%s\\n" "${version}" | grep -Eq "^[0-9]+\\.[0-9]+\\.[0-9]+$"; then printf "%s\\n" "Refusing to push non X.Y.Z tag: ${version}" >&2; exit 1; fi; ' +
      'git push origin "refs/tags/${version}"',
  },
  github: {
    release: true,
    releaseName: "v${version}",
    /**
     * @param {{ changelog?: string, version: string, name: string }} ctx
     */
    releaseNotes({ changelog, version, name }) {
      const notes = (changelog ?? "").trim();
      const npmUrl = `https://www.npmjs.com/package/${name}/v/${version}`;
      return `${notes}\n\n📦 [\`${name}@${version}\`](${npmUrl})\n`;
    },
  },
  plugins: {
    "@release-it/conventional-changelog": {
      infile: false,
      preset: {
        name: "conventionalcommits",
        compareUrlFormat:
          "{{host}}/{{owner}}/{{repository}}/compare/{{previousTag}}...{{currentTag}}",
      },
    },
  },
};
