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
  },
  hooks: {
    "before:release": "pnpm validate && pnpm test && pnpm build",
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
