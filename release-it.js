const isPreRelease = process.env.RELEASE_TYPE === "prerelease";

module.exports = {
  plugins: {
    "@release-it/conventional-changelog": {
      preset: "conventionalcommits",
      infile: "CHANGELOG.md"
    }
  },
  github: {
    release: true,
    assets: ["dist/generated-metadata/*.json"],
    skipChecks: true
  },
  git: {
    requireUpstream: false,
    commit: true,
    commitMessage: "chore(release): bump version to ${version} [skip ci]",
    requireCommits: false,
    requireCommitsFail: false,
    tag: true,
    push: true,
    tagName: "v${version}"
  },
  npm: {
    publish: false
  }
};
